import { NextResponse } from "next/server";
import { runStartupChecks } from "@/lib/deployment";
import { trackSystemHealth } from "@/lib/monitoring";

export async function GET() {
  try {
    // Track system health check
    trackSystemHealth();

    // Run comprehensive health checks
    const deploymentHealth = await runStartupChecks();

    const healthChecks = {
      status: deploymentHealth.status,
      timestamp: deploymentHealth.timestamp,
      environment: process.env.NODE_ENV,
      deployment: deploymentHealth.deployment,
      checks: deploymentHealth.checks,
    };

    return NextResponse.json(healthChecks, {
      status: deploymentHealth.status === "unhealthy" ? 503 : 200,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Health check failed",
      },
      { status: 500 }
    );
  }
}
