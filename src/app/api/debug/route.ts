import { NextResponse } from "next/server";
import { getServerSupabaseClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    // Check environment variables
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_KEY;
    
    console.log("Debug: Environment check", { hasSupabaseUrl, hasServiceKey });

    // Try to create supabase client
    const supabase = getServerSupabaseClient();
    
    // Try a simple query
    const { data, error } = await supabase
      .from("restaurants")
      .select("count", { count: "exact", head: true });

    console.log("Debug: Simple query result", { data, error });

    return NextResponse.json({
      environment: {
        hasSupabaseUrl,
        hasServiceKey,
        nodeEnv: process.env.NODE_ENV,
      },
      supabaseTest: {
        error: error?.message,
        success: !error,
      }
    });
  } catch (error) {
    console.error("Debug: Error:", error);
    return NextResponse.json(
      { 
        error: "Debug failed",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
