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
      .select(
        `
        *,
        restaurants (
          id,
          name,
          logo_url,
          address,
          city
        )
      `
      )
      .eq("diner_id", (profile as DinerProfile).id)
      .order("visit_date", { ascending: false });

    if (error) {
      console.error("Error fetching diner visits:", error);
      return NextResponse.json(
        { error: "Failed to fetch visits" },
        { status: 500 }
      );
    }

    return NextResponse.json(visits || []);
  } catch (error) {
    console.error("Diner visits API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { restaurant_id, visit_date, notes, user_email, user_name } = await request.json();

    if (!restaurant_id) {
      return NextResponse.json(
        { error: "Restaurant ID is required" },
        { status: 400 }
      );
    }

    if (!user_email) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      );
    }

    const email = user_email;
    const userName = user_name || "Diner";
    const auth0Id = "auth0-" + Date.now(); // Make it unique

    console.log("Attempting to log visit for:", { email, restaurant_id });

    // First check if diner_profiles table exists and get or create the diner profile
    let profile;
    try {
      // Try to get existing profile
      const { data: existingProfile, error: selectError } = await supabaseServer
        .from("diner_profiles")
        .select("id, email")
        .eq("email", email)
        .single();

      if (selectError && selectError.code !== "PGRST116") {
        // PGRST116 is "not found"
        console.error("Error querying diner_profiles:", selectError);
        throw selectError;
      }

      if (existingProfile) {
        profile = existingProfile;
        console.log("Found existing profile:", profile.id);
      } else {
        // Create new profile - try with flexible column names
        console.log("Creating new diner profile...");

        // First attempt with new schema
        let createProfileData: Record<string, unknown> = {
          email,
          name: userName,
          display_name: userName,
          auth0_id: auth0Id,
          total_points: 0,
          total_visits: 0,
          total_reviews: 0,
          created_at: new Date().toISOString(),
        };

        let { data: newProfile, error: createError } = await supabaseServer
          .from("diner_profiles")
          .insert(createProfileData)
          .select("id, email")
          .single();

        // If it fails due to missing columns, try with old schema
        if (createError && createError.code === "PGRST204") {
          console.log("New schema failed, trying with legacy column names...");
          createProfileData = {
            email,
            name: userName,
            display_name: userName,
            auth0_id: auth0Id,
            points: 0, // Legacy column name
            level: 1,
            created_at: new Date().toISOString(),
          };

          const retryResult = await supabaseServer
            .from("diner_profiles")
            .insert(createProfileData)
            .select("id, email")
            .single();

          newProfile = retryResult.data;
          createError = retryResult.error;
        }

        if (createError) {
          console.error("Error creating diner profile:", createError);
          console.error(
            "Full error details:",
            JSON.stringify(createError, null, 2)
          );

          // Check if it's an RLS issue
          if (
            createError.code === "42501" ||
            createError.message.includes("row-level security")
          ) {
            return NextResponse.json(
              {
                error:
                  "Database permission issue - please run the diner database migration with service role policies",
                details: createError.message,
                code: createError.code,
                hint: "This is likely an RLS (Row Level Security) policy issue",
              },
              { status: 500 }
            );
          }

          // Check if it's a schema issue
          if (createError.code === "PGRST204") {
            return NextResponse.json(
              {
                error:
                  "Database schema issue - please run the updated diner database migration",
                details: createError.message,
                code: createError.code,
                hint: "The diner_profiles table needs to be updated with the correct columns",
              },
              { status: 500 }
            );
          }

          return NextResponse.json(
            {
              error: "Failed to create profile",
              details: createError.message,
              code: createError.code,
            },
            { status: 500 }
          );
        }

        profile = newProfile;
        if (profile) {
          console.log("Created new profile:", profile.id);
        }
      }
    } catch (tableError) {
      console.error("Database table error:", tableError);
      return NextResponse.json(
        {
          error: "Database not ready - please run the diner database migration",
          details:
            tableError instanceof Error
              ? tableError.message
              : "Unknown database error",
        },
        { status: 500 }
      );
    }

    // Create the visit record
    console.log("Creating visit record...");
    const { data: visit, error: visitError } = await supabaseServer
      .from("diner_visits")
      .insert({
        diner_id: (profile as { id: string }).id,
        restaurant_id,
        visit_date: visit_date || new Date().toISOString(),
        notes: notes || "Visited via QR code menu",
      })
      .select()
      .single();

    if (visitError) {
      console.error("Error creating visit:", visitError);
      console.error(
        "Full visit error details:",
        JSON.stringify(visitError, null, 2)
      );
      return NextResponse.json(
        {
          error: "Failed to log visit",
          details: visitError.message,
          code: visitError.code,
        },
        { status: 500 }
      );
    }

    // Award points for the visit (10 points per visit)
    console.log("Awarding points for visit...");

    // Get current active leaderboard period
    const { data: activePeriod } = await supabaseServer
      .from("leaderboard_periods")
      .select("id")
      .eq("status", "active")
      .single();

    // Get current points and visits count
    const { data: currentProfile } = await supabaseServer
      .from("diner_profiles")
      .select("total_points, total_visits")
      .eq("id", (profile as { id: string }).id)
      .single();

    if (currentProfile) {
      const currentPoints =
        (currentProfile as { total_points: number }).total_points || 0;
      const currentVisits =
        (currentProfile as { total_visits: number }).total_visits || 0;

      // Update profile totals
      const { error: pointsError } = await supabaseServer
        .from("diner_profiles")
        .update({
          total_points: currentPoints + 10,
          total_visits: currentVisits + 1,
        })
        .eq("id", (profile as { id: string }).id);

      if (pointsError) {
        console.warn(
          "Error awarding points (visit still logged):",
          pointsError
        );
        // Don't fail the request if points update fails
      } else {
        console.log("Points awarded successfully: +10 points");
      }

      // Also create entry in diner_points table for leaderboard if period exists
      if (activePeriod) {
        const { error: leaderboardPointsError } = await supabaseServer
          .from("diner_points")
          .insert({
            diner_id: (profile as { id: string }).id,
            points: 10,
            earned_from: "visit",
            source_id: visit.id,
            restaurant_id: restaurant_id,
            leaderboard_period_id: activePeriod.id,
          });

        if (leaderboardPointsError) {
          console.warn("Error logging leaderboard points:", leaderboardPointsError);
          // Don't fail the request if leaderboard points logging fails
        } else {
          console.log("Leaderboard points logged successfully");
        }
      } else {
        console.warn("No active leaderboard period found, points not logged for leaderboard");
      }
    }

    console.log("Visit logged successfully:", visit.id);
    return NextResponse.json({
      ...visit,
      points_earned: 10,
    });
  } catch (error) {
    console.error("Visit creation API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
