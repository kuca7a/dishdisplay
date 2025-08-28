import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    // First, try to get the profile with streak columns
    let profile;
    let streakSupported = true;

    try {
      const { data, error } = await supabaseServer
        .from("diner_profiles")
        .select("current_streak, longest_streak, last_visit_date")
        .eq("email", email)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Profile doesn't exist yet
          return NextResponse.json({
            currentStreak: 0,
            longestStreak: 0,
            lastVisitDate: null,
            streakSupported: true
          });
        }
        
        // Check if the error is due to missing columns
        if (error.code === "42703" || error.message.includes("does not exist")) {
          console.warn("Streak columns not available, falling back to basic profile");
          streakSupported = false;
        } else {
          throw error;
        }
      } else {
        profile = data;
      }
    } catch (columnError) {
      // If streak columns don't exist, fall back to basic profile
      console.warn("Streak columns not available:", columnError);
      streakSupported = false;
    }

    // If streak columns aren't available, calculate streak manually from visits
    if (!streakSupported || !profile) {
      try {
        // Get the diner profile first
        const { data: basicProfile } = await supabaseServer
          .from("diner_profiles")
          .select("id")
          .eq("email", email)
          .single();

        if (!basicProfile) {
          return NextResponse.json({
            currentStreak: 0,
            longestStreak: 0,
            lastVisitDate: null,
            streakSupported: false
          });
        }

        // Calculate streak from visits data
        const { data: visits } = await supabaseServer
          .from("diner_visits")
          .select("visit_date")
          .eq("diner_id", (basicProfile as { id: string }).id)
          .order("visit_date", { ascending: false })
          .limit(30); // Get last 30 days of visits

        const streakData = calculateStreakFromVisits(visits as { visit_date: string }[] || []);
        
        return NextResponse.json({
          ...streakData,
          streakSupported: false,
          note: "Streak calculated from visit history (database columns not yet migrated)"
        });
      } catch (fallbackError) {
        console.error("Fallback streak calculation failed:", fallbackError);
        return NextResponse.json({
          currentStreak: 0,
          longestStreak: 0,
          lastVisitDate: null,
          streakSupported: false
        });
      }
    }

    return NextResponse.json({
      currentStreak: profile.current_streak || 0,
      longestStreak: profile.longest_streak || 0,
      lastVisitDate: profile.last_visit_date,
      streakSupported: true
    });
  } catch (error) {
    console.error("Streak API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// Helper function to calculate streak from visit data
function calculateStreakFromVisits(visits: { visit_date: string }[]) {
  if (!visits || visits.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastVisitDate: null
    };
  }

  // Sort visits by date (most recent first)
  const sortedVisits = visits
    .map(v => new Date(v.visit_date))
    .sort((a, b) => b.getTime() - a.getTime());

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check for current streak
  let checkDate = new Date(today);
  for (const visitDate of sortedVisits) {
    const visit = new Date(visitDate);
    visit.setHours(0, 0, 0, 0);
    
    if (visit.getTime() === checkDate.getTime()) {
      currentStreak++;
      tempStreak++;
      checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
    } else if (visit.getTime() === checkDate.getTime() + 24 * 60 * 60 * 1000) {
      // Visit was yesterday, continue streak
      currentStreak++;
      tempStreak++;
      checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
    } else {
      break;
    }
  }

  // Calculate longest streak (simplified version)
  longestStreak = Math.max(currentStreak, tempStreak);

  return {
    currentStreak,
    longestStreak,
    lastVisitDate: sortedVisits[0]?.toISOString().split('T')[0] || null
  };
}
