export interface Restaurant {
  id: string
  name: string
  owner_email: string
  description?: string
  phone?: string
  business_email?: string
  website?: string
  business_type?: string
  // Location fields
  address?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  latitude?: number
  longitude?: number
  // Hours fields
  monday_hours?: string
  tuesday_hours?: string
  wednesday_hours?: string
  thursday_hours?: string
  friday_hours?: string
  saturday_hours?: string
  sunday_hours?: string
  timezone?: string
  // Media & Branding fields
  logo_url?: string
  cover_image_url?: string
  primary_color?: string
  secondary_color?: string
  accent_color?: string
  font_family?: string
  theme_style?: string
  social_facebook?: string
  social_instagram?: string
  social_twitter?: string
  social_linkedin?: string
  social_tiktok?: string
  created_at: string
  updated_at: string
}

export interface MenuItem {
  id: string
  restaurant_id: string
  name: string
  description?: string
  price: number
  category: 'appetizer' | 'main' | 'dessert' | 'drink'
  image_url?: string
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface CreateRestaurantData {
  name: string
  owner_email: string
  description?: string
  phone?: string
  business_email?: string
  website?: string
  business_type?: string
  // Location fields
  address?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  latitude?: number
  longitude?: number
  // Hours fields
  monday_hours?: string
  tuesday_hours?: string
  wednesday_hours?: string
  thursday_hours?: string
  friday_hours?: string
  saturday_hours?: string
  sunday_hours?: string
  timezone?: string
  // Media & Branding fields
  logo_url?: string
  cover_image_url?: string
  primary_color?: string
  secondary_color?: string
  accent_color?: string
  font_family?: string
  theme_style?: string
  social_facebook?: string
  social_instagram?: string
  social_twitter?: string
  social_linkedin?: string
  social_tiktok?: string
}

export interface UpdateRestaurantData {
  name?: string
  description?: string
  phone?: string
  business_email?: string
  website?: string
  business_type?: string
  // Location fields
  address?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  latitude?: number
  longitude?: number
  // Hours fields
  monday_hours?: string
  tuesday_hours?: string
  wednesday_hours?: string
  thursday_hours?: string
  friday_hours?: string
  saturday_hours?: string
  sunday_hours?: string
  timezone?: string
  // Media & Branding fields
  logo_url?: string
  cover_image_url?: string
  primary_color?: string
  secondary_color?: string
  accent_color?: string
  font_family?: string
  theme_style?: string
  social_facebook?: string
  social_instagram?: string
  social_twitter?: string
  social_linkedin?: string
  social_tiktok?: string
}

export interface CreateMenuItemData {
  restaurant_id: string
  name: string
  description?: string
  price: number
  category: 'appetizer' | 'main' | 'dessert' | 'drink'
  image_url?: string
  is_available?: boolean
}

export interface UpdateMenuItemData {
  name?: string
  description?: string
  price?: number
  category?: 'appetizer' | 'main' | 'dessert' | 'drink'
  image_url?: string
  is_available?: boolean
}
