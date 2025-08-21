import { getSupabaseClient } from "./supabase";
import { 
  LeaderboardData,
  LeaderboardEntry
} from "@/types/database";

export class LeaderboardService {
  private supabase = getSupabaseClient();

  // Award points for a visit
  async awardVisitPoints(dinerId: string, visitId: string, restaurantId?: string): Promise<string | null> {
    try {
      const { data, error } = await this.supabase.rpc('award_diner_points', {
        p_diner_id: dinerId,
        p_points: 10, // 10 points for visits
        p_earned_from: 'visit',
        p_source_id: visitId,
        p_restaurant_id: restaurantId
      });

      if (error) {
        return null;
      }

      return data;
    } catch {
      return null;
    }
  }

  // Award points for a review
  async awardReviewPoints(dinerId: string, reviewId: string, restaurantId?: string): Promise<string | null> {
    try {
      const { data, error } = await this.supabase.rpc('award_diner_points', {
        p_diner_id: dinerId,
        p_points: 25, // 25 points for reviews
        p_earned_from: 'review',
        p_source_id: reviewId,
        p_restaurant_id: restaurantId
      });

      if (error) {
        return null;
      }

      return data;
    } catch {
      return null;
    }
  }

  // Get current leaderboard data
  async getCurrentLeaderboard(currentDinerEmail?: string): Promise<LeaderboardData | null> {
    try {
      // Get current active period
      const { data: periods, error: periodError } = await this.supabase
        .from('leaderboard_periods')
        .select('*')
        .eq('status', 'active')
        .single();

      if (periodError) {
        // If table doesn't exist (relation error), return a helpful message
        if (periodError.message?.includes('relation') || periodError.message?.includes('does not exist')) {
          return null;
        }
        
        // If no active period exists (0 rows), create one
        if (periodError.code === 'PGRST116' && periodError.details?.includes('0 rows')) {
          const newPeriodId = await this.createCurrentWeekPeriod();
          if (newPeriodId) {
            // Retry with the new period
            return await this.getCurrentLeaderboard(currentDinerEmail);
          }
        }
        
        return null;
      }

      if (!periods) {
        const newPeriodId = await this.createCurrentWeekPeriod();
        if (newPeriodId) {
          // Retry with the new period
          return await this.getCurrentLeaderboard(currentDinerEmail);
        }
        return null;
      }

      // Ensure rankings are up to date
      const updated = await this.updateRankings(periods.id);
      if (!updated) {
        // Fallback to simpler refresh function
        await this.refreshCurrentRankings();
      }

      // Get top 10 rankings with diner profiles
      const { data: rankings, error: rankingsError } = await this.supabase
        .from('leaderboard_rankings')
        .select(`
          *,
          diner_profiles!inner (
            email
          )
        `)
        .eq('leaderboard_period_id', periods.id)
        .order('rank', { ascending: true })
        .limit(10);

      if (rankingsError) {
        return null;
      }

      // Get prize restaurant (most reviewed restaurant this week)
      const prizeRestaurant = await this.getPrizeRestaurant(periods.id);

      // Format top entries
      const topEntries: LeaderboardEntry[] = (rankings || []).map((ranking) => ({
        rank: ranking.rank,
        diner_name: ranking.diner_profiles.email.split('@')[0], // Use email prefix as display name
        total_points: ranking.total_points,
        is_current_user: currentDinerEmail === ranking.diner_profiles.email,
        is_winner: ranking.is_winner,
        profile_photo_url: undefined // No profile photo for now
      }));

      // Get current user's ranking if not in top 10
      let currentUserEntry: LeaderboardEntry | undefined;
      if (currentDinerEmail) {
        const userInTop10 = topEntries.find(entry => entry.is_current_user);
        if (!userInTop10) {
          currentUserEntry = await this.getCurrentUserRanking(periods.id, currentDinerEmail);
        }
      }

      return {
        current_period: periods,
        top_entries: topEntries,
        current_user_entry: currentUserEntry,
        prize_restaurant: prizeRestaurant
      };
    } catch {
      return null;
    }
  }

  // Get current user's ranking
  private async getCurrentUserRanking(periodId: string, dinerEmail: string): Promise<LeaderboardEntry | undefined> {
    try {
      const { data, error } = await this.supabase
        .from('leaderboard_rankings')
        .select(`
          *,
          diner_profiles!inner (
            email
          )
        `)
        .eq('leaderboard_period_id', periodId)
        .eq('diner_profiles.email', dinerEmail)
        .maybeSingle(); // Use maybeSingle() instead of single() to handle no results

      if (error || !data) {
        return undefined;
      }

      return {
        rank: data.rank,
        diner_name: data.diner_profiles.email.split('@')[0], // Use email prefix as display name
        total_points: data.total_points,
        is_current_user: true,
        is_winner: data.is_winner,
        profile_photo_url: undefined // No profile photo for now
      };
    } catch {
      return undefined;
    }
  }

  // Get the restaurant that will provide the prize (most reviewed this week)
  private async getPrizeRestaurant(periodId: string): Promise<{ id: string; name: string } | undefined> {
    try {
      const { data, error } = await this.supabase
        .from('diner_points')
        .select(`
          restaurant_id,
          restaurants!inner (
            id,
            name
          )
        `)
        .eq('leaderboard_period_id', periodId)
        .eq('earned_from', 'review')
        .not('restaurant_id', 'is', null);

      if (error || !data) {
        return undefined;
      }

      // Count reviews per restaurant
      const restaurantCounts: { [key: string]: { count: number; restaurant: { id: string; name: string } } } = {};
      
      data.forEach((point) => {
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

      // Find restaurant with most reviews
      let maxCount = 0;
      let prizeRestaurant: { id: string; name: string } | undefined;

      Object.values(restaurantCounts).forEach(({ count, restaurant }) => {
        if (count > maxCount) {
          maxCount = count;
          prizeRestaurant = {
            id: restaurant.id,
            name: restaurant.name
          };
        }
      });

      return prizeRestaurant;
    } catch {
      return undefined;
    }
  }

  // Get diner's current points for this period
  async getDinerCurrentPoints(dinerEmail: string): Promise<number> {
    try {
      // Get current period
      const { data: period, error: periodError } = await this.supabase
        .from('leaderboard_periods')
        .select('id')
        .eq('status', 'active')
        .single();

      if (periodError || !period) {
        return 0;
      }

      // Get diner's ranking
      const { data: ranking, error: rankingError } = await this.supabase
        .from('leaderboard_rankings')
        .select('total_points')
        .eq('leaderboard_period_id', period.id)
        .eq('diner_profiles.email', dinerEmail)
        .single();

      if (rankingError || !ranking) {
        return 0;
      }

      return ranking.total_points;
    } catch {
      return 0;
    }
  }

  // Complete a leaderboard period and determine winner
  async completePeriod(periodId: string): Promise<boolean> {
    try {
      // Update period status to completed
      const { error: updateError } = await this.supabase
        .from('leaderboard_periods')
        .update({ status: 'completed' })
        .eq('id', periodId);

      if (updateError) {
        return false;
      }

      // Final ranking update
      const { error: rankingError } = await this.supabase.rpc('update_leaderboard_rankings', {
        period_id: periodId
      });

      if (rankingError) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  // Create a new leaderboard period
  async createNewPeriod(startDate: string, endDate: string): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('leaderboard_periods')
        .insert({
          start_date: startDate,
          end_date: endDate,
          status: 'active'
        })
        .select('id')
        .single();

      if (error) {
        return null;
      }

      return data.id;
    } catch {
      return null;
    }
  }

  /**
   * Manually update rankings for a specific period
   */
  async updateRankings(periodId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.rpc('update_leaderboard_rankings', {
        period_id: periodId
      });

      if (error) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Refresh current leaderboard rankings using simpler function
   */
  async refreshCurrentRankings(): Promise<boolean> {
    try {
      const { error } = await this.supabase.rpc('refresh_current_leaderboard');
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Create current week period manually
   */
  private async createCurrentWeekPeriod(): Promise<string | null> {
    try {
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Calculate start of current week (Monday)
      const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay;
      const startDate = new Date(now);
      startDate.setDate(now.getDate() + daysToMonday);
      startDate.setHours(0, 0, 0, 0);
      
      // Calculate end of current week (Sunday)
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      
      const { data, error } = await this.supabase
        .from('leaderboard_periods')
        .insert([{
          start_date: startDate.toISOString().split('T')[0], // DATE format: YYYY-MM-DD
          end_date: endDate.toISOString().split('T')[0],     // DATE format: YYYY-MM-DD
          status: 'active'
        }])
        .select('id')
        .single();
      
      if (error) {
        return null;
      }
      
      return data.id;
    } catch {
      return null;
    }
  }
}

export const leaderboardService = new LeaderboardService();
