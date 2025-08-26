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

    const { data: profile, error } = await supabaseServer
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
          lastVisitDate: null
        });
      }
      throw error;
    }

    return NextResponse.json({
      currentStreak: profile.current_streak || 0,
      longestStreak: profile.longest_streak || 0,
      lastVisitDate: profile.last_visit_date
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
