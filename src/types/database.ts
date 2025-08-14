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
}

export interface UpdateMenuItemData {
  name?: string;
  description?: string;
  price?: number;
  category?: "appetizer" | "main" | "dessert" | "drink";
  image_url?: string;
  is_available?: boolean;
  time_to_make?: string;
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
