import { getServerSupabaseClient } from "@/lib/supabase-server";
import { 
  MenuItemReview, 
  MenuItemReviewWithDiner, 
  CreateMenuItemReviewData 
} from "@/types/database";

export class MenuItemReviewService {
  // Get all reviews for a specific menu item
  async getMenuItemReviews(menuItemId: string): Promise<MenuItemReviewWithDiner[]> {
    try {
      const supabase = getServerSupabaseClient();
      
      const { data, error } = await supabase
        .from("menu_item_reviews_with_diner")
        .select("*")
        .eq("menu_item_id", menuItemId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching menu item reviews:", error);
      return [];
    }
  }

  // Get a specific review by diner and menu item
  async getDinerReviewForMenuItem(
    dinerId: string, 
    menuItemId: string
  ): Promise<MenuItemReview | null> {
    try {
      const supabase = getServerSupabaseClient();
      
      const { data, error } = await supabase
        .from("menu_item_reviews")
        .select("*")
        .eq("diner_id", dinerId)
        .eq("menu_item_id", menuItemId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data;
    } catch (error) {
      console.error("Error fetching diner review:", error);
      return null;
    }
  }

  // Create a new review
  async createReview(reviewData: CreateMenuItemReviewData): Promise<MenuItemReview | null> {
    try {
      const supabase = getServerSupabaseClient();
      
      const { data, error } = await supabase
        .from("menu_item_reviews")
        .insert([reviewData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating menu item review:", error);
      throw error;
    }
  }

  // Update an existing review
  async updateReview(
    reviewId: string, 
    updates: { rating?: number; review_text?: string }
  ): Promise<MenuItemReview | null> {
    try {
      const supabase = getServerSupabaseClient();
      
      const { data, error } = await supabase
        .from("menu_item_reviews")
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq("id", reviewId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating menu item review:", error);
      throw error;
    }
  }

  // Delete a review
  async deleteReview(reviewId: string): Promise<boolean> {
    try {
      const supabase = getServerSupabaseClient();
      
      const { error } = await supabase
        .from("menu_item_reviews")
        .delete()
        .eq("id", reviewId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting menu item review:", error);
      return false;
    }
  }

  // Get review statistics for a menu item
  async getMenuItemReviewStats(menuItemId: string): Promise<{
    total_reviews: number;
    average_rating: number;
    rating_distribution: { [key: number]: number };
  }> {
    try {
      const supabase = getServerSupabaseClient();
      
      const { data, error } = await supabase
        .from("menu_item_reviews")
        .select("rating")
        .eq("menu_item_id", menuItemId);

      if (error) throw error;

      const reviews = data || [];
      const total_reviews = reviews.length;
      const average_rating = total_reviews > 0 
        ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / total_reviews 
        : 0;

      // Calculate rating distribution
      const rating_distribution: { [key: number]: number } = {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0
      };
      reviews.forEach((review: { rating: number }) => {
        rating_distribution[review.rating] = (rating_distribution[review.rating] || 0) + 1;
      });

      return {
        total_reviews,
        average_rating: Math.round(average_rating * 100) / 100,
        rating_distribution
      };
    } catch (error) {
      console.error("Error fetching review stats:", error);
      return {
        total_reviews: 0,
        average_rating: 0,
        rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }
  }

  // Get recent reviews for a restaurant
  async getRestaurantRecentReviews(
    restaurantId: string, 
    limit: number = 10
  ): Promise<MenuItemReviewWithDiner[]> {
    try {
      const supabase = getServerSupabaseClient();
      
      const { data, error } = await supabase
        .from("menu_item_reviews_with_diner")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching restaurant reviews:", error);
      return [];
    }
  }
}

export const menuItemReviewService = new MenuItemReviewService();
