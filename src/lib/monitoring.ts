import { NextRequest, NextResponse } from "next/server";

interface ErrorData {
  timestamp: string;
  error: string;
  context?: Record<string, unknown>;
}

interface MonitoringConfig {
  errorReporting: boolean;
  performanceTracking: boolean;
  userBehaviorTracking: boolean;
  businessMetrics: boolean;
}

class SimpleMonitor {
  private config: MonitoringConfig;
  private metrics: Map<string, number> = new Map();
  private errors: ErrorData[] = [];

  constructor(config: MonitoringConfig) {
    this.config = config;
  }

  // Track errors
  trackError(error: Error | string, context?: Record<string, unknown>) {
    if (!this.config.errorReporting) return;

    const errorData = {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      context,
    };

    this.errors.push(errorData);

    // Keep only last 100 errors in memory
    if (this.errors.length > 100) {
      this.errors.shift();
    }

    // In production, send to external service
    if (process.env.NODE_ENV === "production") {
      this.sendToExternalService("error", errorData);
    }

    console.error("Error tracked:", errorData);
  }

  // Track performance metrics
  trackPerformance(
    metric: string,
    value: number,
    tags?: Record<string, string>
  ) {
    if (!this.config.performanceTracking) return;

    const key = tags ? `${metric}:${JSON.stringify(tags)}` : metric;
    this.metrics.set(key, value);

    const performanceData = {
      timestamp: new Date().toISOString(),
      metric,
      value,
      tags,
    };

    // In production, send to external service
    if (process.env.NODE_ENV === "production") {
      this.sendToExternalService("performance", performanceData);
    }

    console.log("Performance tracked:", performanceData);
  }

  // Track user behavior
  trackUserAction(
    action: string,
    userId?: string,
    metadata?: Record<string, unknown>
  ) {
    if (!this.config.userBehaviorTracking) return;

    const actionData = {
      timestamp: new Date().toISOString(),
      action,
      userId,
      metadata,
    };

    // In production, send to external service
    if (process.env.NODE_ENV === "production") {
      this.sendToExternalService("user_action", actionData);
    }

    console.log("User action tracked:", actionData);
  }

  // Track business metrics
  trackBusinessMetric(
    metric: string,
    value: number,
    dimensions?: Record<string, string>
  ) {
    if (!this.config.businessMetrics) return;

    const businessData = {
      timestamp: new Date().toISOString(),
      metric,
      value,
      dimensions,
    };

    // In production, send to external service
    if (process.env.NODE_ENV === "production") {
      this.sendToExternalService("business_metric", businessData);
    }

    console.log("Business metric tracked:", businessData);
  }

  // Get current metrics
  getMetrics() {
    return {
      errors: this.errors.slice(-10), // Last 10 errors
      performance: Object.fromEntries(this.metrics),
      timestamp: new Date().toISOString(),
    };
  }

  // Send to external monitoring service
  private async sendToExternalService(
    type: string,
    data: Record<string, unknown>
  ) {
    try {
      // Example: Send to your monitoring service
      // This could be Sentry, DataDog, New Relic, etc.

      // For now, we'll just log it
      if (process.env.MONITORING_ENDPOINT) {
        await fetch(process.env.MONITORING_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.MONITORING_API_KEY}`,
          },
          body: JSON.stringify({
            type,
            data,
            service: "dishdisplay",
            environment: process.env.NODE_ENV,
          }),
        });
      }
    } catch (error) {
      console.error("Failed to send monitoring data:", error);
    }
  }
}

// Global monitor instance
export const monitor = new SimpleMonitor({
  errorReporting: true,
  performanceTracking: true,
  userBehaviorTracking: process.env.NODE_ENV === "production",
  businessMetrics: true,
});

// Middleware to track API performance
export function withMonitoring(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();
    const route = req.nextUrl.pathname;

    try {
      const response = await handler(req);

      // Track successful request
      monitor.trackPerformance("api_request_duration", Date.now() - startTime, {
        route,
        method: req.method,
        status: response.status.toString(),
      });

      // Track business metrics
      if (response.status === 200) {
        monitor.trackBusinessMetric("api_success_count", 1, { route });
      }

      return response;
    } catch (error) {
      // Track error
      monitor.trackError(
        error instanceof Error ? error : new Error(String(error)),
        {
          route,
          method: req.method,
        }
      );

      monitor.trackBusinessMetric("api_error_count", 1, { route });

      // Re-throw the error
      throw error;
    }
  };
}

// React error boundary integration
export function reportReactError(
  error: Error,
  errorInfo: { componentStack: string }
) {
  monitor.trackError(error, {
    type: "react_error",
    componentStack: errorInfo.componentStack,
  });
}

// Database query performance tracking
export function trackDatabaseQuery(
  query: string,
  duration: number,
  success: boolean
) {
  monitor.trackPerformance("database_query_duration", duration, {
    query_type: query.split(" ")[0]?.toLowerCase() || "unknown",
    success: success.toString(),
  });

  if (!success) {
    monitor.trackBusinessMetric("database_error_count", 1, {
      query_type: query.split(" ")[0]?.toLowerCase() || "unknown",
    });
  }
}

// Authentication events
export function trackAuth(
  event: "login" | "logout" | "signup" | "auth_error",
  userId?: string
) {
  monitor.trackUserAction(`auth_${event}`, userId);
  monitor.trackBusinessMetric(`auth_${event}_count`, 1);
}

// Payment events
export function trackPayment(
  event: "payment_started" | "payment_success" | "payment_failed",
  amount?: number,
  currency?: string
) {
  monitor.trackBusinessMetric(`payment_${event}_count`, 1);

  if (amount && event === "payment_success") {
    monitor.trackBusinessMetric("revenue", amount, {
      currency: currency || "GBP",
    });
  }
}

// Restaurant events
export function trackRestaurant(
  event: "restaurant_created" | "menu_item_added" | "qr_generated",
  restaurantId?: string
) {
  monitor.trackUserAction(`restaurant_${event}`, undefined, { restaurantId });
  monitor.trackBusinessMetric(`restaurant_${event}_count`, 1);
}

// Diner events
export function trackDiner(
  event: "visit_logged" | "review_submitted" | "points_earned",
  dinerId?: string,
  metadata?: Record<string, unknown>
) {
  monitor.trackUserAction(`diner_${event}`, dinerId, metadata);
  monitor.trackBusinessMetric(`diner_${event}_count`, 1);
}

// System health monitoring
export function trackSystemHealth() {
  // Memory usage
  if (typeof process !== "undefined" && process.memoryUsage) {
    const memory = process.memoryUsage();
    monitor.trackPerformance("memory_usage", memory.heapUsed);
    monitor.trackPerformance("memory_total", memory.heapTotal);
  }

  // System metrics would go here
  monitor.trackPerformance("system_uptime", process.uptime?.() || 0);
}

// Set up automatic system monitoring
if (typeof setInterval !== "undefined") {
  setInterval(trackSystemHealth, 60000); // Every minute
}
