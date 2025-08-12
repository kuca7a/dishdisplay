import { useEffect, useState, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export interface Subscription {
  plan: "free" | "pro";
  status:
    | "active"
    | "inactive"
    | "canceled"
    | "past_due"
    | "unpaid"
    | "incomplete"
    | "incomplete_expired"
    | "trialing";
  customerId?: string;
  subscriptionId?: string;
  trialEnd?: string;
  subscriptionEnd?: string;
  loading?: boolean;
  error?: string;
}

export const useSubscription = () => {
  const { user, isAuthenticated } = useAuth0();
  const [subscription, setSubscription] = useState<Subscription>({
    plan: "free",
    status: "inactive",
    loading: true,
  });

  const fetchSubscriptionStatus = useCallback(async () => {
    if (!user?.email) return;

    try {
      setSubscription((prev: Subscription) => ({
        ...prev,
        loading: true,
        error: undefined,
      }));

      const response = await fetch(
        `/api/stripe/subscription-status?userEmail=${encodeURIComponent(
          user.email
        )}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch subscription");
      }

      setSubscription({
        ...data,
        loading: false,
      });
    } catch (error) {
      setSubscription((prev: Subscription) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }));
    }
  }, [user?.email]);

  const createSubscription = async (
    priceId: string,
    paymentMethodId?: string
  ) => {
    if (!user?.email) throw new Error("User not authenticated");

    const response = await fetch("/api/stripe/create-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userEmail: user.email,
        priceId,
        paymentMethodId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to create subscription");
    }

    // Refresh subscription status after creation
    await fetchSubscriptionStatus();

    return data;
  };

  const openBillingPortal = async () => {
    if (!subscription.customerId) {
      throw new Error("No customer ID found");
    }

    // Always use dynamic portal sessions - they don't require email verification
    const response = await fetch("/api/stripe/create-portal-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: subscription.customerId,
        returnUrl: window.location.href,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to create portal session");
    }

    // Redirect to Stripe Customer Portal
    window.location.href = data.url;
  };

  const isFeatureAvailable = (feature: string): boolean => {
    if (subscription.plan === "pro" && subscription.status === "active") {
      return true;
    }

    // Free plan limits
    switch (feature) {
      case "unlimited_menu_items":
        return false;
      case "analytics":
        return false;
      case "custom_branding":
        return false;
      default:
        return true; // Basic features available
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      fetchSubscriptionStatus();
    }
  }, [isAuthenticated, user?.email, fetchSubscriptionStatus]);

  return {
    subscription,
    createSubscription,
    openBillingPortal,
    isFeatureAvailable,
    refetch: fetchSubscriptionStatus,
  };
};
