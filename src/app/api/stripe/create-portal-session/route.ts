import { NextRequest, NextResponse } from "next/server";
import { subscriptionService } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const { customerId, returnUrl } = await request.json();

    if (!customerId) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      );
    }

    try {
      const session = await subscriptionService.createPortalSession(
        customerId,
        returnUrl ||
          `${
            process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
          }/profile/subscription`
      );

      return NextResponse.json({ url: session.url });
    } catch (stripeError: unknown) {
      // Handle specific Stripe billing portal configuration error
      const isStripeConfigError =
        stripeError instanceof Error &&
        stripeError.message?.includes("configuration") &&
        stripeError.message?.includes("portal");

      if (isStripeConfigError) {
        // Try to create a basic portal configuration automatically
        try {
          await subscriptionService.createPortalConfiguration();
          
          // Retry creating the session
          const session = await subscriptionService.createPortalSession(
            customerId,
            returnUrl ||
              `${
                process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
              }/profile/subscription`
          );

          return NextResponse.json({ url: session.url });
        } catch (configError) {
          console.error("Failed to create portal configuration:", configError);
          return NextResponse.json(
            {
              error: "Billing portal not configured",
              message:
                "Please configure the Customer Portal in Stripe Dashboard manually.",
              configUrl:
                "https://dashboard.stripe.com/test/settings/billing/portal",
            },
            { status: 400 }
          );
        }
      }
      throw stripeError;
    }
  } catch (error) {
    console.error("Create portal session error:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
