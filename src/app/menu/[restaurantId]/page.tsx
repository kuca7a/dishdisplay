"use client";

import React, { useEffect, useState, useCallback } from "react";
import Carousel from "@/components/Carousel";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Playfair_Display, Notable } from "next/font/google";
import { Badge } from "@/components/ui/badge";
import { Utensils, Search } from "lucide-react";
import { cachedDataService } from "@/lib/cache";
import { Restaurant, MenuItem } from "@/types/database";
import { ThreeDotsLoader } from "@/components/ui/three-dots-loader";
import DinerMenuInteractions from "@/components/DinerMenuInteractions";
import { useAnalytics } from "@/hooks/use-analytics";

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
});

const notable = Notable({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function CustomerMenuPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.restaurantId as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [pageStartTime] = useState<number>(Date.now());
  
  // Analytics tracking
  const { trackMenuView, trackQrScan, trackItemView } = useAnalytics({ 
    restaurantId: restaurant?.id,
    enabled: !!restaurant 
  });

  const handleItemClick = (item: MenuItem) => {
    // Track item click before navigation
    if (restaurant) {
      trackItemView(item.id, item.name);
    }
    router.push(`/menu/${restaurantId}/item/${item.id}`);
  };

  // Enhanced QR scan detection
  const checkForQRScan = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const referrer = document.referrer;
    
    // Check for QR scan indicators
    return urlParams.has('qr') || 
      urlParams.has('scan') || 
      urlParams.has('table') ||
      !referrer || 
      referrer.includes('qr');
  }, []);

  useEffect(() => {
    const loadMenuData = async () => {
      try {
        setLoading(true);

        // Get restaurant details using cached service
        const restaurantData = await cachedDataService.getRestaurantById(restaurantId);

        if (!restaurantData) {
          setError("Restaurant not found");
          return;
        }

        // Get menu items (only available ones for customers) using cached service
        const allMenuItems = await cachedDataService.getMenuItemsByRestaurantId(restaurantId);
        const availableItems = allMenuItems.filter((item: MenuItem) => item.is_available);

        setRestaurant(restaurantData);
        setMenuItems(availableItems);
        
        // Track analytics - check if this was a QR scan first
        setTimeout(() => {
          const rawDuration = Math.round((Date.now() - pageStartTime) / 1000);
          // Cap duration at 30 minutes (1800 seconds) to prevent overnight sessions
          const duration = Math.min(rawDuration, 1800);
          
          if (checkForQRScan()) {
            trackQrScan();
          } else {
            trackMenuView(duration);
          }
        }, 1000); // Small delay to ensure page is fully loaded
      } catch (err) {
        console.error("Error loading menu:", err);
        setError("Restaurant not found or menu unavailable");
      } finally {
        setLoading(false);
      }
    };

    loadMenuData();
  }, [restaurantId, trackMenuView, trackQrScan, checkForQRScan, pageStartTime]);

  // Track page exit duration with timeout protection
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (restaurant) {
        const rawDuration = Math.round((Date.now() - pageStartTime) / 1000);
        // Cap duration at 30 minutes (1800 seconds) to prevent overnight sessions
        const duration = Math.min(rawDuration, 1800);
        
        // Send a final event with the total page duration
        navigator.sendBeacon('/api/analytics/duration', JSON.stringify({
          restaurantId: restaurant.id,
          duration,
          pageStartTime
        }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [restaurant, pageStartTime]);

  // Removed featured items slideshow logic

  const categories = [
    { value: "all", label: "All Items" },
    { value: "appetizer", label: "Appetizers" },
    { value: "main", label: "Main Courses" },
    { value: "dessert", label: "Desserts" },
    { value: "drink", label: "Drinks" },
  ];

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Removed previous slideshow handlers

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ThreeDotsLoader size="lg" color="#5F7161" />
          <p className="text-lg text-gray-600 mt-4">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white shadow-lg rounded-lg">
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">🍽️</div>
            <h1 className="text-2xl font-bold mb-2 text-gray-800">
              Menu Not Available
            </h1>
            <p className="text-gray-600 mb-4">
              {error || "Sorry, we couldn't find this restaurant's menu."}
            </p>
            <p className="text-sm text-gray-500">
              Please check with the restaurant staff or try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Restaurant Name */}
      <div className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-20">
        <div className="px-4 py-4">
          <h1
            className={`${playfair.className} text-xl font-bold text-gray-900`}
          >
            {restaurant.name}
          </h1>
          {restaurant.description && (
            <p className="text-gray-600 text-sm mt-1">
              {restaurant.description}
            </p>
          )}
        </div>
      </div>

      {/* Menu Slideshow Feature (moved from landing page) */}
      <div className="flex justify-center py-6 px-4">
        <div className="w-full max-w-[500px]">
          <div className="rounded-xl overflow-hidden shadow-lg">
            <div className="aspect-[2/0.5]">
              <Carousel />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white px-4 py-4 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5F7161] focus:border-transparent outline-none text-sm bg-gray-50"
          />
        </div>
      </div>

      {/* Category Selection */}
      <div className="bg-white px-4 py-4 border-b border-gray-100">
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
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                  selectedCategory === category.value
                    ? "bg-[#5F7161] text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span>{category.label}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    selectedCategory === category.value
                      ? "bg-white/20 text-white"
                      : "bg-white/80 text-gray-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 py-6">
        {filteredItems.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No items found
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? `No items match "${searchTerm}"`
                  : selectedCategory === "all"
                  ? "This restaurant hasn't added any menu items yet."
                  : `No ${selectedCategory} items are currently available.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white">
            {filteredItems.map((item, index) => (
              <div key={item.id}>
                <div 
                  className="flex px-4 py-4 hover:bg-gray-50 transition-colors duration-200 cursor-pointer" 
                  onClick={() => handleItemClick(item)}
                > 
                  {/* Item Image */}
                  <div className="w-32 h-32 bg-gray-100 flex items-center justify-center relative overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-[#5F7161]/10 flex items-center justify-center">
                        <Utensils className="h-6 w-6 text-[#5F7161]" />
                      </div>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 ml-4 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {item.name}
                        </h3>

                        {item.description && (
                          <p className="text-gray-600 text-sm leading-relaxed mb-2 line-clamp-2">
                            {item.description}
                          </p>
                        )}

                        <Badge
                          variant="outline"
                          className="text-xs px-2 py-1 bg-[#5F7161]/10 text-[#5F7161] border-[#5F7161]/20"
                        >
                          {item.category}
                        </Badge>
                        {item.time_to_make && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/></svg>
                            <span>
                              {(() => {
                                const val = item.time_to_make.trim();
                                const lower = val.toLowerCase();
                                if (lower.endsWith("minute") || lower.endsWith("minutes") || lower.endsWith("min")) {
                                  return val;
                                }
                                // If only a number, add 'minutes'
                                return val + " minutes";
                              })()}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-shrink-0">
                        <div className="text-lg font-bold text-[#5F7161]">
                          £{Number(item.price).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Divider line - hide for last item */}
                {index < filteredItems.length - 1 && (
                  <div className="border-b border-gray-200 mx-4"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer - matches landing page, black on white, Playfair font */}
      {/* Divider above footer */}
      <div className="w-full border-t border-gray-200 mt-8"></div>
      {/* Footer - no links, black text on white background */}
      <footer className="bg-white text-black py-16">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center justify-center">
            <h3 className={`${notable.className} text-3xl mb-2`}>Dish Display</h3>
            <p className="text-gray-700 font-medium text-lg">Bringing menus to life</p>
          </div>
        </div>
      </footer>

      {/* Diner Interactions - floating overlay for logged in users */}
      {restaurant && <DinerMenuInteractions restaurant={restaurant} />}
    </div>
  );
}
