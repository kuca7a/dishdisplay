"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MenuItem, Restaurant } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Utensils, Clock, ArrowLeft, AlertTriangle } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cachedDataService } from "@/lib/cache";
import { ThreeDotsLoader } from "@/components/ui/three-dots-loader";
import { useAnalytics } from "@/hooks/use-analytics";
import { MenuItemReviewSection } from "@/components/MenuItemReviewSection";

export default function MenuItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.restaurantId as string;
  const itemId = params.itemId as string;

  const [item, setItem] = useState<MenuItem | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageStartTime] = useState(Date.now());

  // Analytics tracking
  const { trackItemView } = useAnalytics({ 
    restaurantId: restaurant?.id,
    enabled: !!restaurant 
  });

  useEffect(() => {
    const loadItemData = async () => {
      try {
        setLoading(true);

        // Get restaurant details
        const restaurantData = await cachedDataService.getRestaurantById(restaurantId);
        if (!restaurantData) {
          setError("Restaurant not found");
          return;
        }

        // Get all menu items and find the specific item
        const menuItems = await cachedDataService.getMenuItemsByRestaurantId(restaurantId);
        const foundItem = menuItems.find((item: MenuItem) => item.id === itemId);
        
        if (!foundItem) {
          setError("Menu item not found");
          return;
        }

        setRestaurant(restaurantData);
        setItem(foundItem);
        
        // Track detailed item view with initial timing
        setTimeout(() => {
          trackItemView(foundItem.id, foundItem.name, pageStartTime);
        }, 1000); // Small delay to ensure page is fully loaded
      } catch (err) {
        console.error("Error loading item:", err);
        setError("Failed to load menu item");
      } finally {
        setLoading(false);
      }
    };

    loadItemData();
  }, [restaurantId, itemId, trackItemView, pageStartTime]);

  // Track page duration in real-time for item views
  useEffect(() => {
    if (!restaurant || !item) return;

    // Send periodic duration updates every 10 seconds
    const interval = setInterval(() => {
      const currentDuration = Math.round((Date.now() - pageStartTime) / 1000);
      if (currentDuration >= 10) { // Only track meaningful durations
        trackItemView(item.id, item.name, pageStartTime);
        console.log(`📊 Item view duration update: ${currentDuration}s for ${item.name}`);
      }
    }, 10000); // Update every 10 seconds

    // Track final duration on page unload
    const handleBeforeUnload = () => {
      const finalDuration = Math.round((Date.now() - pageStartTime) / 1000);
      console.log('📤 Item page exit - final duration:', finalDuration);
      // Track one final time with the complete duration
      trackItemView(item.id, item.name, pageStartTime);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [restaurant, item, pageStartTime, trackItemView]);

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <ThreeDotsLoader size="lg" color="#5F7161" />
          <p className="text-lg text-gray-600 mt-4">Loading item details...</p>
        </div>
      </div>
    );
  }

  if (error || !item || !restaurant) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white shadow-lg rounded-lg">
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">🍽️</div>
            <h1 className="text-2xl font-bold mb-2 text-gray-800">
              Item Not Found
            </h1>
            <p className="text-gray-600 mb-4">
              {error || "Sorry, we couldn't find this menu item."}
            </p>
            <Button onClick={handleBack} className="bg-[#5F7161] hover:bg-[#4C5B4F]">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Mock nutritional data (in a real app, this would come from the database)
  const nutritionalInfo = {
    calories: item.calories || 0,
    // For now, we'll calculate rough estimates based on calories
    // In the future, you could add separate fields for these macronutrients
    carbs: Math.floor((item.calories || 0) * 0.45 / 4), // 45% of calories from carbs
    protein: Math.floor((item.calories || 0) * 0.25 / 4), // 25% of calories from protein  
    fat: Math.floor((item.calories || 0) * 0.30 / 9), // 30% of calories from fat
  };

  // Use real ingredients from database
  const ingredients = item.ingredients || "No ingredients listed.";

  // Use real allergens from database
  const allergens = item.allergens || [];

  return (
    <div className="min-h-screen bg-white">
      {/* Header with back button */}
      <div className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-20">
        <div className="flex items-center gap-3 px-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold text-center flex-1 pr-10">
            Product Details
          </h1>
        </div>
      </div>

      <div className="px-4 py-6 max-w-md mx-auto">
        {/* Item Image */}
        <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 relative">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Utensils className="h-16 w-16 text-gray-300" />
            </div>
          )}
        </div>

        {/* Item Name and Category */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {item.name}
          </h2>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {translateCategory(item.category)}
            </Badge>
            {allergens.length > 0 && (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                Contains Allergens
              </Badge>
            )}
          </div>
        </div>

        {/* Ingredients Section */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Ingredients</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {ingredients}
          </p>
        </div>

        {/* Nutritional Information */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Nutritional Values</h3>
          
          {/* Calories */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm font-medium">Calories</span>
            </div>
            <span className="text-lg font-bold">{nutritionalInfo.calories}</span>
            <span className="text-sm text-gray-500">kcal</span>
          </div>

          {/* Macronutrients */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {nutritionalInfo.carbs}
              </div>
              <div className="text-xs text-gray-500">grams</div>
              <div className="text-sm font-medium mt-1">Carbohydrates</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {nutritionalInfo.protein}
              </div>
              <div className="text-xs text-gray-500">grams</div>
              <div className="text-sm font-medium mt-1">Protein</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {nutritionalInfo.fat}
              </div>
              <div className="text-xs text-gray-500">grams</div>
              <div className="text-sm font-medium mt-1">Fat</div>
            </div>
          </div>
        </div>

        {/* Allergen Information */}
        {allergens.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 mb-4">
            <div className="flex items-center gap-1 text-xs">
              <AlertTriangle className="h-3 w-3 text-orange-600 shrink-0" />
              <span className="text-orange-800 font-medium">Contains:</span>
              <div className="flex flex-wrap gap-1">
                {allergens.map((allergen, index) => (
                  <span key={index} className="bg-red-100 text-red-800 px-1 py-0.5 rounded text-xs font-medium">
                    {allergen}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Product Story Section */}
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Product Story</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {item.detailed_description || item.description || generateProductStory(item.name, item.category)}
          </p>
        </div>

        {/* Price and Time */}
        {item.time_to_make && (
          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>
                {(() => {
                  const val = item.time_to_make.trim();
                  const lower = val.toLowerCase();
                  if (lower.endsWith("minute") || lower.endsWith("minutes") || lower.endsWith("min")) {
                    return val;
                  }
                  return val + " minutes";
                })()}
              </span>
            </div>
            <div className="text-lg font-bold text-[#5F7161]">
              £{Number(item.price).toFixed(2)}
            </div>
          </div>
        )}

        {/* Review Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <MenuItemReviewSection
            menuItemId={item.id}
            restaurantId={restaurant.id}
            menuItemName={item.name}
          />
        </div>
      </div>
    </div>
  );
}

// Helper functions
function translateCategory(category: string): string {
  const translations = {
    appetizer: "Appetizer",
    main: "Main Course", 
    dessert: "Dessert",
    drink: "Beverage",
  };
  return translations[category as keyof typeof translations] || category;
}

function generateProductStory(name: string, category: string): string {
  const stories = {
    appetizer: `${name} is carefully prepared using traditional recipes passed down through generations. Each ingredient is selected for its quality and freshness to ensure the perfect start to your meal.`,
    main: `Our ${name} represents the heart of our kitchen's expertise. Crafted with locally sourced ingredients and prepared with passion, this dish embodies our commitment to exceptional dining experiences.`,
    dessert: `${name} is our signature sweet creation, made fresh daily using the finest ingredients. This delightful treat is the perfect way to conclude your meal on a memorable note.`,
    drink: `${name} is carefully crafted to complement your dining experience. Made with premium ingredients and served at the perfect temperature for your enjoyment.`,
  };
  return stories[category as keyof typeof stories] || `${name} is prepared with care using quality ingredients to ensure a delightful dining experience.`;
}
