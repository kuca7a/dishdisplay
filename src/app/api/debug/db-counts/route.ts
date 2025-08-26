import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  try {
    // Simple test - just count records in each table
    const results: Record<string, unknown> = {};
    
    // Test basic connection
    const { count: periodsCount, error: periodsError } = await supabaseServer
      .from("leaderboard_periods")
      .select("*", { count: "exact", head: true });
    
    results.leaderboard_periods = {
      count: periodsCount,
      error: periodsError?.message || null
    };

    const { count: pointsCount, error: pointsError } = await supabaseServer
      .from("diner_points")
      .select("*", { count: "exact", head: true });
    
    results.diner_points = {
      count: pointsCount,
      error: pointsError?.message || null
    };

    const { count: rankingsCount, error: rankingsError } = await supabaseServer
      .from("leaderboard_rankings")
      .select("*", { count: "exact", head: true });
    
    results.leaderboard_rankings = {
      count: rankingsCount,
      error: rankingsError?.message || null
    };

    const { count: profilesCount, error: profilesError } = await supabaseServer
      .from("diner_profiles")
      .select("*", { count: "exact", head: true });
    
    results.diner_profiles = {
      count: profilesCount,
      error: profilesError?.message || null
    };

    return NextResponse.json({
      success: true,
      message: "Database table counts",
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: "Connection error", 
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
