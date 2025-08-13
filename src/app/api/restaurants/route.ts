import { NextRequest, NextResponse } from "next/server";
import { getServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerEmail = searchParams.get("owner_email");

    if (!ownerEmail) {
      return NextResponse.json(
        { error: "owner_email parameter is required" },
        { status: 400 }
      );
    }

    console.log("API: Getting restaurant for email:", ownerEmail);

    const supabase = getServerSupabaseClient();

    // Get restaurant using service role (bypasses RLS)
    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .eq("owner_email", ownerEmail);

    if (error) {
      console.error("API: Query error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data || data.length === 0) {
      console.log("API: No restaurant found for email:", ownerEmail);
      return NextResponse.json(null);
    }

    if (data.length > 1) {
      console.warn("API: Multiple restaurants found for email:", ownerEmail);
    }

    console.log("API: Found restaurant:", data[0]);
    return NextResponse.json(data[0]);
  } catch (error) {
    console.error("API: Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
