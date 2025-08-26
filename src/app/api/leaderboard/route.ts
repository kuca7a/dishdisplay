import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('email');
    
    const supabase = getSupabaseClient();

    // Get current active period
    const { data: currentPeriod, error: periodError } = await supabase
      .from('leaderboard_periods')
      .select('*')
      .eq('status', 'active')
      .single();

    if (periodError || !currentPeriod) {
      return NextResponse.json({
        success: false,
        error: "No active leaderboard period found",
        details: periodError
      });
    }

    // SIMPLIFIED: Get all diner profiles with points - single source of truth!
    const { data: profiles, error: profilesError } = await supabase
      .from('diner_profiles')
      .select('email, display_name, name, total_points, total_visits, total_reviews')
      .gt('total_points', 0) // Only users with points
      .order('total_points', { ascending: false });

    if (profilesError) {
      return NextResponse.json({
        success: false,
        error: "Failed to fetch profiles",
        details: profilesError
      });
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({
        success: true,
        leaderboard: {
          current_period: currentPeriod,
          top_entries: [],
          current_user_entry: undefined,
          prize_restaurant: undefined
        }
      });
    }

    // Convert profiles to leaderboard entries
    const sortedEntries = profiles.map((profile, index) => {
      const fullName = profile.display_name || profile.name || profile.email.split('@')[0];
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const surnameInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1].charAt(0).toUpperCase() : '';
      
      return {
        email: profile.email,
        diner_name: firstName,
        surname_initial: surnameInitial,
        total_points: profile.total_points,
        is_current_user: userEmail === profile.email,
        is_winner: index === 0, // Winner is #1
        profile_photo_url: undefined,
        rank: index + 1
      };
    });

    // Get top 10 (only show if user is authenticated)
    const topEntries = userEmail ? sortedEntries.slice(0, 10) : [];

    // Get current user entry if not in top 10
    let currentUserEntry = undefined;
    if (userEmail) {
      const userInTop10 = topEntries.find(entry => entry.is_current_user);
      if (!userInTop10) {
        currentUserEntry = sortedEntries.find(entry => entry.is_current_user);
      }
    }

    return NextResponse.json({
      success: true,
      leaderboard: {
        current_period: currentPeriod,
        top_entries: topEntries,
        current_user_entry: currentUserEntry,
        prize_restaurant: undefined
      }
    });

  } catch (error) {
    console.error("Simplified leaderboard API error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error", 
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
