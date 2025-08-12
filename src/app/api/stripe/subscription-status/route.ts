import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

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

    // Get restaurant with subscription info
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

    const subscriptionData = {
      plan: restaurant.subscription_plan || "free",
      status: restaurant.subscription_status || "inactive",
      customerId: restaurant.stripe_customer_id,
      subscriptionId: restaurant.stripe_subscription_id,
      trialEnd: restaurant.trial_end_date,
      subscriptionEnd: restaurant.subscription_end_date,
    };

    return NextResponse.json(subscriptionData);
  } catch (error) {
    console.error("Get subscription error:", error);
    return NextResponse.json(
      { error: "Failed to get subscription" },
      { status: 500 }
    );
  }
}
