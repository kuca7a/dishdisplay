import { getSupabaseClient } from "@/lib/supabase";
import {
  DinerProfile,
  VisitToken,
  DinerVisit,
  DinerReview,
  CompetitionEntry,
  DinerBadge,
  UpdateDinerProfileData,
  CreateVisitTokenData,
  RedeemVisitTokenData,
  CreateReviewData,
  UpdateReviewData,
} from "@/types/database";
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development';

interface JWTPayload {
  restaurant_id: string;
  table_identifier?: string;
  bill_identifier?: string;
  exp: number;
  nonce: string;
}

// Diner Profile operations
export const dinerProfileService = {
  // Get or create diner profile
  async getOrCreate(email: string, displayName?: string): Promise<DinerProfile> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error("Database not available");
    }

    // Try to get existing profile
    const { data: existing, error: getError } = await supabase
      .from("diner_profiles")
      .select("*")
      .eq("email", email)
      .single();

    if (existing) return existing;

    // Create new profile if doesn't exist
    if (getError?.code === "PGRST116") {
      const { data, error } = await supabase
        .from("diner_profiles")
        .insert([{
          email,
          display_name: displayName || email.split('@')[0],
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    throw getError;
  },

  // Update diner profile
  async update(email: string, updates: UpdateDinerProfileData): Promise<DinerProfile> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error("Database not available");
    }

    const { data, error } = await supabase
      .from("diner_profiles")
      .update(updates)
      .eq("email", email)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get diner profile by email
  async getByEmail(email: string): Promise<DinerProfile | null> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error("Database not available");
    }

    const { data, error } = await supabase
      .from("diner_profiles")
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data;
  },

  // Get public profiles (for community features)
  async getPublicProfiles(limit = 50): Promise<DinerProfile[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error("Database not available");
    }

    const { data, error } = await supabase
      .from("diner_profiles")
      .select("*")
      .eq("is_public", true)
      .order("total_points", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },
};

// Visit Token operations (OVT system)
export const visitTokenService = {
  // Create a new visit token for a restaurant
  async create(restaurantId: string, tokenData: Omit<CreateVisitTokenData, 'restaurant_id'>): Promise<{token: string, tokenRecord: VisitToken}> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error("Database not available");
    }

    // Generate JWT token
    const expiresInMinutes = tokenData.expires_in_minutes || 30;
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
    
    const tokenPayload = {
      restaurant_id: restaurantId,
      table_identifier: tokenData.table_identifier,
      bill_identifier: tokenData.bill_identifier,
      exp: Math.floor(expiresAt.getTime() / 1000),
      nonce: crypto.randomBytes(16).toString('hex'),
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET);
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Store token record
    const { data, error } = await supabase
      .from("visit_tokens")
      .insert([{
        restaurant_id: restaurantId,
        table_identifier: tokenData.table_identifier,
        bill_identifier: tokenData.bill_identifier,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return { token, tokenRecord: data };
  },

  // Redeem a visit token
  async redeem(tokenString: string, dinerEmail: string, additionalData?: Omit<RedeemVisitTokenData, 'token' | 'diner_email'>): Promise<DinerVisit> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error("Database not available");
    }

    try {
      // Verify JWT token
      jwt.verify(tokenString, JWT_SECRET) as JWTPayload;
      const tokenHash = crypto.createHash('sha256').update(tokenString).digest('hex');

      // Find and validate token
      const { data: tokenRecord, error: tokenError } = await supabase
        .from("visit_tokens")
        .select("*")
        .eq("token_hash", tokenHash)
        .eq("is_redeemed", false)
        .single();

      if (tokenError || !tokenRecord) {
        throw new Error("Invalid or expired token");
      }

      // Check if token is expired
      if (new Date(tokenRecord.expires_at) < new Date()) {
        throw new Error("Token has expired");
      }

      // Mark token as redeemed
      await supabase
        .from("visit_tokens")
        .update({
          is_redeemed: true,
          redeemed_by: dinerEmail,
          redeemed_at: new Date().toISOString(),
        })
        .eq("id", tokenRecord.id);

      // Create visit record
      const { data: visit, error: visitError } = await supabase
        .from("diner_visits")
        .insert([{
          diner_email: dinerEmail,
          restaurant_id: tokenRecord.restaurant_id,
          visit_token_id: tokenRecord.id,
          dishes_viewed: additionalData?.dishes_viewed || [],
          time_spent_minutes: additionalData?.time_spent_minutes,
          points_earned: 10, // Base points for a visit
        }])
        .select()
        .single();

      if (visitError) throw visitError;
      return visit;
      
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid token format");
      }
      throw error;
    }
  },

  // Clean up expired tokens (should be run periodically)
  async cleanupExpired(): Promise<number> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error("Database not available");
    }

    const { data, error } = await supabase
      .from("visit_tokens")
      .delete()
      .lt("expires_at", new Date().toISOString())
      .select("id");

    if (error) throw error;
    return data?.length || 0;
  },
};

// Diner Visits operations
export const dinerVisitService = {
  // Get visits for a diner
  async getByDinerEmail(email: string, limit = 50): Promise<DinerVisit[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error("Database not available");
    }

    const { data, error } = await supabase
      .from("diner_visits")
      .select(`
        *,
        restaurants:restaurant_id (
          id,
          name,
          logo_url,
          address,
          city
        )
      `)
      .eq("diner_email", email)
      .order("visit_date", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // Get visits for a restaurant
  async getByRestaurantId(restaurantId: string, limit = 100): Promise<DinerVisit[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error("Database not available");
    }

    const { data, error } = await supabase
      .from("diner_visits")
      .select(`
        *,
        diner_profiles:diner_email (
          display_name,
          profile_photo_url,
          is_public
        )
      `)
      .eq("restaurant_id", restaurantId)
      .order("visit_date", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },
};

// Diner Reviews operations
export const dinerReviewService = {
  // Create a review
  async create(dinerEmail: string, reviewData: CreateReviewData): Promise<DinerReview> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error("Database not available");
    }

    // Get visit details to extract restaurant_id
    const { data: visit, error: visitError } = await supabase
      .from("diner_visits")
      .select("restaurant_id")
      .eq("id", reviewData.visit_id)
      .eq("diner_email", dinerEmail)
      .single();

    if (visitError || !visit) {
      throw new Error("Visit not found or unauthorized");
    }

    // Calculate points for review (base + bonuses)
    let pointsEarned = 25; // Base points
    if (reviewData.content && reviewData.content.length > 50) pointsEarned += 10;
    if (reviewData.photo_urls && reviewData.photo_urls.length > 0) pointsEarned += 15;

    const { data, error } = await supabase
      .from("diner_reviews")
      .insert([{
        diner_email: dinerEmail,
        restaurant_id: visit.restaurant_id,
        ...reviewData,
        points_earned: pointsEarned,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a review
  async update(reviewId: string, dinerEmail: string, updates: UpdateReviewData): Promise<DinerReview> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error("Database not available");
    }

    const { data, error } = await supabase
      .from("diner_reviews")
      .update(updates)
      .eq("id", reviewId)
      .eq("diner_email", dinerEmail)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a review
  async delete(reviewId: string, dinerEmail: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error("Database not available");
    }

    const { error } = await supabase
      .from("diner_reviews")
      .delete()
      .eq("id", reviewId)
      .eq("diner_email", dinerEmail);

    if (error) throw error;
  },

  // Get reviews by diner
  async getByDinerEmail(email: string, limit = 50): Promise<DinerReview[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error("Database not available");
    }

    const { data, error } = await supabase
      .from("diner_reviews")
      .select(`
        *,
        restaurants:restaurant_id (
          id,
          name,
          logo_url
        ),
        diner_visits:visit_id (
          visit_date
        )
      `)
      .eq("diner_email", email)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // Get public reviews for a restaurant
  async getByRestaurantId(restaurantId: string, limit = 50): Promise<DinerReview[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error("Database not available");
    }

    const { data, error } = await supabase
      .from("diner_reviews")
      .select(`
        *,
        diner_profiles:diner_email (
          display_name,
          profile_photo_url,
          is_public
        ),
        diner_visits:visit_id (
          visit_date
        )
      `)
      .eq("restaurant_id", restaurantId)
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // Get all reviews for restaurant (including private data) - for restaurant owners
  async getAllByRestaurantId(restaurantId: string, limit = 100): Promise<DinerReview[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error("Database not available");
    }

    const { data, error } = await supabase
      .from("diner_reviews")
      .select(`
        *,
        diner_profiles:diner_email (
          display_name,
          profile_photo_url
        ),
        diner_visits:visit_id (
          visit_date
        )
      `)
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },
};

// Competition operations
export const competitionService = {
  // Get current week's leaderboard for a restaurant
  async getWeeklyLeaderboard(restaurantId: string, week?: string): Promise<CompetitionEntry[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error("Database not available");
    }

    // Get current ISO week if not provided
    const currentWeek = week || getCurrentISOWeek();

    const { data, error } = await supabase
      .from("competition_entries")
      .select(`
        *,
        diner_profiles:diner_email (
          display_name,
          profile_photo_url,
          is_public
        )
      `)
      .eq("restaurant_id", restaurantId)
      .eq("competition_week", currentWeek)
      .order("total_points", { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  },

  // Update/create competition entry for a diner
  async updateEntry(dinerEmail: string, restaurantId: string, week?: string): Promise<CompetitionEntry> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error("Database not available");
    }

    const currentWeek = week || getCurrentISOWeek();

    // Calculate total points for the week
    const { data: visits, error: visitsError } = await supabase
      .from("diner_visits")
      .select("points_earned")
      .eq("diner_email", dinerEmail)
      .eq("restaurant_id", restaurantId)
      .gte("visit_date", getWeekStart(currentWeek))
      .lte("visit_date", getWeekEnd(currentWeek));

    if (visitsError) throw visitsError;

    const { data: reviews, error: reviewsError } = await supabase
      .from("diner_reviews")
      .select("points_earned")
      .eq("diner_email", dinerEmail)
      .eq("restaurant_id", restaurantId)
      .gte("created_at", getWeekStart(currentWeek))
      .lte("created_at", getWeekEnd(currentWeek));

    if (reviewsError) throw reviewsError;

    const totalPoints = 
      (visits?.reduce((sum, v) => sum + v.points_earned, 0) || 0) +
      (reviews?.reduce((sum, r) => sum + r.points_earned, 0) || 0);

    // Upsert competition entry
    const { data, error } = await supabase
      .from("competition_entries")
      .upsert([{
        diner_email: dinerEmail,
        restaurant_id: restaurantId,
        competition_week: currentWeek,
        total_points: totalPoints,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Badge operations
export const badgeService = {
  // Award a badge to a diner
  async award(dinerEmail: string, badgeType: DinerBadge['badge_type'], restaurantId?: string): Promise<DinerBadge> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error("Database not available");
    }

    const badgeDefinitions = {
      first_visit: { name: "First Visit", description: "Completed your first restaurant visit" },
      frequent_visitor: { name: "Regular", description: "Visited the same restaurant 5+ times" },
      reviewer: { name: "Critic", description: "Left 10+ reviews" },
      photographer: { name: "Food Photographer", description: "Uploaded 25+ photos" },
      explorer: { name: "Explorer", description: "Visited 10+ different restaurants" },
      champion: { name: "Weekly Champion", description: "Won the weekly competition" },
    };

    const badge = badgeDefinitions[badgeType];
    if (!badge) throw new Error("Unknown badge type");

    const { data, error } = await supabase
      .from("diner_badges")
      .upsert([{
        diner_email: dinerEmail,
        badge_type: badgeType,
        badge_name: badge.name,
        badge_description: badge.description,
        restaurant_id: restaurantId,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get badges for a diner
  async getByDinerEmail(email: string): Promise<DinerBadge[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error("Database not available");
    }

    const { data, error } = await supabase
      .from("diner_badges")
      .select(`
        *,
        restaurants:restaurant_id (
          name,
          logo_url
        )
      `)
      .eq("diner_email", email)
      .order("earned_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Check and award automatic badges
  async checkAndAwardBadges(dinerEmail: string, restaurantId?: string): Promise<DinerBadge[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error("Database not available");
    }

    const newBadges: DinerBadge[] = [];

    // Check for first visit badge
    const { data: visits } = await supabase
      .from("diner_visits")
      .select("id")
      .eq("diner_email", dinerEmail)
      .limit(1);

    if (visits?.length === 1) {
      try {
        const badge = await this.award(dinerEmail, 'first_visit', restaurantId);
        newBadges.push(badge);
      } catch {
        // Badge might already exist, ignore
      }
    }

    // Check for reviewer badge (10+ reviews)
    const { data: reviews } = await supabase
      .from("diner_reviews")
      .select("id")
      .eq("diner_email", dinerEmail);

    if (reviews && reviews.length >= 10) {
      try {
        const badge = await this.award(dinerEmail, 'reviewer');
        newBadges.push(badge);
      } catch {
        // Badge might already exist, ignore
      }
    }

    // Check for frequent visitor badge (5+ visits to same restaurant)
    if (restaurantId) {
      const { data: restaurantVisits } = await supabase
        .from("diner_visits")
        .select("id")
        .eq("diner_email", dinerEmail)
        .eq("restaurant_id", restaurantId);

      if (restaurantVisits && restaurantVisits.length >= 5) {
        try {
          const badge = await this.award(dinerEmail, 'frequent_visitor', restaurantId);
          newBadges.push(badge);
        } catch {
          // Badge might already exist, ignore
        }
      }
    }

    return newBadges;
  },
};

// Utility functions
function getCurrentISOWeek(): string {
  const now = new Date();
  const year = now.getFullYear();
  const week = getISOWeek(now);
  return `${year}-W${week.toString().padStart(2, '0')}`;
}

function getISOWeek(date: Date): number {
  const target = new Date(date.valueOf());
  const dayNumber = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNumber + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}

function getWeekStart(isoWeek: string): string {
  const [year, week] = isoWeek.split('-W').map(Number);
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = simple;
  if (dow <= 4)
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  else
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  return ISOweekStart.toISOString();
}

function getWeekEnd(isoWeek: string): string {
  const start = new Date(getWeekStart(isoWeek));
  start.setDate(start.getDate() + 6);
  start.setHours(23, 59, 59, 999);
  return start.toISOString();
}
