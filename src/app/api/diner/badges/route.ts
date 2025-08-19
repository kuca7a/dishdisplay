import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // First get the diner profile to get the diner ID
    const { data: profile } = await supabaseServer
      .from("diner_profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (!profile) {
      return NextResponse.json([]);
    }

    // Get badges
    const { data: badges, error } = await supabaseServer
      .from("diner_badges")
      .select("*")
      .eq("diner_id", (profile as { id: string }).id)
      .order("earned_at", { ascending: false });

    if (error) {
      console.error("Error fetching diner badges:", error);
      return NextResponse.json({ error: "Failed to fetch badges" }, { status: 500 });
    }

    return NextResponse.json(badges || []);
  } catch (error) {
    console.error("Diner badges API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
