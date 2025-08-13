import { getSupabaseClient } from "@/lib/supabase";
import {
  Restaurant,
  MenuItem,
  CreateRestaurantData,
  UpdateRestaurantData,
  CreateMenuItemData,
  UpdateMenuItemData,
} from "@/types/database";

// Restaurant operations
export const restaurantService = {
  // Get restaurant by owner email
  async getByOwnerEmail(email: string): Promise<Restaurant | null> {
    console.log("Database: Getting restaurant via API for email:", email);

    try {
      const response = await fetch(
        `/api/restaurants?owner_email=${encodeURIComponent(email)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get restaurant");
      }

      const data = await response.json();
      console.log("Database: Got restaurant via API:", data);
      return data;
    } catch (error) {
      console.error("Database: API get error:", error);
      throw error;
    }
  },

  // Get restaurant by ID
  async getById(id: string): Promise<Restaurant | null> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error("Database: Supabase client not available");
      return null;
    }

    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // No rows returned
      throw error;
    }
    return data;
  },

  // Create restaurant
  async create(restaurantData: CreateRestaurantData): Promise<Restaurant> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error("Database not available");
    }

    const { data, error } = await supabase
      .from("restaurants")
      .insert([restaurantData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update restaurant
  async update(id: string, updates: UpdateRestaurantData): Promise<Restaurant> {
    console.log("Database: Updating restaurant via API with ID:", id);
    console.log("Database: Update data:", updates);

    try {
      const response = await fetch(`/api/restaurants/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update restaurant");
      }

      const data = await response.json();
      console.log("Database: Update successful via API:", data);
      return data;
    } catch (error) {
      console.error("Database: API update error:", error);
      throw error;
    }
  },

  // Delete restaurant
  async delete(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error("Database not available");
    }

    const { error } = await supabase.from("restaurants").delete().eq("id", id);

    if (error) throw error;
  },
};

// Menu item operations
export const menuItemService = {
  // Get all menu items for a restaurant
  async getByRestaurantId(restaurantId: string): Promise<MenuItem[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error("Database: Supabase client not available");
      return [];
    }

    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get menu items by category
  async getByCategory(
    restaurantId: string,
    category: string
  ): Promise<MenuItem[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error("Database: Supabase client not available");
      return [];
    }

    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .eq("category", category)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Create menu item
  async create(menuItemData: CreateMenuItemData): Promise<MenuItem> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error("Database not available");
    }

    const { data, error } = await supabase
      .from("menu_items")
      .insert([menuItemData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update menu item
  async update(id: string, updates: UpdateMenuItemData): Promise<MenuItem> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error("Database not available");
    }

    const { data, error } = await supabase
      .from("menu_items")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete menu item
  async delete(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error("Database not available");
    }

    const { error } = await supabase.from("menu_items").delete().eq("id", id);

    if (error) throw error;
  },

  // Toggle availability
  async toggleAvailability(id: string): Promise<MenuItem> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error("Database not available");
    }

    // First get current status
    const { data: currentItem, error: fetchError } = await supabase
      .from("menu_items")
      .select("is_available")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    // Toggle the availability
    const { data, error } = await supabase
      .from("menu_items")
      .update({ is_available: !currentItem.is_available })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Combined operations
export const menuService = {
  // Get or create restaurant for user
  async getOrCreateRestaurant(
    userEmail: string,
    restaurantName?: string
  ): Promise<Restaurant> {
    let restaurant = await restaurantService.getByOwnerEmail(userEmail);

    if (!restaurant && restaurantName) {
      restaurant = await restaurantService.create({
        name: restaurantName,
        owner_email: userEmail,
        description: `Welcome to ${restaurantName}!`,
      });
    }

    if (!restaurant) {
      throw new Error("Restaurant not found and no name provided for creation");
    }

    return restaurant;
  },

  // Get restaurant with menu items
  async getRestaurantWithMenu(
    userEmail: string
  ): Promise<{ restaurant: Restaurant; menuItems: MenuItem[] }> {
    const restaurant = await restaurantService.getByOwnerEmail(userEmail);
    if (!restaurant) {
      throw new Error("Restaurant not found");
    }

    const menuItems = await menuItemService.getByRestaurantId(restaurant.id);

    return { restaurant, menuItems };
  },
};
