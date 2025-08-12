"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Fjalla_One } from "next/font/google";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Star, ChefHat, Utensils } from "lucide-react";
import { restaurantService, menuItemService } from "@/lib/database";
import { Restaurant, MenuItem } from "@/types/database";

const fjallaOne = Fjalla_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function CustomerMenuPage() {
  const params = useParams();
  const restaurantId = params.restaurantId as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    const loadMenuData = async () => {
      try {
        setLoading(true);

        // Get restaurant details
        const restaurantData = await restaurantService.getById(restaurantId);

        if (!restaurantData) {
          setError("Restaurant not found");
          return;
        }

        // Get menu items (only available ones for customers)
        const allMenuItems = await menuItemService.getByRestaurantId(
          restaurantId
        );
        const availableItems = allMenuItems.filter((item) => item.is_available);

        setRestaurant(restaurantData);
        setMenuItems(availableItems);
      } catch (err) {
        console.error("Error loading menu:", err);
        setError("Restaurant not found or menu unavailable");
      } finally {
        setLoading(false);
      }
    };

    loadMenuData();
  }, [restaurantId]);

  const categories = [
    { value: "all", label: "All Items", icon: ChefHat },
    { value: "appetizer", label: "Appetizers", icon: "🥗" },
    { value: "main", label: "Main Courses", icon: "🍽️" },
    { value: "dessert", label: "Desserts", icon: "🍰" },
    { value: "drink", label: "Drinks", icon: "🥤" },
  ];

  const filteredItems =
    selectedCategory === "all"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "appetizer":
        return "bg-green-50 text-green-700 border-green-200";
      case "main":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "dessert":
        return "bg-pink-50 text-pink-700 border-pink-200";
      case "drink":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div
        className={`${fjallaOne.className} min-h-screen bg-gradient-to-br from-orange-50 to-red-50`}
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading menu...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div
        className={`${fjallaOne.className} min-h-screen bg-gradient-to-br from-orange-50 to-red-50`}
      >
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <div className="text-6xl mb-4">🍽️</div>
              <h1 className="text-2xl font-bold mb-2">Menu Not Available</h1>
              <p className="text-gray-600 mb-4">
                {error || "Sorry, we couldn't find this restaurant's menu."}
              </p>
              <p className="text-sm text-gray-500">
                Please check with the restaurant staff or try again later.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${fjallaOne.className} min-h-screen bg-gradient-to-br from-orange-50 to-red-50`}
    >
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
              {restaurant.name}
            </h1>
            {restaurant.description && (
              <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
                {restaurant.description}
              </p>
            )}
            <div className="flex items-center justify-center gap-4 mt-3 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>Digital Menu</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Updated Daily</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter - Mobile Optimized */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => {
              const count =
                category.value === "all"
                  ? menuItems.length
                  : menuItems.filter((item) => item.category === category.value)
                      .length;

              if (count === 0 && category.value !== "all") return null;

              return (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors border ${
                    selectedCategory === category.value
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {typeof category.icon === "string" ? (
                    <span className="text-lg">{category.icon}</span>
                  ) : (
                    <category.icon className="h-4 w-4" />
                  )}
                  <span>{category.label}</span>
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {count}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {filteredItems.length === 0 ? (
          <Card className="text-center p-8">
            <CardContent className="space-y-4">
              <div className="text-6xl">🍽️</div>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  No items available
                </h3>
                <p className="text-gray-600">
                  {selectedCategory === "all"
                    ? "This restaurant hasn't added any menu items yet."
                    : `No ${selectedCategory} items are currently available.`}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:gap-6">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden hover:shadow-md transition-shadow"
              >
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    {/* Item Image */}
                    <div className="w-full sm:w-32 h-32 sm:h-24 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center relative overflow-hidden">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full">
                          <Utensils className="h-6 w-6 sm:h-5 sm:w-5 text-orange-400" />
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {item.name}
                            </h3>
                            <Badge
                              variant="outline"
                              className={`text-xs px-2 py-0.5 ${getCategoryColor(
                                item.category
                              )}`}
                            >
                              {item.category}
                            </Badge>
                          </div>

                          {item.description && (
                            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                              {item.description}
                            </p>
                          )}

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Fresh daily
                            </span>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <div className="text-xl font-bold text-orange-600">
                            £{Number(item.price).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <div className="text-sm text-gray-500 space-y-2">
            <p>Powered by DishDisplay - Digital Menu Solution</p>
            <div className="flex items-center justify-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Menu updated in real-time
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                Contactless dining
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
