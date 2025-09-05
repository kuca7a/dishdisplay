/**
 * Environment Configuration
 * Centralized configuration management with validation
 */

import { z } from "zod";

// Environment schema validation
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Domain Configuration
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),

  // Database (Supabase)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Invalid Supabase URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "Supabase anon key is required"),
  SUPABASE_SERVICE_KEY: z.string().min(1, "Supabase service key is required"),

  // Authentication (Auth0) - Optional for build, required for runtime
  AUTH0_SECRET: z
    .string()
    .min(32, "Auth0 secret must be at least 32 characters")
    .optional(),
  AUTH0_BASE_URL: z.string().url("Invalid Auth0 base URL").optional(),
  AUTH0_ISSUER_BASE_URL: z.string().url("Invalid Auth0 issuer URL").optional(),
  AUTH0_CLIENT_ID: z.string().min(1, "Auth0 client ID is required").optional(),
  AUTH0_CLIENT_SECRET: z.string().min(1, "Auth0 client secret is required").optional(),

  // Payments (Stripe)
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z
    .string()
    .min(1, "Stripe publishable key is required"),
  STRIPE_SECRET_KEY: z.string().min(1, "Stripe secret key is required"),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_ID_PRO_MONTHLY: z.string().optional(),
  STRIPE_PRICE_ID_PRO_YEARLY: z.string().optional(),

  // Security
  JWT_SECRET: z
    .string()
    .min(32, "JWT secret must be at least 32 characters")
    .optional(),

  // Monitoring (Optional)
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  MONITORING_ENDPOINT: z.string().url().optional(),
  MONITORING_API_KEY: z.string().optional(),

  // Feature Flags
  FEATURE_ANALYTICS_ENABLED: z
    .string()
    .optional()
    .default("true")
    .transform((val) => val === "true"),
  FEATURE_REVIEWS_ENABLED: z
    .string()
    .optional()
    .default("true")
    .transform((val) => val === "true"),
  FEATURE_LEADERBOARD_ENABLED: z
    .string()
    .optional()
    .default("true")
    .transform((val) => val === "true"),
  FEATURE_STRIPE_ENABLED: z
    .string()
    .optional()
    .default("true")
    .transform((val) => val === "true"),

  // Performance
  CACHE_TTL_RESTAURANTS: z
    .string()
    .optional()
    .default("1800")
    .transform(Number),
  CACHE_TTL_MENU_ITEMS: z.string().optional().default("300").transform(Number),
  CACHE_TTL_ANALYTICS: z.string().optional().default("600").transform(Number),

  // Rate Limiting
  RATE_LIMIT_MAX_REQUESTS: z
    .string()
    .optional()
    .default("100")
    .transform(Number),
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .optional()
    .default("900000")
    .transform(Number),
});

// Parse and validate environment variables
function parseEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues
        .map((err: z.ZodIssue) => `${err.path.join(".")}: ${err.message}`)
        .join("\n");

      throw new Error(
        `❌ Invalid environment configuration:\n${missingVars}\n\n` +
          `Please check your .env.local file and ensure all required variables are set.`
      );
    }
    throw error;
  }
}

// Export validated environment configuration
export const env = parseEnv();

// Utility functions
export const isProduction = env.NODE_ENV === "production";
export const isDevelopment = env.NODE_ENV === "development";
export const isTest = env.NODE_ENV === "test";

// Database configuration
export const database = {
  url: env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  serviceKey: env.SUPABASE_SERVICE_KEY,
} as const;

// Auth configuration
export const auth = {
  secret: env.AUTH0_SECRET || "",
  baseUrl: env.AUTH0_BASE_URL || "",
  issuerBaseUrl: env.AUTH0_ISSUER_BASE_URL || "",
  clientId: env.AUTH0_CLIENT_ID || "",
  clientSecret: env.AUTH0_CLIENT_SECRET || "",
} as const;

// Stripe configuration
export const stripe = {
  publishableKey: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  secretKey: env.STRIPE_SECRET_KEY,
  webhookSecret: env.STRIPE_WEBHOOK_SECRET,
  priceIds: {
    proMonthly: env.STRIPE_PRICE_ID_PRO_MONTHLY,
    proYearly: env.STRIPE_PRICE_ID_PRO_YEARLY,
  },
} as const;

// App configuration
export const app = {
  baseUrl:
    env.NEXT_PUBLIC_BASE_URL ||
    (isDevelopment ? "http://localhost:3000" : "https://dishdisplay.com"),
  jwtSecret: env.JWT_SECRET || "fallback-secret-for-development",
} as const;

// Feature flags
export const features = {
  analytics: env.FEATURE_ANALYTICS_ENABLED,
  reviews: env.FEATURE_REVIEWS_ENABLED,
  leaderboard: env.FEATURE_LEADERBOARD_ENABLED,
  stripe: env.FEATURE_STRIPE_ENABLED,
} as const;

// Cache configuration
export const cache = {
  ttl: {
    restaurants: env.CACHE_TTL_RESTAURANTS,
    menuItems: env.CACHE_TTL_MENU_ITEMS,
    analytics: env.CACHE_TTL_ANALYTICS,
  },
} as const;

// Rate limiting configuration
export const rateLimit = {
  maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  windowMs: env.RATE_LIMIT_WINDOW_MS,
} as const;

// Monitoring configuration
export const monitoring = {
  sentryDsn: env.NEXT_PUBLIC_SENTRY_DSN,
  endpoint: env.MONITORING_ENDPOINT,
  apiKey: env.MONITORING_API_KEY,
  enabled: isProduction,
} as const;

// Validate critical production requirements
export function validateProductionConfig() {
  if (!isProduction) return;

  const productionRequirements = [
    {
      key: "NEXT_PUBLIC_BASE_URL",
      value: env.NEXT_PUBLIC_BASE_URL,
      message: "Base URL must be set in production",
    },
    {
      key: "JWT_SECRET",
      value: env.JWT_SECRET,
      message: "JWT secret must be set in production",
    },
    {
      key: "AUTH0_SECRET",
      value: env.AUTH0_SECRET,
      message: "Auth0 secret must be set in production",
    },
    {
      key: "AUTH0_CLIENT_ID",
      value: env.AUTH0_CLIENT_ID,
      message: "Auth0 client ID must be set in production",
    },
    {
      key: "AUTH0_CLIENT_SECRET",
      value: env.AUTH0_CLIENT_SECRET,
      message: "Auth0 client secret must be set in production",
    },
    {
      key: "STRIPE_WEBHOOK_SECRET",
      value: env.STRIPE_WEBHOOK_SECRET,
      message: "Stripe webhook secret must be set in production",
    },
  ];

  const missingRequirements = productionRequirements
    .filter((req) => !req.value)
    .map((req) => `${req.key}: ${req.message}`);

  if (missingRequirements.length > 0) {
    throw new Error(
      `❌ Missing production requirements:\n${missingRequirements.join("\n")}`
    );
  }
}

// Export environment status for debugging
export function getEnvironmentStatus() {
  return {
    environment: env.NODE_ENV,
    baseUrl: app.baseUrl,
    features: features,
    hasDatabase: !!(database.url && database.anonKey),
    hasAuth: !!(auth.clientId && auth.clientSecret),
    hasStripe: !!(stripe.publishableKey && stripe.secretKey),
    hasMonitoring: !!monitoring.sentryDsn,
  };
}

// Validate environment on import (only in production runtime, not build)
if (isProduction && process.env.NEXT_PHASE !== "phase-production-build") {
  validateProductionConfig();
}
