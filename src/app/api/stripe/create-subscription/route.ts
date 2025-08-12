import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { subscriptionService } from "@/lib/stripe";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    // Get user email from request body (sent from authenticated client)
    const { userEmail, priceId, paymentMethodId } = await request.json();

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 401 }
      );
    }

    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 500 }
      );
    }

    // Get restaurant
    const { data: restaurant, error: restaurantError } = await supabase
      .from("restaurants")
      .select("*")
      .eq("owner_email", userEmail)
      .single();

    if (restaurantError || !restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    let customerId = restaurant.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await subscriptionService.createCustomer(
        userEmail,
        restaurant.name
      );
      customerId = customer.id;

      // Update restaurant with customer ID
      await supabase
        .from("restaurants")
        .update({ stripe_customer_id: customerId })
        .eq("id", restaurant.id);
    }

    // Create subscription
    const subscription = await subscriptionService.createSubscription(
      customerId,
      priceId,
      paymentMethodId
    );

    // Update restaurant with subscription details
    await supabase
      .from("restaurants")
      .update({
        stripe_subscription_id: subscription.id,
        subscription_status: subscription.status,
        subscription_plan: priceId.includes("yearly") ? "pro" : "pro",
        subscription_start_date: new Date(
          subscription.created * 1000
        ).toISOString(),
        trial_end_date: subscription.trial_end
          ? new Date(subscription.trial_end * 1000).toISOString()
          : null,
      })
      .eq("id", restaurant.id);

    // Properly type the latest invoice and payment intent
    const latestInvoice = subscription.latest_invoice as Stripe.Invoice;
    const clientSecret =
      latestInvoice?.payment_intent &&
      typeof latestInvoice.payment_intent !== "string"
        ? (latestInvoice.payment_intent as Stripe.PaymentIntent).client_secret
        : null;

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret,
      status: subscription.status,
    });
  } catch (error) {
    console.error("Create subscription error:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
