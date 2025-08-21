import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Get restaurant by owner email
    const { data: restaurant, error } = await supabaseServer
      .from("restaurants")
      .select("*")
      .eq("owner_email", email)
      .single();

    if (error && error.code !== "PGRST116") { // PGRST116 is "not found"
      console.error("Error fetching restaurant by owner:", error);
      return NextResponse.json(
        { error: "Failed to fetch restaurant" },
        { status: 500 }
      );
    }

    // Return null if no restaurant found, otherwise return the restaurant
    return NextResponse.json(restaurant);
  } catch (error) {
    console.error("Restaurant by owner API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
