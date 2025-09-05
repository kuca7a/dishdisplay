import { NextRequest, NextResponse } from "next/server";

interface RateLimitConfig {
  max: number; // Maximum number of requests
  windowMs: number; // Time window in milliseconds
  message?: string;
  skipSuccessfulRequests?: boolean;
}

// In-memory store for rate limiting (use Redis in production)
const requests = new Map<string, { count: number; resetTime: number }>();

// Default configuration
const DEFAULT_CONFIG: RateLimitConfig = {
  max: 100, // 100 requests
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: "Too many requests, please try again later.",
  skipSuccessfulRequests: false,
};

export function rateLimit(config: Partial<RateLimitConfig> = {}) {
  const options = { ...DEFAULT_CONFIG, ...config };

  return async (request: NextRequest): Promise<NextResponse | null> => {
    // Get client identifier (IP address or user ID)
    const identifier = getClientIdentifier(request);

    // Clean up expired entries
    cleanupExpiredEntries();

    const now = Date.now();

    let requestData = requests.get(identifier);

    if (!requestData || requestData.resetTime <= now) {
      // Create new window
      requestData = {
        count: 1,
        resetTime: now + options.windowMs,
      };
      requests.set(identifier, requestData);
      return null; // Allow request
    }

    if (requestData.count >= options.max) {
      // Rate limit exceeded
      const resetTime = Math.ceil((requestData.resetTime - now) / 1000);

      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: options.message,
          retryAfter: resetTime,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": options.max.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": requestData.resetTime.toString(),
            "Retry-After": resetTime.toString(),
          },
        }
      );
    }

    // Increment request count
    requestData.count++;
    requests.set(identifier, requestData);

    return null; // Allow request
  };
}

function getClientIdentifier(request: NextRequest): string {
  // Try to get user ID from auth header first
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    try {
      // Extract user ID from JWT token (simplified)
      const token = authHeader.replace("Bearer ", "");
      // In a real implementation, you'd decode the JWT and extract user ID
      return `user:${token.slice(-10)}`; // Use last 10 chars as identifier
    } catch {
      // Fall back to IP if token parsing fails
    }
  }

  // Fall back to IP address
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded ? forwarded.split(",")[0] : realIp || "unknown";
  return `ip:${ip}`;
}

function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, data] of requests.entries()) {
    if (data.resetTime <= now) {
      requests.delete(key);
    }
  }
}

// Specific rate limiters for different endpoints
export const apiRateLimit = rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
});

export const authRateLimit = rateLimit({
  max: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes for auth attempts
  message: "Too many authentication attempts, please try again later.",
});

export const paymentRateLimit = rateLimit({
  max: 10,
  windowMs: 60 * 60 * 1000, // 1 hour for payment attempts
  message: "Too many payment attempts, please try again later.",
});

export const uploadRateLimit = rateLimit({
  max: 20,
  windowMs: 60 * 60 * 1000, // 1 hour for uploads
  message: "Too many upload attempts, please try again later.",
});
