import { NextRequest, NextResponse } from "next/server";
import { getServerSupabaseClient } from "@/lib/supabase-server";
import { apiRateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await apiRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Log environment status
    console.log("API: Environment check", {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_KEY,
      nodeEnv: process.env.NODE_ENV,
    });

    const { searchParams } = new URL(request.url);
    const ownerEmail = searchParams.get("owner_email");

    if (!ownerEmail) {
      console.log("API: Missing owner_email parameter");
      return NextResponse.json(
        { error: "owner_email parameter is required" },
        { status: 400 }
      );
    }

    console.log("API: Getting restaurant for email:", ownerEmail);

    try {
      const supabase = getServerSupabaseClient();
      console.log("API: Supabase client created successfully");

      // Test basic connection first
      const { data: testData, error: testError } = await supabase
        .from("restaurants")
        .select("count", { count: "exact", head: true });

      console.log("API: Basic connection test:", { testData, testError });

      if (testError) {
        console.error("API: Basic connection failed:", testError);
        return NextResponse.json(
          {
            error: "Database connection failed",
            details: testError.message,
          },
          { status: 500 }
        );
      }

      // Get restaurant using service role (bypasses RLS)
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("owner_email", ownerEmail);

      if (error) {
        console.error("API: Supabase query error:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        return NextResponse.json(
          {
            error: error.message,
            details: error.details,
            hint: error.hint,
          },
          { status: 400 }
        );
      }

      if (!data || data.length === 0) {
        console.log("API: No restaurant found for email:", ownerEmail);
        return NextResponse.json(null);
      }

      if (data.length > 1) {
        console.warn("API: Multiple restaurants found for email:", ownerEmail);
      }

      console.log("API: Found restaurant:", data[0]);
      return NextResponse.json(data[0]);
    } catch (supabaseError) {
      console.error("API: Supabase client creation error:", supabaseError);
      throw supabaseError;
    }
  } catch (error) {
    console.error("API: Server error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
