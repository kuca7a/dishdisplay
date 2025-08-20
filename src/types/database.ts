export interface Restaurant {
  id: string;
  name: string;
  owner_email: string;
  description?: string;
  phone?: string;
  business_email?: string;
  website?: string;
  business_type?: string;
  // Location fields
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  // Hours fields
  monday_hours?: string;
  tuesday_hours?: string;
  wednesday_hours?: string;
  thursday_hours?: string;
  friday_hours?: string;
  saturday_hours?: string;
  sunday_hours?: string;
  timezone?: string;
  // Media & Branding fields
  logo_url?: string;
  cover_image_url?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  font_family?: string;
  theme_style?: string;
  social_facebook?: string;
  social_instagram?: string;
  social_twitter?: string;
  social_linkedin?: string;
  social_tiktok?: string;
  // Stripe & Subscription fields
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  subscription_status?:
    | "active"
    | "inactive"
    | "trialing"
    | "past_due"
    | "canceled"
    | "unpaid";
  subscription_plan?: "free" | "pro";
  subscription_start_date?: string;
  subscription_end_date?: string;
  trial_end_date?: string;
  payment_method_id?: string;
  billing_email?: string;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  price: number;
  category: "appetizer" | "main" | "dessert" | "drink";
  image_url?: string;
  is_available: boolean;
  time_to_make?: string;
  // New required nutritional fields
  detailed_description: string; // Required detailed description
  calories: number; // Required calorie count
  allergens: string[]; // Required allergens list as JSON array
  ingredients: string; // Required ingredients text
  created_at: string;
  updated_at: string;
}

export interface CreateRestaurantData {
  name: string;
  owner_email: string;
  description?: string;
  phone?: string;
  business_email?: string;
  website?: string;
  business_type?: string;
  // Location fields
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  // Hours fields
  monday_hours?: string;
  tuesday_hours?: string;
  wednesday_hours?: string;
  thursday_hours?: string;
  friday_hours?: string;
  saturday_hours?: string;
  sunday_hours?: string;
  timezone?: string;
  // Media & Branding fields
  logo_url?: string;
  cover_image_url?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  font_family?: string;
  theme_style?: string;
  social_facebook?: string;
  social_instagram?: string;
  social_twitter?: string;
  social_linkedin?: string;
  social_tiktok?: string;
}

export interface UpdateRestaurantData {
  name?: string;
  description?: string;
  phone?: string;
  business_email?: string;
  website?: string;
  business_type?: string;
  // Location fields
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  // Hours fields
  monday_hours?: string;
  tuesday_hours?: string;
  wednesday_hours?: string;
  thursday_hours?: string;
  friday_hours?: string;
  saturday_hours?: string;
  sunday_hours?: string;
  timezone?: string;
  // Media & Branding fields
  logo_url?: string;
  cover_image_url?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  font_family?: string;
  theme_style?: string;
  social_facebook?: string;
  social_instagram?: string;
  social_twitter?: string;
  social_linkedin?: string;
  social_tiktok?: string;
}

export interface CreateMenuItemData {
  restaurant_id: string;
  name: string;
  description?: string;
  price: number;
  category: "appetizer" | "main" | "dessert" | "drink";
  image_url?: string;
  is_available?: boolean;
  time_to_make?: string;
  // New required nutritional fields
  detailed_description: string;
  calories: number;
  allergens: string[];
  ingredients: string;
}

export interface UpdateMenuItemData {
  name?: string;
  description?: string;
  price?: number;
  category?: "appetizer" | "main" | "dessert" | "drink";
  image_url?: string;
  is_available?: boolean;
  time_to_make?: string;
  // New required nutritional fields
  detailed_description?: string;
  calories?: number;
  allergens?: string[];
  ingredients?: string;
}

// Stripe & Payment types
export interface SubscriptionPlan {
  id: string;
  name: string;
  stripe_price_id: string;
  price: number; // in cents
  currency: string;
  billing_interval: "month" | "year";
  features: Record<string, boolean | number | string>;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  restaurant_id: string;
  stripe_payment_intent_id: string;
  stripe_invoice_id?: string;
  amount: number; // in cents
  currency: string;
  status:
    | "requires_payment_method"
    | "requires_confirmation"
    | "requires_action"
    | "processing"
    | "succeeded"
    | "canceled"
    | "requires_capture";
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSubscriptionData {
  restaurant_id: string;
  price_id: string;
  payment_method_id?: string;
}

export interface UpdateSubscriptionData {
  price_id?: string;
  cancel_at_period_end?: boolean;
}

// Diner Profile & Review System Types
export interface DinerProfile {
  id: string;
  email: string;
  display_name: string;
  profile_photo_url?: string;
  join_date: string;
  total_visits: number;
  total_points: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface VisitToken {
  id: string;
  restaurant_id: string;
  table_identifier?: string;
  bill_identifier?: string;
  token_hash: string;
  expires_at: string;
  is_redeemed: boolean;
  redeemed_by?: string;
  redeemed_at?: string;
  created_at: string;
}

export interface DinerVisit {
  id: string;
  diner_id: string;
  restaurant_id: string;
  visit_date: string;
  visit_token: string;
  time_spent_minutes?: number;
  dishes_viewed?: string[];
  points_earned: number;
  review_id?: string;
  created_at: string;
  updated_at: string;
  // Extended with restaurant data when fetched with joins
  restaurants?: {
    id: string;
    name: string;
    logo_url?: string;
    address?: string;
    city?: string;
  };
}

export interface DinerReview {
  id: string;
  diner_email: string;
  restaurant_id: string;
  visit_id: string;
  rating: number; // 1-5 stars
  title?: string;
  content?: string;
  photo_urls?: string[]; // JSON array of photo URLs
  // Public fields (shown on restaurant page)
  is_public: boolean;
  // Private structured feedback (only visible to restaurant)
  service_speed_rating?: number; // 1-5
  cleanliness_rating?: number; // 1-5
  food_quality_rating?: number; // 1-5
  value_rating?: number; // 1-5
  ambiance_rating?: number; // 1-5
  private_tags?: string[]; // JSON array of tags
  would_recommend: boolean;
  points_earned: number;
  created_at: string;
  updated_at: string;
}

export interface CompetitionEntry {
  id: string;
  diner_id: string;
  competition_id: string;
  entry_date: string;
  score?: number;
  created_at: string;
  updated_at: string;
  // Extended with competition data when fetched with joins
  competitions?: {
    id: string;
    title: string;
    description?: string;
    start_date: string;
    end_date: string;
  };
}

export interface DinerBadge {
  id: string;
  diner_email: string;
  badge_type: 'first_visit' | 'frequent_visitor' | 'reviewer' | 'photographer' | 'explorer' | 'champion';
  badge_name: string;
  badge_description: string;
  icon_url?: string;
  earned_at: string;
  restaurant_id?: string; // If badge is restaurant-specific
}

// Create/Update types for diner system
export interface CreateDinerProfileData {
  email: string;
  display_name: string;
  profile_photo_url?: string;
  is_public?: boolean;
}

export interface UpdateDinerProfileData {
  display_name?: string;
  profile_photo_url?: string;
  is_public?: boolean;
}

export interface CreateVisitTokenData {
  restaurant_id: string;
  table_identifier?: string;
  bill_identifier?: string;
  expires_in_minutes?: number; // defaults to 30
}

export interface RedeemVisitTokenData {
  token: string;
  diner_email: string;
  dishes_viewed?: string[];
  time_spent_minutes?: number;
}

export interface CreateReviewData {
  visit_id: string;
  rating: number;
  title?: string;
  content?: string;
  photo_urls?: string[];
  is_public?: boolean;
  service_speed_rating?: number;
  cleanliness_rating?: number;
  food_quality_rating?: number;
  value_rating?: number;
  ambiance_rating?: number;
  private_tags?: string[];
  would_recommend: boolean;
}

export interface UpdateReviewData {
  rating?: number;
  title?: string;
  content?: string;
  photo_urls?: string[];
  is_public?: boolean;
  service_speed_rating?: number;
  cleanliness_rating?: number;
  food_quality_rating?: number;
  value_rating?: number;
  ambiance_rating?: number;
  private_tags?: string[];
  would_recommend?: boolean;
}

// Analytics System Types
export interface AnalyticsEvent {
  id: string;
  restaurant_id: string;
  event_type: 'menu_view' | 'qr_scan' | 'item_view' | 'item_detail_click' | 'visit_marked' | 'review_submitted';
  session_id?: string;
  user_agent?: string;
  ip_address?: string;
  event_data: Record<string, string | number | boolean | null>; // JSONB field for flexible event data
  timestamp: string;
  duration_seconds?: number;
  referrer_url?: string;
  page_url?: string;
  created_at: string;
}

export interface MenuItemAnalytics {
  id: string;
  restaurant_id: string;
  menu_item_id: string;
  date: string;
  view_count: number;
  unique_viewers: number;
  total_view_time_seconds: number;
  average_view_time_seconds: number;
  clicks_to_details: number;
  created_at: string;
  updated_at: string;
  // Extended with menu item data when fetched with joins
  menu_items?: {
    id: string;
    name: string;
    category: string;
    price: number;
    image_url?: string;
  };
}

export interface RestaurantAnalytics {
  id: string;
  restaurant_id: string;
  date: string;
  qr_scans: number;
  menu_views: number;
  unique_visitors: number;
  total_session_time_seconds: number;
  average_session_time_seconds: number;
  item_detail_views: number;
  visits_marked: number;
  reviews_submitted: number;
  average_rating?: number;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsSession {
  id: string;
  session_id: string;
  restaurant_id: string;
  first_seen: string;
  last_seen: string;
  page_views: number;
  user_agent?: string;
  ip_address?: string;
  device_type?: string;
  browser?: string;
  entry_url?: string;
  referrer_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAnalyticsEventData {
  restaurant_id: string;
  event_type: 'menu_view' | 'qr_scan' | 'item_view' | 'item_detail_click' | 'visit_marked' | 'review_submitted';
  session_id?: string;
  event_data?: Record<string, string | number | boolean | null>;
  duration_seconds?: number;
  referrer_url?: string;
  page_url?: string;
}

export interface AnalyticsOverview {
  totalMenuViews: number;
  totalQrScans: number;
  averageViewTimeSeconds: number;
  uniqueVisitors: number;
  menuViewsChange: number; // percentage change from previous period
  qrScansChange: number;
  viewTimeChange: number;
  uniqueVisitorsChange: number;
}

export interface MenuPerformanceItem {
  menu_item_id: string;
  name: string;
  category: string;
  image_url?: string;
  total_views: number;
  unique_viewers: number;
  average_view_time: number;
  views_change_percentage: number;
}

export interface RecentActivity {
  id: string;
  type: 'menu_view' | 'qr_scan' | 'item_view' | 'visit_marked' | 'review_submitted';
  description: string;
  timestamp: string;
  metadata?: {
    item_name?: string;
    table_number?: string;
    rating?: number;
    visitor_location?: string;
  };
}
