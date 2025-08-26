import { NextRequest, NextResponse } from "next/server";
import { dinerProfileService } from "@/lib/diner-database";

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

    const completionData = await dinerProfileService.checkProfileCompletion(email);

    return NextResponse.json(completionData);
  } catch (error) {
    console.error("Profile completion API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
