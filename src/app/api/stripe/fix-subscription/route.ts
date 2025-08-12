import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const { userEmail } = await request.json();

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

    if (!restaurant.stripe_customer_id) {
      return NextResponse.json(
        { error: "No Stripe customer ID found" },
        { status: 400 }
      );
    }

    // Get all subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: restaurant.stripe_customer_id,
      limit: 10,
    });

    // Find the most recent active subscription
    const activeSubscription = subscriptions.data.find(
      (sub) => sub.status === "active"
    );

    if (!activeSubscription) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    // Update database to point to the active subscription
    const { error: updateError } = await supabase
      .from("restaurants")
      .update({
        stripe_subscription_id: activeSubscription.id,
        subscription_status: activeSubscription.status,
        subscription_plan: "pro",
        subscription_start_date: new Date(
          activeSubscription.created * 1000
        ).toISOString(),
        subscription_end_date: activeSubscription.current_period_end
          ? new Date(activeSubscription.current_period_end * 1000).toISOString()
          : null,
        trial_end_date: activeSubscription.trial_end
          ? new Date(activeSubscription.trial_end * 1000).toISOString()
          : null,
      })
      .eq("id", restaurant.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      message: "Successfully updated to active subscription",
      oldSubscriptionId: restaurant.stripe_subscription_id,
      newSubscriptionId: activeSubscription.id,
      status: activeSubscription.status,
    });
  } catch (error) {
    console.error("Fix subscription error:", error);
    return NextResponse.json(
      { error: "Failed to fix subscription" },
      { status: 500 }
    );
  }
}
