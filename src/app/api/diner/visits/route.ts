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
    const { restaurant_id, visit_date, notes, user_email, user_name } =
      await request.json();

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

    // **ANTI-SPAM CHECK**: Check for existing visit within 24 hours
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const { data: recentVisit } = await supabaseServer
      .from("diner_visits")
      .select("id, visit_date")
      .eq("diner_id", (profile as { id: string }).id)
      .eq("restaurant_id", restaurant_id)
      .gte("visit_date", twentyFourHoursAgo.toISOString())
      .order("visit_date", { ascending: false })
      .limit(1)
      .single();

    if (recentVisit) {
      const lastVisitTime = new Date(
        (recentVisit as { visit_date: string }).visit_date
      );
      const timeDiff = Date.now() - lastVisitTime.getTime();
      const hoursRemaining = Math.ceil(
        (24 * 60 * 60 * 1000 - timeDiff) / (60 * 60 * 1000)
      );

      return NextResponse.json(
        {
          error: "Visit limit reached",
          message: `You can only log one visit per restaurant every 24 hours. Try again in ${hoursRemaining} hour${
            hoursRemaining !== 1 ? "s" : ""
          }.`,
          canRetry: true,
          timeRemaining: hoursRemaining,
        },
        { status: 429 }
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

    // Update visit count (still needed for statistics)
    const { data: currentProfile } = await supabaseServer
      .from("diner_profiles")
      .select("total_visits")
      .eq("id", (profile as { id: string }).id)
      .single();

    if (currentProfile) {
      const currentVisits =
        (currentProfile as { total_visits: number }).total_visits || 0;

      // Update only visit count (points are now period-specific only)
      const { error: profileUpdateError } = await supabaseServer
        .from("diner_profiles")
        .update({
          total_visits: currentVisits + 1,
        })
        .eq("id", (profile as { id: string }).id);

      if (profileUpdateError) {
        console.warn(
          "Error updating profile stats (visit still logged):",
          profileUpdateError
        );
      }

      // Award points through the new leaderboard system (period-specific)
      try {
        const { error: leaderboardError } = await supabaseServer.rpc(
          "award_diner_points",
          {
            p_diner_email: (profile as { email: string }).email,
            p_points: 10,
            p_earned_from: "visit",
            p_source_id: visit.id,
            p_restaurant_id: restaurant_id,
          }
        );

        if (leaderboardError) {
          console.warn("Error awarding leaderboard points:", leaderboardError);
        } else {
          console.log(
            "Points awarded successfully: +10 points for current weekly competition"
          );
        }
      } catch (error) {
        console.warn("Error awarding points:", error);
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
