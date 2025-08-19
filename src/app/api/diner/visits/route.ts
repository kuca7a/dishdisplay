import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

interface DinerProfile {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
}

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

    // Get visits with restaurant information
    const { data: visits, error } = await supabaseServer
      .from("diner_visits")
      .select(`
        *,
        restaurants (
          id,
          name,
          logo_url,
          address,
          city
        )
      `)
      .eq("diner_id", (profile as DinerProfile).id)
      .order("visit_date", { ascending: false });

    if (error) {
      console.error("Error fetching diner visits:", error);
      return NextResponse.json({ error: "Failed to fetch visits" }, { status: 500 });
    }

    return NextResponse.json(visits || []);
  } catch (error) {
    console.error("Diner visits API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { restaurant_id, visit_date, notes } = await request.json();

    if (!restaurant_id) {
      return NextResponse.json({ error: "Restaurant ID is required" }, { status: 400 });
    }

    // For now, we'll create a temporary implementation that doesn't require authentication
    // In a real app, you'd get the user from the Auth0 token
    const email = "hdcatalyst@gmail.com"; // Temporary hardcoded email

    // First get or create the diner profile
    let { data: profile } = await supabaseServer
      .from("diner_profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (!profile) {
      // Create profile if it doesn't exist
      const { data: newProfile, error: createError } = await supabaseServer
        .from("diner_profiles")
        .insert({
          email,
          name: "Test Diner",
          auth0_id: "temp-id"
        })
        .select("id")
        .single();

      if (createError) {
        console.error("Error creating diner profile:", createError);
        return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
      }

      profile = newProfile;
    }

    // Create the visit record
    const { data: visit, error } = await supabaseServer
      .from("diner_visits")
      .insert({
        diner_id: (profile as DinerProfile).id,
        restaurant_id,
        visit_date: visit_date || new Date().toISOString(),
        notes
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating visit:", error);
      return NextResponse.json({ error: "Failed to log visit" }, { status: 500 });
    }

    return NextResponse.json(visit);
  } catch (error) {
    console.error("Visit creation API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
