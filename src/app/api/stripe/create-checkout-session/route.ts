import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const { userEmail, priceId } = await request.json();

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
      const customer = await stripe.customers.create({
        email: userEmail,
        name: restaurant.name,
        metadata: {
          restaurant_id: restaurant.id,
          app: "dishdisplay",
        },
      });
      customerId = customer.id;

      // Update restaurant with customer ID
      await supabase
        .from("restaurants")
        .update({ stripe_customer_id: customerId })
        .eq("id", restaurant.id);
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/profile/subscription?success=true`,
      cancel_url: `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/profile/subscription?canceled=true`,
      subscription_data: {
        // trial_period_days: 0, // Remove this - can't be 0, and we want immediate payment for testing
        metadata: {
          restaurant_id: restaurant.id,
        },
      },
      metadata: {
        restaurant_id: restaurant.id,
        user_email: userEmail,
      },
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Create checkout session error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
