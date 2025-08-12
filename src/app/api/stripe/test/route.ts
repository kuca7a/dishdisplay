import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function GET() {
  try {
    // Simple test to verify Stripe connection
    const prices = await stripe.prices.list({ limit: 3 });

    return NextResponse.json({
      success: true,
      message: "Stripe connection successful",
      priceCount: prices.data.length,
    });
  } catch (error) {
    console.error("Stripe test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
