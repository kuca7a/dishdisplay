"use client";

import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/navigation";
import { Rubik } from "next/font/google";
import { DinerSidebar } from "@/components/diner-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  MapPin,
  Search,
  Phone,
  Globe,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThreeDotsLoader } from "@/components/ui/three-dots-loader";
import GoogleMap from "@/components/GoogleMap";
import Link from "next/link";

const rubik = Rubik({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
  phone: string | null;
  website: string | null;
  business_type: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  primary_color: string | null;
  full_address: string;
  menu_url: string;
  is_open: boolean;
  maps_url: string;
  monday_hours: string | null;
  tuesday_hours: string | null;
  wednesday_hours: string | null;
  thursday_hours: string | null;
  friday_hours: string | null;
  saturday_hours: string | null;
  sunday_hours: string | null;
  timezone: string | null;
  menu_preview: {
    name: string;
    price: number;
    category: string;
  }[];
}

interface RestaurantsResponse {
  restaurants: Restaurant[];
  total: number;
  timestamp: string;
}

export default function DiscoverPage() {
  const { isAuthenticated, isLoading } = useAuth0();
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(
    []
  );

  // Auth check
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  // Load restaurants on component mount
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/restaurants/public");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: RestaurantsResponse = await response.json();
        setRestaurants(data.restaurants);
        setFilteredRestaurants(data.restaurants);

        // Select the first restaurant by default if available
        if (data.restaurants.length > 0) {
          setSelectedRestaurant(data.restaurants[0]);
        }
      } catch (err) {
        console.error("Error fetching restaurants:", err);
        setError("Failed to load restaurants. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchRestaurants();
    }
  }, [isAuthenticated]);

  // Filter restaurants based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRestaurants(restaurants);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = restaurants.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(query) ||
          restaurant.city?.toLowerCase().includes(query) ||
          restaurant.business_type?.toLowerCase().includes(query) ||
          restaurant.description?.toLowerCase().includes(query)
      );
      setFilteredRestaurants(filtered);
    }
  }, [searchQuery, restaurants]);

  const handleRestaurantSelect = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  if (isLoading) {
    return (
      <div
        className={`min-h-screen bg-gray-50 flex items-center justify-center ${rubik.className}`}
      >
        <div className="text-center">
          <ThreeDotsLoader size="md" className="mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        className={`min-h-screen bg-gray-50 flex items-center justify-center ${rubik.className}`}
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <p>You need to be authenticated to discover restaurants.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <SidebarProvider>
        <DinerSidebar />
        <SidebarInset className={rubik.className}>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <ThreeDotsLoader size="md" className="mb-4" />
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (error) {
    return (
      <SidebarProvider>
        <DinerSidebar />
        <SidebarInset className={rubik.className}>
          <div className="flex items-center justify-center min-h-screen">
            <Card className="w-full max-w-md">
              <CardContent className="p-6 text-center">
                <div className="text-6xl mb-4">🗺️</div>
                <h1 className="text-2xl font-bold mb-2 text-gray-800">
                  Unable to Load Restaurants
                </h1>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-[#5F7161] hover:bg-[#4C5B4F]"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <DinerSidebar />
      <SidebarInset className={rubik.className}>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="w-px h-4 bg-border mr-2" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/diner">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Discover Restaurants</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="h-8 w-8 text-[#5F7161]" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Discover Restaurants
                  </h1>
                  <p className="text-gray-600">
                    Explore restaurants using DishDisplay near you
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {restaurants.length} restaurants found
              </div>
            </div>

            {/* Search Bar */}
            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search restaurants, cities, or cuisine types..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mobile: Map First, Desktop: Restaurant List First */}
              <div className="order-2 lg:order-1 space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Restaurants ({filteredRestaurants.length})
                </h2>

                <div className="space-y-0.5 max-h-[400px] lg:max-h-[600px] overflow-y-auto">
                  {filteredRestaurants.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <p className="text-gray-600">
                          No restaurants found matching your search.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredRestaurants.map((restaurant) => (
                      <RestaurantCard
                        key={restaurant.id}
                        restaurant={restaurant}
                        isSelected={selectedRestaurant?.id === restaurant.id}
                        onSelect={handleRestaurantSelect}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Mobile: Map Second, Desktop: Map Second */}
              <div className="order-1 lg:order-2">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Restaurant Locations
                </h2>

                <Card className="h-[60vh] lg:h-[600px] overflow-hidden p-0">
                  {filteredRestaurants.length > 0 ? (
                    <GoogleMap 
                      restaurants={filteredRestaurants}
                      selectedRestaurant={selectedRestaurant || undefined}
                      onRestaurantSelect={handleRestaurantSelect}
                      height="100%"
                      zoom={10}
                    />
                  ) : (
                    <CardContent className="h-full flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <MapPin className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <p>No restaurants found to display on map</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Try adjusting your search criteria
                        </p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// Restaurant Card Component
interface RestaurantCardProps {
  restaurant: Restaurant;
  isSelected: boolean;
  onSelect: (restaurant: Restaurant) => void;
}

function RestaurantCard({
  restaurant,
  isSelected,
  onSelect,
}: RestaurantCardProps) {
  return (
    <div
      className={`cursor-pointer transition-all duration-200 hover:bg-gray-50 border-l-4 p-2 rounded-r-md ${
        isSelected 
          ? "border-l-[#5F7161] bg-green-50 shadow-sm" 
          : "border-l-transparent hover:border-l-gray-300"
      }`}
      onClick={() => onSelect(restaurant)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-sm text-gray-900 truncate">
              {restaurant.name}
            </h3>
            {restaurant.is_open && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></div>
                Open
              </span>
            )}
            {restaurant.business_type && (
              <span className="inline-flex px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                {restaurant.business_type}
              </span>
            )}
          </div>
          
          <div className="flex items-center text-xs text-gray-500 mb-1">
            <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">{restaurant.full_address}</span>
          </div>
          
          <div className="flex items-center gap-3 text-xs">
            <Link
              href={restaurant.menu_url}
              className="text-[#5F7161] hover:text-[#4C5B4F] font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              View Menu
            </Link>
            
            <a
              href={restaurant.maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
              onClick={(e) => e.stopPropagation()}
            >
              Directions
            </a>
            
            <div className="flex items-center gap-1">
              {restaurant.phone && (
                <a
                  href={`tel:${restaurant.phone}`}
                  className="text-gray-400 hover:text-gray-600"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Phone className="h-3 w-3" />
                </a>
              )}
              {restaurant.website && (
                <a
                  href={restaurant.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Globe className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
