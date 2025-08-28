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
      .select("*, created_at")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching diner profile:", error);
      return NextResponse.json(
        { error: "Failed to fetch profile" },
        { status: 500 }
      );
    }

    // If profile exists, use created_at as join_date if join_date is missing
    if (profile) {
      const profileWithJoinDate = {
        ...profile,
        join_date: profile.join_date || profile.created_at
      };
      return NextResponse.json(profileWithJoinDate);
    }

    // If no profile exists, create one
    if (!profile) {
      try {
        const currentDate = new Date().toISOString();
        const { data: newProfile, error: createError } = await supabaseServer
          .from("diner_profiles")
          .insert({
            email,
            join_date: currentDate,
            total_points: 0,
            total_visits: 0,
            total_reviews: 0,
            is_public: true,
          })
          .select("*, created_at")
          .single();

        if (createError) {
          // Check if the error is due to missing is_public column
          if (createError.code === "42703" || createError.message.includes("is_public")) {
            // Fallback: create profile without is_public column
            const { data: fallbackProfile, error: fallbackError } = await supabaseServer
              .from("diner_profiles")
              .insert({
                email,
                join_date: currentDate,
                total_points: 0,
                total_visits: 0,
                total_reviews: 0,
              })
              .select("*, created_at")
              .single();

            if (fallbackError) {
              console.error("Error creating diner profile (fallback):", fallbackError);
              return NextResponse.json(
                { error: "Failed to create profile" },
                { status: 500 }
              );
            }

            const profileWithDefaults = {
              ...fallbackProfile,
              is_public: true,
              join_date: fallbackProfile.join_date || fallbackProfile.created_at
            };
            return NextResponse.json(profileWithDefaults);
          }

          console.error("Error creating diner profile:", createError);
          return NextResponse.json(
            { error: "Failed to create profile" },
            { status: 500 }
          );
        }

        const profileWithJoinDate = {
          ...newProfile,
          join_date: newProfile.join_date || newProfile.created_at
        };
        return NextResponse.json(profileWithJoinDate);
      } catch (createException) {
        console.error("Exception creating diner profile:", createException);
        return NextResponse.json(
          { error: "Failed to create profile" },
          { status: 500 }
        );
      }
    }
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

    // First try to update with is_public column
    try {
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
        // Check if the error is due to missing is_public column
        if (error.code === "42703" || error.message.includes("is_public")) {
          console.warn("is_public column not available, updating without it");
          
          // Fallback: update without is_public column
          const { data: fallbackProfile, error: fallbackError } = await supabaseServer
            .from("diner_profiles")
            .update({
              display_name,
              updated_at: new Date().toISOString(),
            })
            .eq("email", email)
            .select()
            .single();

          if (fallbackError) {
            console.error("Error updating diner profile (fallback):", fallbackError);
            return NextResponse.json(
              { error: "Failed to update profile" },
              { status: 500 }
            );
          }

          return NextResponse.json({ ...fallbackProfile, is_public: is_public ?? true });
        }

        console.error("Error updating diner profile:", error);
        return NextResponse.json(
          { error: "Failed to update profile" },
          { status: 500 }
        );
      }

      return NextResponse.json(profile);
    } catch (updateException) {
      console.error("Exception updating diner profile:", updateException);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Diner profile update API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
