import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  try {
    console.log("API: Starting restaurant query");
    
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    
    console.log("API: Environment check", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseServiceKey,
      urlPreview: supabaseUrl?.substring(0, 20) + "...",
      keyPreview: supabaseServiceKey?.substring(0, 20) + "..."
    });

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        error: "Missing environment variables",
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseServiceKey
      }, { status: 500 });
    }

    // Create a fresh Supabase client directly
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { searchParams } = new URL(request.url);
    const ownerEmail = searchParams.get("owner_email");

    if (!ownerEmail) {
      return NextResponse.json(
        { error: "owner_email parameter is required" },
        { status: 400 }
      );
    }

    console.log("API: Querying for email:", ownerEmail);

    // Try the query with detailed error reporting
    const { data, error, count } = await supabase
      .from("restaurants")
      .select("*", { count: "exact" })
      .eq("owner_email", ownerEmail);

    console.log("API: Query result:", {
      dataCount: data?.length || 0,
      error: error,
      totalCount: count
    });

    if (error) {
      console.error("API: Query error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      
      return NextResponse.json({
        error: "Database query failed",
        supabaseError: {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        }
      }, { status: 500 });
    }

    if (!data || data.length === 0) {
      console.log("API: No restaurant found");
      return NextResponse.json(null);
    }

    console.log("API: Found restaurant:", data[0]);
    return NextResponse.json(data[0]);

  } catch (error) {
    console.error("API: Unexpected error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
