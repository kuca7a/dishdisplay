import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Try to get reviews using diner_email column first
    try {
      const { data: reviews, error } = await supabaseServer
        .from("diner_reviews")
        .select("*")
        .eq("diner_email", email)
        .order("created_at", { ascending: false });

      if (error) {
        // Check if the error is due to missing diner_email column
        if (error.code === "42703" || error.message.includes("diner_email")) {
          console.warn("diner_email column not available, trying to find alternative approach");
          
          // Fallback: Get reviews via diner_id by first getting profile
          const { data: profile } = await supabaseServer
            .from("diner_profiles")
            .select("id")
            .eq("email", email)
            .single();

          if (!profile) {
            return NextResponse.json([]);
          }

          // Try using diner_id if that's what the table actually uses
          const { data: fallbackReviews, error: fallbackError } = await supabaseServer
            .from("diner_reviews")
            .select("*")
            .eq("diner_id", (profile as { id: string }).id)
            .order("created_at", { ascending: false });

          if (fallbackError) {
            console.error("Error fetching diner reviews (fallback):", fallbackError);
            return NextResponse.json(
              { error: "Failed to fetch reviews" },
              { status: 500 }
            );
          }

          return NextResponse.json(fallbackReviews || []);
        }
        
        console.error("Error fetching diner reviews:", error);
        return NextResponse.json(
          { error: "Failed to fetch reviews" },
          { status: 500 }
        );
      }

      return NextResponse.json(reviews || []);
    } catch (columnError) {
      console.warn("Error with diner_email column, trying fallback approach:", columnError);
      
      // Final fallback: Get reviews via diner_id
      const { data: profile } = await supabaseServer
        .from("diner_profiles")
        .select("id")
        .eq("email", email)
        .single();

      if (!profile) {
        return NextResponse.json([]);
      }

      const { data: fallbackReviews, error: fallbackError } = await supabaseServer
        .from("diner_reviews")
        .select("*")
        .eq("diner_id", (profile as { id: string }).id)
        .order("created_at", { ascending: false });

      if (fallbackError) {
        console.error("Error fetching diner reviews (final fallback):", fallbackError);
        return NextResponse.json(
          { error: "Failed to fetch reviews" },
          { status: 500 }
        );
      }

      return NextResponse.json(fallbackReviews || []);
    }
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

    // **ANTI-SPAM CHECKS**: Multiple validation layers
    
    // 1. Check for existing review within 7 days (one review per restaurant per week)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentReview } = await supabaseServer
      .from("diner_reviews")
      .select("id, created_at")
      .eq("diner_id", (profile as { id: string }).id)
      .eq("restaurant_id", restaurant_id)
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (recentReview) {
      const lastReviewTime = new Date((recentReview as { created_at: string }).created_at);
      const timeDiff = Date.now() - lastReviewTime.getTime();
      const daysRemaining = Math.ceil((7 * 24 * 60 * 60 * 1000 - timeDiff) / (24 * 60 * 60 * 1000));
      
      return NextResponse.json(
        {
          error: "Review limit reached",
          message: `You can only submit one review per restaurant every 7 days. Try again in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}.`,
          canRetry: true,
          timeRemaining: daysRemaining
        },
        { status: 429 }
      );
    }

    // 2. Check for rapid-fire reviews (max 3 reviews per day across all restaurants)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const { count: todayReviewCount } = await supabaseServer
      .from("diner_reviews")
      .select("id", { count: "exact" })
      .eq("diner_id", (profile as { id: string }).id)
      .gte("created_at", oneDayAgo.toISOString());

    if (todayReviewCount && todayReviewCount >= 3) {
      return NextResponse.json(
        {
          error: "Daily review limit reached",
          message: "You can only submit up to 3 reviews per day. This helps maintain review quality and prevents spam.",
          canRetry: true
        },
        { status: 429 }
      );
    }

    // 3. Require a recent visit to review (must have visited within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentVisit } = await supabaseServer
      .from("diner_visits")
      .select("id, visit_date")
      .eq("diner_id", (profile as { id: string }).id)
      .eq("restaurant_id", restaurant_id)
      .gte("visit_date", thirtyDaysAgo.toISOString())
      .order("visit_date", { ascending: false })
      .limit(1)
      .single();

    if (!recentVisit) {
      return NextResponse.json(
        {
          error: "No recent visit found",
          message: "You need to have visited this restaurant within the last 30 days to leave a review. Please log a visit first!",
          canRetry: false
        },
        { status: 400 }
      );
    }

    // Create the review
    console.log("Creating review record...");

    // First attempt with new schema including is_public and visit_id linking
    let reviewData: Record<string, unknown> = {
      diner_id: (profile as { id: string }).id,
      restaurant_id,
      visit_id: (recentVisit as { id: string }).id, // Link to the recent visit
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
        visit_id: (recentVisit as { id: string }).id, // Still link to recent visit
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

    // Award points for the review with bonuses for quality
    console.log("Awarding points for review...");

    // Calculate review points based on quality
    let reviewPoints = 25; // Base points for review
    
    // Bonus points for detailed review (minimum 20 characters)
    if (review_text && review_text.length >= 20) {
      reviewPoints += 10; // +10 for thoughtful review
    }
    
    // Bonus points for photos
    if (photos && photos.length > 0) {
      reviewPoints += photos.length * 5; // +5 per photo, max reasonable bonus
    }
    
    // Cap total review points at 50 to prevent gaming
    reviewPoints = Math.min(reviewPoints, 50);

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
          total_points: currentPoints + reviewPoints,
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
        console.log(`Points awarded successfully: +${reviewPoints} points`);
      }

      // Also create entry in diner_points table for leaderboard if period exists
      if (activePeriod) {
        const { error: leaderboardPointsError } = await supabaseServer
          .from("diner_points")
          .insert({
            diner_id: (profile as { id: string }).id,
            points: reviewPoints,
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
      points_earned: reviewPoints,
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
