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

    // If no subscription ID, nothing to sync
    if (!restaurant.stripe_subscription_id) {
      return NextResponse.json({ message: "No subscription to sync" });
    }

    // Get latest subscription data from Stripe
    const subscription = await stripe.subscriptions.retrieve(
      restaurant.stripe_subscription_id
    );

    // Update database with latest info
    const { error: updateError } = await supabase
      .from("restaurants")
      .update({
        subscription_status: subscription.status,
        subscription_plan: subscription.items.data[0].price.lookup_key || "pro",
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
      .eq("id", restaurant.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      message: "Subscription synced successfully",
      status: subscription.status,
      plan: subscription.items.data[0].price.lookup_key || "pro",
    });
  } catch (error) {
    console.error("Sync subscription error:", error);
    return NextResponse.json(
      { error: "Failed to sync subscription" },
      { status: 500 }
    );
  }
}
