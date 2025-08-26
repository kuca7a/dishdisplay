import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  try {
    // Get basic counts and data from leaderboard tables
    const debugInfo: Record<string, unknown> = {};

    // Check leaderboard_periods
    const { data: periods, error: periodsError } = await supabaseServer
      .from("leaderboard_periods")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    debugInfo.periods = {
      count: periods?.length || 0,
      data: periods,
      error: periodsError?.message
    };

    // Check diner_points
    const { data: points, error: pointsError } = await supabaseServer
      .from("diner_points")
      .select("*")
      .order("earned_at", { ascending: false })
      .limit(10);

    debugInfo.points = {
      count: points?.length || 0,
      data: points,
      error: pointsError?.message
    };

    // Check leaderboard_rankings
    const { data: rankings, error: rankingsError } = await supabaseServer
      .from("leaderboard_rankings")
      .select(`
        *,
        diner_profiles (
          email,
          display_name
        )
      `)
      .order("rank", { ascending: true })
      .limit(10);

    debugInfo.rankings = {
      count: rankings?.length || 0,
      data: rankings,
      error: rankingsError?.message
    };

    // Check diner_profiles with points
    const { data: profiles, error: profilesError } = await supabaseServer
      .from("diner_profiles")
      .select("id, email, display_name, total_points, total_visits, total_reviews")
      .order("total_points", { ascending: false })
      .limit(10);

    debugInfo.profiles = {
      count: profiles?.length || 0,
      data: profiles,
      error: profilesError?.message
    };

    // Get current active period specifically
    const { data: activePeriod, error: activePeriodError } = await supabaseServer
      .from("leaderboard_periods")
      .select("*")
      .eq("status", "active")
      .gte("end_date", new Date().toISOString().split('T')[0])
      .lte("start_date", new Date().toISOString().split('T')[0])
      .single();

    debugInfo.activePeriod = {
      data: activePeriod,
      error: activePeriodError?.message
    };

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      currentDate: new Date().toISOString().split('T')[0],
      debugInfo
    });

  } catch (error) {
    console.error("Debug API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
