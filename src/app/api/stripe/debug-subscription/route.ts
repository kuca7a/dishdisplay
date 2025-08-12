import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get("userEmail");

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email is required" },
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

    // Get restaurant data from database
    const { data: restaurant, error } = await supabase
      .from("restaurants")
      .select("*")
      .eq("owner_email", userEmail)
      .single();

    if (error || !restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    let stripeData = null;
    let allSubscriptions = null;
    if (restaurant.stripe_customer_id) {
      try {
        // Get all subscriptions for this customer
        const subscriptions = await stripe.subscriptions.list({
          customer: restaurant.stripe_customer_id,
          limit: 10,
        });
        allSubscriptions = subscriptions.data.map((sub) => ({
          id: sub.id,
          status: sub.status,
          created: sub.created,
          current_period_end: sub.current_period_end,
          price_id: sub.items.data[0]?.price?.id,
          amount: sub.items.data[0]?.price?.unit_amount,
        }));

        // Get the specific subscription stored in database
        if (restaurant.stripe_subscription_id) {
          stripeData = await stripe.subscriptions.retrieve(
            restaurant.stripe_subscription_id
          );
        }
      } catch (stripeError) {
        console.error("Stripe error:", stripeError);
      }
    }

    return NextResponse.json({
      database: {
        subscription_status: restaurant.subscription_status,
        subscription_plan: restaurant.subscription_plan,
        stripe_subscription_id: restaurant.stripe_subscription_id,
        stripe_customer_id: restaurant.stripe_customer_id,
      },
      stripe: stripeData
        ? {
            status: stripeData.status,
            plan:
              stripeData.items.data[0]?.price?.lookup_key ||
              stripeData.items.data[0]?.price?.id,
            current_period_end: stripeData.current_period_end,
            created: stripeData.created,
            price_id: stripeData.items.data[0]?.price?.id,
            amount: stripeData.items.data[0]?.price?.unit_amount,
          }
        : null,
      allSubscriptions: allSubscriptions,
    });
  } catch (error) {
    console.error("Debug subscription error:", error);
    return NextResponse.json(
      { error: "Failed to debug subscription" },
      { status: 500 }
    );
  }
}
