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

    // Get reviews
    const { data: reviews, error } = await supabaseServer
      .from("diner_reviews")
      .select("*")
      .eq("diner_id", (profile as { id: string }).id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching diner reviews:", error);
      return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }

    return NextResponse.json(reviews || []);
  } catch (error) {
    console.error("Diner reviews API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { restaurant_id, rating, review_text, photos } = body;

    if (!restaurant_id || !rating) {
      return NextResponse.json({ error: "Restaurant ID and rating are required" }, { status: 400 });
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

    // Create the review without requiring a visit_id for now
    const { data: review, error } = await supabaseServer
      .from("diner_reviews")
      .insert({
        diner_id: (profile as { id: string }).id,
        restaurant_id,
        visit_id: null, // Optional for now
        rating,
        review_text,
        photos: photos || []
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating review:", error);
      return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error("Diner review creation API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
