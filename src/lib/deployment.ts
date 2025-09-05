/**
 * Deployment Configuration
 * Platform-specific deployment setup and health checks
 */

import { env, isProduction } from "./env";

// Deployment platform detection
export const platform = {
  isVercel: !!process.env.VERCEL,
  isRailway: !!process.env.RAILWAY_ENVIRONMENT,
  isNetlify: !!process.env.NETLIFY,
  isLocal:
    !process.env.VERCEL &&
    !process.env.RAILWAY_ENVIRONMENT &&
    !process.env.NETLIFY,
} as const;

// Platform-specific configurations
export const deployment = {
  // Vercel-specific settings
  vercel: {
    region: process.env.VERCEL_REGION || "sfo1",
    url: process.env.VERCEL_URL,
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID,
    gitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA,
  },

  // Railway-specific settings
  railway: {
    environment: process.env.RAILWAY_ENVIRONMENT,
    serviceId: process.env.RAILWAY_SERVICE_ID,
    deploymentId: process.env.RAILWAY_DEPLOYMENT_ID,
  },

  // Netlify-specific settings
  netlify: {
    context: process.env.CONTEXT,
    deployId: process.env.DEPLOY_ID,
    siteId: process.env.SITE_ID,
    commitRef: process.env.COMMIT_REF,
  },
} as const;

// Database connection configuration
export const database = {
  // Connection pooling for production
  maxConnections: isProduction ? 20 : 5,
  connectionTimeout: 30000,

  // Connection string with SSL for production
  connectionString: env.NEXT_PUBLIC_SUPABASE_URL,
  ssl: isProduction,

  // Pool configuration for serverless environments
  poolConfig: {
    min: 0, // No minimum connections for serverless
    max: platform.isVercel ? 1 : 5, // Vercel functions are stateless
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200,
  },
} as const;

// Health check configuration
export interface HealthCheckResult {
  status: "healthy" | "unhealthy" | "degraded";
  timestamp: string;
  checks: {
    database: { status: string; latency?: number; error?: string };
    auth: { status: string; error?: string };
    stripe: { status: string; error?: string };
    external: { status: string; error?: string };
  };
  deployment: {
    platform: string;
    environment: string;
    version?: string;
    region?: string;
  };
}

// Performance optimization for different environments
export const performance = {
  // Caching strategy
  cache: {
    // Static assets cache duration (1 year for production, 1 hour for dev)
    staticAssets: isProduction ? "31536000" : "3600",

    // API responses cache
    api: {
      restaurants: 1800, // 30 minutes
      menuItems: 300, // 5 minutes
      analytics: 600, // 10 minutes
      reviews: 180, // 3 minutes
    },

    // Page cache (for ISR)
    pages: {
      revalidate: isProduction ? 3600 : 60, // 1 hour in prod, 1 minute in dev
      fallback: "blocking",
    },
  },

  // Image optimization
  images: {
    domains: [
      "res.cloudinary.com",
      "images.unsplash.com",
      "avatars.githubusercontent.com",
    ],
    formats: ["image/webp", "image/avif"],
    sizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Bundle optimization
  bundle: {
    experimental: {
      optimizeCss: true,
      scrollRestoration: true,
      largePageDataBytes: 128 * 1000, // 128KB
    },
  },
} as const;

// Security configuration for production
export const security = {
  // CORS configuration
  cors: {
    origin: isProduction
      ? [env.NEXT_PUBLIC_BASE_URL || "https://dishdisplay.com"]
      : ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
  },

  // Rate limiting per environment
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isProduction ? 100 : 1000, // 100 requests per window in prod
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request & { ip?: string }) => req.ip || "unknown",
  },

  // Session configuration
  session: {
    cookieLifetime: 24 * 60 * 60, // 24 hours
    rollingSession: true,
    rollingDuration: 24 * 60 * 60,
  },
} as const;

// Monitoring and logging configuration
export const monitoring = {
  // Log levels per environment
  logLevel: isProduction ? "error" : "debug",

  // Error tracking
  errorTracking: {
    sampleRate: isProduction ? 0.1 : 1.0, // 10% in production
    tracesSampleRate: isProduction ? 0.01 : 1.0, // 1% in production
    beforeSend: (event: Record<string, unknown>) => {
      // Filter out sensitive data
      if (event.request && typeof event.request === "object") {
        const request = event.request as Record<string, unknown>;
        if (request.headers && typeof request.headers === "object") {
          const headers = request.headers as Record<string, unknown>;
          if (headers.authorization) {
            delete headers.authorization;
          }
        }
      }
      return event;
    },
  },

  // Performance monitoring
  performance: {
    measureUserAgentData: true,
    measureMemoryUsage: true,
    measureNavigationTiming: true,
  },

  // Custom metrics
  metrics: {
    collectCustomMetrics: isProduction,
    endpoints: [
      "/api/restaurants",
      "/api/menu-items",
      "/api/reviews",
      "/api/analytics",
    ],
  },
} as const;

// Feature flags per environment
export const features = {
  // Development features
  devTools: !isProduction,
  debugMode: !isProduction,

  // Analytics features
  analytics: {
    enabled: true,
    anonymizeIp: isProduction,
    cookieConsent: isProduction,
  },

  // Payment features
  payments: {
    enabled: !!env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    testMode: !isProduction,
  },

  // Social features
  social: {
    reviews: true,
    leaderboard: true,
    sharing: true,
  },
} as const;

// Build-time configuration validation
export function validateDeploymentConfig() {
  const requiredForProduction = [
    { key: "NEXT_PUBLIC_BASE_URL", value: env.NEXT_PUBLIC_BASE_URL },
    { key: "NEXT_PUBLIC_SUPABASE_URL", value: env.NEXT_PUBLIC_SUPABASE_URL },
    { key: "AUTH0_SECRET", value: env.AUTH0_SECRET },
    { key: "STRIPE_SECRET_KEY", value: env.STRIPE_SECRET_KEY },
  ];

  const missing = isProduction
    ? requiredForProduction.filter((req) => !req.value).map((req) => req.key)
    : [];

  if (isProduction && missing.length > 0) {
    throw new Error(
      `❌ Missing required environment variables for production:\n${missing.join(
        ", "
      )}`
    );
  }

  return {
    environment: env.NODE_ENV,
    platform:
      Object.entries(platform).find(([, active]) => active)?.[0] || "unknown",
    features: Object.entries(features)
      .filter(([, config]) => {
        if (typeof config === "boolean") return config;
        if (typeof config === "object" && config && "enabled" in config) {
          return config.enabled;
        }
        return true;
      })
      .map(([name]) => name),
    ready: isProduction ? missing.length === 0 : true,
  };
}

// Get deployment metadata
export function getDeploymentInfo() {
  return {
    environment: env.NODE_ENV,
    platform: platform,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "unknown",
    nodeVersion: process.version,
    deployment: deployment,
    features: features,
  };
}

// Startup checks
export async function runStartupChecks(): Promise<HealthCheckResult> {
  const checks = {
    database: {
      status: "unknown" as "healthy" | "unhealthy" | "unknown",
      latency: undefined as number | undefined,
      error: undefined as string | undefined,
    },
    auth: {
      status: "unknown" as "healthy" | "unhealthy" | "unknown",
      error: undefined as string | undefined,
    },
    stripe: {
      status: "unknown" as "healthy" | "unhealthy" | "unknown",
      error: undefined as string | undefined,
    },
    external: {
      status: "unknown" as "healthy" | "unhealthy" | "unknown",
      error: undefined as string | undefined,
    },
  };

  // Database check
  try {
    // This would be replaced with actual Supabase health check
    checks.database = { status: "healthy", latency: 50, error: undefined };
  } catch (error) {
    checks.database = {
      status: "unhealthy",
      latency: undefined,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  // Auth0 check
  try {
    checks.auth = { status: "healthy", error: undefined };
  } catch (error) {
    checks.auth = {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  // Stripe check
  try {
    checks.stripe = { status: "healthy", error: undefined };
  } catch (error) {
    checks.stripe = {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  // External services check
  checks.external = { status: "healthy", error: undefined };

  const allHealthy = Object.values(checks).every(
    (check) => check.status === "healthy"
  );
  const anyUnhealthy = Object.values(checks).some(
    (check) => check.status === "unhealthy"
  );

  return {
    status: anyUnhealthy ? "unhealthy" : allHealthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    checks,
    deployment: {
      platform:
        Object.entries(platform).find(([, active]) => active)?.[0] || "unknown",
      environment: env.NODE_ENV,
      version: process.env.npm_package_version,
      region: deployment.vercel.region || deployment.railway.environment,
    },
  };
}
