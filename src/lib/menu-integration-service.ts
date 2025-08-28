import { ExploreMenuItem } from "@/types/explore";
import { MenuItem } from "@/types/database";

interface AddToMenuRequest {
  restaurantId: string;
  exploreItem: ExploreMenuItem;
}

export async function addExploreItemToMenu(request: AddToMenuRequest): Promise<MenuItem> {
  const response = await fetch('/api/menu/add-from-explore', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to add item to menu' }));
    throw new Error(error.message || 'Failed to add item to menu');
  }

  return response.json();
}

// Map explore categories to menu categories
function mapExploreToMenuCategory(exploreCategory: string): "appetizer" | "main" | "dessert" | "drink" {
  const category = exploreCategory.toLowerCase();
  
  if (category.includes('dessert') || category.includes('sweet')) {
    return 'dessert';
  }
  if (category.includes('drink') || category.includes('beverage')) {
    return 'drink';
  }
  if (category.includes('starter') || category.includes('appetizer')) {
    return 'appetizer';
  }
  // Default to main for most dishes
  return 'main';
}

// Transform ExploreMenuItem to MenuItem format
export function transformExploreToMenuItem(
  exploreItem: ExploreMenuItem,
  restaurantId: string,
  customPrice?: number
): Omit<MenuItem, 'id' | 'created_at' | 'updated_at'> {
  return {
    restaurant_id: restaurantId,
    name: exploreItem.name,
    description: exploreItem.restaurant_description,
    price: customPrice || 12.99, // Default price, can be customized
    category: mapExploreToMenuCategory(exploreItem.category),
    image_url: exploreItem.image_url,
    is_available: true,
    time_to_make: exploreItem.estimated_prep_time,
    detailed_description: exploreItem.instructions || exploreItem.restaurant_description,
    calories: exploreItem.estimated_calories,
    allergens: exploreItem.dietary_tags || [],
    ingredients: exploreItem.ingredients?.map(ing => ing.name).join(', ') || '',
  };
}
