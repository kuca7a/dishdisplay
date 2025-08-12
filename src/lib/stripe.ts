import Stripe from "stripe";

// Initialize Stripe with secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey && process.env.NODE_ENV !== "development") {
  console.warn("STRIPE_SECRET_KEY environment variable is not set");
}

export const stripe = new Stripe(stripeSecretKey || "sk_test_placeholder", {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

// Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  priceIds: {
    proMonthly:
      process.env.STRIPE_PRICE_ID_PRO_MONTHLY ||
      "price_1RuwrXAluVLbiFnm14DNsfhz",
    proYearly:
      process.env.STRIPE_PRICE_ID_PRO_YEARLY ||
      "price_1RuwrkAluVLbiFnmfYLbQVVC",
  },
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
};

// Subscription service
export const subscriptionService = {
  // Create customer
  async createCustomer(email: string, name: string): Promise<Stripe.Customer> {
    return await stripe.customers.create({
      email,
      name,
      metadata: {
        app: "dishdisplay",
      },
    });
  },

  // Create subscription with trial
  async createSubscription(
    customerId: string,
    priceId: string,
    paymentMethodId?: string
  ): Promise<Stripe.Subscription> {
    const subscriptionData: Stripe.SubscriptionCreateParams = {
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
      // trial_period_days: 1, // No trial for testing
    };

    if (paymentMethodId) {
      subscriptionData.default_payment_method = paymentMethodId;
    }

    return await stripe.subscriptions.create(subscriptionData);
  },

  // Update subscription
  async updateSubscription(
    subscriptionId: string,
    priceId: string
  ): Promise<Stripe.Subscription> {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    return await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: priceId,
        },
      ],
      proration_behavior: "create_prorations",
    });
  },

  // Cancel subscription
  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd = true
  ): Promise<Stripe.Subscription> {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: cancelAtPeriodEnd,
    });
  },

  // Get subscription details
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["latest_invoice", "customer", "default_payment_method"],
    });
  },

  // Create payment intent for one-time payments
  async createPaymentIntent(
    amount: number,
    currency = "gbp",
    customerId?: string
  ): Promise<Stripe.PaymentIntent> {
    return await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customerId,
      setup_future_usage: "off_session",
    });
  },

  // Create setup intent for saving payment methods
  async createSetupIntent(customerId: string): Promise<Stripe.SetupIntent> {
    return await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
      usage: "off_session",
    });
  },

  // Get customer portal URL
  async createPortalSession(
    customerId: string,
    returnUrl: string
  ): Promise<Stripe.BillingPortal.Session> {
    return await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  },

  // Create portal configuration
  async createPortalConfiguration(): Promise<Stripe.BillingPortal.Configuration> {
    return await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: "DishDisplay - Manage your subscription",
      },
      features: {
        subscription_cancel: {
          enabled: true,
          mode: "at_period_end",
        },
        subscription_update: {
          enabled: true,
          default_allowed_updates: ["price"],
          proration_behavior: "create_prorations",
        },
        payment_method_update: {
          enabled: true,
        },
        invoice_history: {
          enabled: true,
        },
      },
    });
  },
};

// Webhook helpers
export const webhookHelpers = {
  constructEvent(payload: string | Buffer, signature: string): Stripe.Event {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      STRIPE_CONFIG.webhookSecret
    );
  },

  // Process subscription events
  async handleSubscriptionEvent(
    subscription: Stripe.Subscription
  ): Promise<void> {
    // This will be implemented to update database
    console.log("Processing subscription event:", subscription.id);
  },

  // Process invoice events
  async handleInvoiceEvent(invoice: Stripe.Invoice): Promise<void> {
    // This will be implemented to update database
    console.log("Processing invoice event:", invoice.id);
  },
};

// Plan validation
export const planLimits = {
  free: {
    maxMenuItems: 10,
    maxQRCodes: 1,
    analytics: false,
    customBranding: false,
  },
  pro: {
    maxMenuItems: -1, // unlimited
    maxQRCodes: -1, // unlimited
    analytics: true,
    customBranding: true,
  },
};

export const checkPlanLimit = (
  plan: string,
  feature: keyof typeof planLimits.free
): boolean | number => {
  const limits = planLimits[plan as keyof typeof planLimits] || planLimits.free;
  return limits[feature];
};
