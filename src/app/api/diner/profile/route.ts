import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Get diner profile
    const { data: profile, error } = await supabaseServer
      .from("diner_profiles")
      .select("*")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching diner profile:", error);
      return NextResponse.json(
        { error: "Failed to fetch profile" },
        { status: 500 }
      );
    }

    // If no profile exists, create one
    if (!profile) {
      const { data: newProfile, error: createError } = await supabaseServer
        .from("diner_profiles")
        .insert({
          email,
          join_date: new Date().toISOString(),
          total_points: 0,
          total_visits: 0,
          total_reviews: 0,
          is_public: true,
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating diner profile:", createError);
        return NextResponse.json(
          { error: "Failed to create profile" },
          { status: 500 }
        );
      }

      return NextResponse.json(newProfile);
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Diner profile API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, display_name, is_public } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { data: profile, error } = await supabaseServer
      .from("diner_profiles")
      .update({
        display_name,
        is_public,
        updated_at: new Date().toISOString(),
      })
      .eq("email", email)
      .select()
      .single();

    if (error) {
      console.error("Error updating diner profile:", error);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Diner profile update API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
