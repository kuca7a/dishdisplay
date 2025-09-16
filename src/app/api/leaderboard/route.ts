import { NextResponse } from "next/server";
import { LeaderboardService } from "@/lib/leaderboard";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get("email");

    const leaderboardService = new LeaderboardService();

    // Use the proper leaderboard service which handles weekly periods and automatic transitions
    const leaderboardData = await leaderboardService.getCurrentLeaderboard(
      userEmail || undefined
    );

    if (!leaderboardData) {
      return NextResponse.json({
        success: false,
        error: "Failed to fetch leaderboard data",
      });
    }

    return NextResponse.json({
      success: true,
      leaderboard: leaderboardData,
    });
  } catch (error) {
    console.error("Leaderboard API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
