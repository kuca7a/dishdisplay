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
      return NextResponse.json(
        { error: "Failed to fetch reviews" },
        { status: 500 }
      );
    }

    return NextResponse.json(reviews || []);
  } catch (error) {
    console.error("Diner reviews API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { restaurant_id, rating, review_text, photos, user_email, user_name } = body;

    if (!restaurant_id || !rating) {
      return NextResponse.json(
        { error: "Restaurant ID and rating are required" },
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

    console.log("Attempting to submit review for:", {
      email,
      restaurant_id,
      rating,
    });

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
          total_reviews: 0,
          total_visits: 0,
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

    // Create the review
    console.log("Creating review record...");

    // First attempt with new schema including is_public
    let reviewData: Record<string, unknown> = {
      diner_id: (profile as { id: string }).id,
      restaurant_id,
      visit_id: null, // Optional for now
      rating,
      review_text: review_text || "",
      photos: photos || [],
      is_public: true,
      created_at: new Date().toISOString(),
    };

    let { data: review, error: reviewError } = await supabaseServer
      .from("diner_reviews")
      .insert(reviewData)
      .select()
      .single();

    // If it fails due to missing is_public column, try without it
    if (reviewError && reviewError.code === "PGRST204") {
      console.log("Schema error detected, trying without is_public column...");
      reviewData = {
        diner_id: (profile as { id: string }).id,
        restaurant_id,
        visit_id: null, // Optional for now
        rating,
        review_text: review_text || "",
        photos: photos || [],
        created_at: new Date().toISOString(),
      };

      const retryResult = await supabaseServer
        .from("diner_reviews")
        .insert(reviewData)
        .select()
        .single();

      review = retryResult.data;
      reviewError = retryResult.error;
    }

    if (reviewError) {
      console.error("Error creating review:", reviewError);
      console.error(
        "Full review error details:",
        JSON.stringify(reviewError, null, 2)
      );

      // Check if it's a schema issue
      if (reviewError.code === "PGRST204") {
        return NextResponse.json(
          {
            error:
              "Database schema issue - please run the updated diner database migration",
            details: reviewError.message,
            code: reviewError.code,
            hint: "The diner_reviews table needs to be updated with the correct columns",
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          error: "Failed to create review",
          details: reviewError.message,
          code: reviewError.code,
        },
        { status: 500 }
      );
    }

    // Award points for the review (15 points per review)
    console.log("Awarding points for review...");

    // Get current active leaderboard period
    const { data: activePeriod } = await supabaseServer
      .from("leaderboard_periods")
      .select("id")
      .eq("status", "active")
      .single();

    // Get current points and reviews count
    const { data: currentProfile } = await supabaseServer
      .from("diner_profiles")
      .select("total_points, total_reviews")
      .eq("id", (profile as { id: string }).id)
      .single();

    if (currentProfile) {
      const currentPoints =
        (currentProfile as { total_points: number }).total_points || 0;
      const currentReviews =
        (currentProfile as { total_reviews: number }).total_reviews || 0;

      // Update profile totals
      const { error: pointsError } = await supabaseServer
        .from("diner_profiles")
        .update({
          total_points: currentPoints + 25, // Reviews give 25 points (not 15)
          total_reviews: currentReviews + 1,
        })
        .eq("id", (profile as { id: string }).id);

      if (pointsError) {
        console.warn(
          "Error awarding points (review still saved):",
          pointsError
        );
        // Don't fail the request if points update fails
      } else {
        console.log("Points awarded successfully: +25 points");
      }

      // Also create entry in diner_points table for leaderboard if period exists
      if (activePeriod) {
        const { error: leaderboardPointsError } = await supabaseServer
          .from("diner_points")
          .insert({
            diner_id: (profile as { id: string }).id,
            points: 25, // Reviews give 25 points
            earned_from: "review",
            source_id: review?.id,
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

    console.log("Review submitted successfully:", review?.id);
    return NextResponse.json({
      ...review,
      points_earned: 25, // Updated to reflect actual points awarded
    });
  } catch (error) {
    console.error("Diner review creation API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
