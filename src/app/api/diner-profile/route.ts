import { NextRequest, NextResponse } from "next/server";
import { dinerProfileService } from "@/lib/diner-profile";

export async function POST(request: NextRequest) {
  try {
    const { email, display_name } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const profile = await dinerProfileService.ensureDinerProfile(email, display_name);
    
    if (!profile) {
      return NextResponse.json(
        { error: "Failed to create or fetch diner profile" },
        { status: 500 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error creating/fetching diner profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    const profile = await dinerProfileService.getDinerByEmail(email);
    
    if (!profile) {
      return NextResponse.json(
        { error: "Diner profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching diner profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
