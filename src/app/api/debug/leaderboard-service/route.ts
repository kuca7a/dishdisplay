import { NextResponse } from "next/server";
import { leaderboardService } from "@/lib/leaderboard";

export async function GET() {
  try {
    console.log("=== LEADERBOARD DEBUG START ===");
    
    // Test the leaderboard service directly
    const testEmail = "hdcatalyst@gmail.com"; // Your test email
    
    console.log("Testing with email:", testEmail);
    
    const leaderboardData = await leaderboardService.getCurrentLeaderboard(testEmail);
    
    console.log("Leaderboard service returned:", leaderboardData);
    
    // Also test getting diner points
    const dinerPoints = await leaderboardService.getDinerCurrentPoints(testEmail);
    console.log("Diner current points:", dinerPoints);
    
    console.log("=== LEADERBOARD DEBUG END ===");
    
    return NextResponse.json({
      success: true,
      testEmail,
      leaderboardData,
      dinerPoints,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Leaderboard service debug error:", error);
    return NextResponse.json(
      { 
        error: "Service error", 
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
