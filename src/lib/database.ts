import { supabase } from '@/lib/supabase'
import { Restaurant, MenuItem, CreateRestaurantData, UpdateRestaurantData, CreateMenuItemData, UpdateMenuItemData } from '@/types/database'

// Restaurant operations
export const restaurantService = {
  // Get restaurant by owner email
  async getByOwnerEmail(email: string): Promise<Restaurant | null> {
    console.log('Database: Searching for restaurant with owner_email:', email);
    
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('owner_email', email)
      .single()

    console.log('Database: Query result:', { data, error });

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('Database: No restaurant found for email:', email);
        return null; // No rows returned
      }
      console.error('Database: Error querying restaurant:', error);
      throw error
    }
    
    console.log('Database: Found restaurant:', data);
    return data
  },

  // Get restaurant by ID
  async getById(id: string): Promise<Restaurant | null> {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // No rows returned
      throw error
    }
    return data
  },

  // Create restaurant
  async create(restaurantData: CreateRestaurantData): Promise<Restaurant> {
    const { data, error } = await supabase
      .from('restaurants')
      .insert([restaurantData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update restaurant
  async update(id: string, updates: UpdateRestaurantData): Promise<Restaurant> {
    const { data, error } = await supabase
      .from('restaurants')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete restaurant
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('restaurants')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Menu item operations
export const menuItemService = {
  // Get all menu items for a restaurant
  async getByRestaurantId(restaurantId: string): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get menu items by category
  async getByCategory(restaurantId: string, category: string): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('category', category)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Create menu item
  async create(menuItemData: CreateMenuItemData): Promise<MenuItem> {
    const { data, error } = await supabase
      .from('menu_items')
      .insert([menuItemData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update menu item
  async update(id: string, updates: UpdateMenuItemData): Promise<MenuItem> {
    const { data, error } = await supabase
      .from('menu_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete menu item
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Toggle availability
  async toggleAvailability(id: string): Promise<MenuItem> {
    // First get current status
    const { data: currentItem, error: fetchError } = await supabase
      .from('menu_items')
      .select('is_available')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    // Toggle the availability
    const { data, error } = await supabase
      .from('menu_items')
      .update({ is_available: !currentItem.is_available })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Combined operations
export const menuService = {
  // Get or create restaurant for user
  async getOrCreateRestaurant(userEmail: string, restaurantName?: string): Promise<Restaurant> {
    let restaurant = await restaurantService.getByOwnerEmail(userEmail)
    
    if (!restaurant && restaurantName) {
      restaurant = await restaurantService.create({
        name: restaurantName,
        owner_email: userEmail,
        description: `Welcome to ${restaurantName}!`
      })
    }
    
    if (!restaurant) {
      throw new Error('Restaurant not found and no name provided for creation')
    }
    
    return restaurant
  },

  // Get restaurant with menu items
  async getRestaurantWithMenu(userEmail: string): Promise<{ restaurant: Restaurant; menuItems: MenuItem[] }> {
    const restaurant = await restaurantService.getByOwnerEmail(userEmail)
    if (!restaurant) {
      throw new Error('Restaurant not found')
    }

    const menuItems = await menuItemService.getByRestaurantId(restaurant.id)
    
    return { restaurant, menuItems }
  }
}
