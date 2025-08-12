import { NextRequest, NextResponse } from "next/server";
import { webhookHelpers } from "@/lib/stripe";
import { getSupabaseClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const event = webhookHelpers.constructEvent(body, signature);

    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 500 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;

        // Update restaurant subscription status
        await supabase
          .from("restaurants")
          .update({
            subscription_status: subscription.status,
            subscription_start_date: new Date(
              subscription.created * 1000
            ).toISOString(),
            subscription_end_date: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000).toISOString()
              : null,
            trial_end_date: subscription.trial_end
              ? new Date(subscription.trial_end * 1000).toISOString()
              : null,
          })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;

        // Update restaurant to free plan
        await supabase
          .from("restaurants")
          .update({
            subscription_status: "canceled",
            subscription_plan: "free",
            subscription_end_date: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;

        // Create payment record
        if (invoice.subscription) {
          await supabase.from("payments").insert([
            {
              stripe_invoice_id: invoice.id,
              amount: invoice.amount_paid,
              currency: invoice.currency,
              status: "succeeded",
              description: `Subscription payment for ${invoice.lines.data[0]?.description}`,
            },
          ]);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;

        // Handle failed payment
        if (invoice.subscription) {
          await supabase
            .from("restaurants")
            .update({ subscription_status: "past_due" })
            .eq("stripe_subscription_id", invoice.subscription);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  }
}
