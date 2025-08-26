import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('email');
    
    const supabase = getSupabaseClient();
    
    // Get current active period
    const { data: currentPeriod, error: periodError } = await supabase
      .from('leaderboard_periods')
      .select('*')
      .eq('status', 'active')
      .single();
    
    if (periodError || !currentPeriod) {
      return NextResponse.json({
        success: false,
        error: "No active leaderboard period found",
        details: periodError
      });
    }
    
    // Get all points for this period and calculate leaderboard
    const { data: pointsData, error: pointsError } = await supabase
      .from('diner_points')
      .select(`
        *,
        diner_profiles!inner (
          email,
          display_name
        )
      `)
      .eq('leaderboard_period_id', currentPeriod.id);
    
    if (pointsError) {
      return NextResponse.json({
        success: false,
        error: "Failed to fetch points data",
        details: pointsError
      });
    }
    
    if (!pointsData || pointsData.length === 0) {
      return NextResponse.json({
        success: true,
        leaderboard: {
          current_period: currentPeriod,
          top_entries: [],
          current_user_entry: undefined,
          prize_restaurant: undefined
        }
      });
    }
    
    // Calculate totals per diner
    const dinerTotals: { [email: string]: { points: number, name: string } } = {};
    
    pointsData.forEach(point => {
      const email = point.diner_profiles.email;
      const name = point.diner_profiles.display_name || email.split('@')[0];
      
      if (!dinerTotals[email]) {
        dinerTotals[email] = { points: 0, name };
      }
      dinerTotals[email].points += point.points;
    });
    
    // Convert to sorted leaderboard
    const sortedEntries = Object.entries(dinerTotals)
      .map(([email, data]) => ({
        email,
        diner_name: data.name,
        total_points: data.points,
        is_current_user: userEmail === email,
        is_winner: false, // Will set later
        profile_photo_url: undefined
      }))
      .sort((a, b) => b.total_points - a.total_points)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
        is_winner: index === 0 // Winner is #1
      }));
    
    // Get top 10 (only show if user is authenticated)
    const topEntries = userEmail ? sortedEntries.slice(0, 10) : [];
    
    // Get current user entry if not in top 10
    let currentUserEntry = undefined;
    if (userEmail) {
      const userInTop10 = topEntries.find(entry => entry.is_current_user);
      if (!userInTop10) {
        currentUserEntry = sortedEntries.find(entry => entry.is_current_user);
      }
    }
    
    // Get prize restaurant (most reviewed restaurant this week)
    let prizeRestaurant = undefined;
    const { data: reviewPoints, error: reviewError } = await supabase
      .from('diner_points')
      .select(`
        restaurant_id,
        restaurants!inner (
          id,
          name
        )
      `)
      .eq('leaderboard_period_id', currentPeriod.id)
      .eq('earned_from', 'review')
      .not('restaurant_id', 'is', null);
    
    if (!reviewError && reviewPoints && reviewPoints.length > 0) {
      const restaurantCounts: { [key: string]: { count: number; restaurant: { id: string; name: string } } } = {};
      
      reviewPoints.forEach((point) => {
        const restaurantId = point.restaurant_id;
        const restaurant = Array.isArray(point.restaurants) ? point.restaurants[0] : point.restaurants;
        
        if (restaurantCounts[restaurantId]) {
          restaurantCounts[restaurantId].count++;
        } else {
          restaurantCounts[restaurantId] = {
            count: 1,
            restaurant: {
              id: restaurant.id,
              name: restaurant.name
            }
          };
        }
      });
      
      let maxCount = 0;
      Object.values(restaurantCounts).forEach(({ count, restaurant }) => {
        if (count > maxCount) {
          maxCount = count;
          prizeRestaurant = {
            id: restaurant.id,
            name: restaurant.name
          };
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      leaderboard: {
        current_period: currentPeriod,
        top_entries: topEntries,
        current_user_entry: currentUserEntry,
        prize_restaurant: prizeRestaurant
      },
      debug: {
        totalPoints: pointsData.length,
        totalDiners: Object.keys(dinerTotals).length,
        periodId: currentPeriod.id
      }
    });

  } catch (error) {
    console.error("Direct leaderboard API error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error", 
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
