"use client";

import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Plus, Filter, Grid, List, Clock, ChefHat } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ThreeDotsLoader } from "@/components/ui/three-dots-loader";
import { Badge } from "@/components/ui/badge";
import { ExploreMenuItem, ExploreSearchResponse } from "@/types/explore";
import Image from "next/image";
import MenuItemDetailModal from "@/components/MenuItemDetailModal";
import { addExploreItemToMenu } from "@/lib/menu-integration-service";
import { toast } from "sonner";

import { Rubik } from "next/font/google";

const rubik = Rubik({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

export default function MenuExploreContent() {
  const { isAuthenticated, isLoading, user } = useAuth0();
  const router = useRouter();

  // State
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState(""); // Separate state for input
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [exploreData, setExploreData] = useState<ExploreSearchResponse | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string; description: string; image_url: string }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<ExploreMenuItem | null>(null);
  const [addingToMenu, setAddingToMenu] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 1500); // Wait 1.5 seconds after user stops typing

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Auth check
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  // Fetch restaurant ID on component mount
  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!user?.email) {
        return;
      }
      
      try {
        const response = await fetch(`/api/restaurants?owner_email=${encodeURIComponent(user.email)}`);
        const data = await response.json();
        
        // Check if data is an array or a single object
        if (Array.isArray(data) && data.length > 0) {
          setRestaurantId(data[0].id);
        } else if (data && data.id) {
          setRestaurantId(data.id);
        }
      } catch (error) {
        console.error('Failed to fetch restaurant:', error);
      }
    };

    fetchRestaurant();
  }, [user?.email]);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/explore/categories');
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch explore data when search parameters change
  useEffect(() => {
    const fetchExploreData = async () => {
      setLoading(true);
      setCurrentPage(1); // Reset to first page when search changes
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append('query', searchQuery);
        if (selectedCategory !== 'All') params.append('category', selectedCategory);
        params.append('limit', '12');
        params.append('page', '1');

        const response = await fetch(`/api/explore?${params}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        setExploreData(data);
      } catch (error) {
        console.error('Failed to fetch explore data:', error);
        // Set empty data to show empty state
        setExploreData({
          items: [],
          total: 0,
          page: 1,
          limit: 12,
          hasMore: false
        });
      } finally {
        setLoading(false);
      }
    };

    fetchExploreData();
  }, [searchQuery, selectedCategory]);

  // Load more function
  const handleLoadMore = async () => {
    if (!exploreData || !exploreData.hasMore || loadingMore) return;
    
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      params.append('limit', '12');
      params.append('page', nextPage.toString());

      const response = await fetch(`/api/explore?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Append new items to existing ones
      setExploreData(prev => prev ? {
        ...data,
        items: [...prev.items, ...data.items]
      } : data);
      
      setCurrentPage(nextPage);
    } catch (error) {
      console.error('Failed to load more data:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchInput(query);
  };

  const handleSearchSubmit = () => {
    setSearchQuery(searchInput);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleViewDetails = (item: ExploreMenuItem) => {
    setSelectedMenuItem(item);
    setModalOpen(true);
  };

  const handleAddToMenu = async (item: ExploreMenuItem) => {
    if (!restaurantId) {
      toast.error("Restaurant not found. Please try again.");
      return;
    }

    setAddingToMenu(true);
    
    try {
      await addExploreItemToMenu({
        restaurantId,
        exploreItem: item,
      });
      
      toast.success(`${item.name} has been added to your menu!`);
    } catch (error) {
      console.error('Failed to add item to menu:', error);
      toast.error(error instanceof Error ? error.message : "Failed to add item to menu");
    } finally {
      setAddingToMenu(false);
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${rubik.className}`}
      >
        <div className="text-center">
          <ThreeDotsLoader size="md" />
          <p className="mt-4">Loading Menu...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className={rubik.className}>
        <div className={rubik.className}>
          <header className="flex h-16 shrink-0 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/profile">Menu</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Explore</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="max-w-6xl mx-auto w-full space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Search className="h-8 w-8 text-[#5F7161]" />
                  <div>
                    <h1 className="text-3xl font-bold">Explore Menu Ideas</h1>
                    <p className="text-gray-600">
                      Discover popular dishes and menu inspiration
                    </p>
                  </div>
                </div>
                <Button className="bg-[#5F7161] hover:bg-[#4C5B4F] cursor-pointer">
                  <Plus className="h-4 w-4 mr-2" />
                  Add to My Menu
                </Button>
              </div>

              {/* Search and Filters */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search for dishes, ingredients, or cuisines..."
                            className="pl-10"
                            value={searchInput}
                            onChange={(e) => handleSearch(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleSearchSubmit();
                              }
                            }}
                          />
                        </div>
                        <Button
                          onClick={handleSearchSubmit}
                          className="bg-[#5F7161] hover:bg-[#4C5B4F] cursor-pointer"
                        >
                          Search
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                      </Button>
                      <Button
                        variant={viewMode === "grid" ? "default" : "outline"}
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => setViewMode("grid")}
                      >
                        <Grid className="h-4 w-4 mr-2" />
                        Grid
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "outline"}
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => setViewMode("list")}
                      >
                        <List className="h-4 w-4 mr-2" />
                        List
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.name}
                    variant={category.name === selectedCategory ? "default" : "outline"}
                    size="sm"
                    className={`cursor-pointer ${
                      category.name === selectedCategory
                        ? "bg-[#5F7161] hover:bg-[#4C5B4F]"
                        : ""
                    }`}
                    onClick={() => handleCategoryChange(category.name)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center py-8">
                  <ThreeDotsLoader size="md" />
                </div>
              )}

              {/* Menu Items Grid */}
              {!loading && exploreData && (
                <div className={`gap-4 ${viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}`}>
                  {exploreData.items.map((item) => (
                    <Card
                      key={item.id}
                      className="hover:shadow-md transition-shadow flex flex-col h-full"
                    >
                      <div className="relative">
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          width={400}
                          height={192}
                          className="w-full h-48 object-cover rounded-t-lg"
                          onError={(e) => {
                            e.currentTarget.src = '/pasta.jpg'; // Fallback image
                          }}
                        />
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="bg-white/90">
                            {item.difficulty_level}
                          </Badge>
                        </div>
                      </div>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{item.name}</CardTitle>
                          <div className="text-right text-sm">
                            <div className="text-gray-500">
                              {item.estimated_calories} cal/serving
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {item.restaurant_description}
                        </p>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col">
                        <div className="space-y-3 flex-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Category:</span>
                            <span className="font-medium">{item.category}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Cuisine:</span>
                            <span className="font-medium">{item.cuisine}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Prep Time:</span>
                            <span className="font-medium flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {item.estimated_prep_time}
                            </span>
                          </div>
                          
                          {/* Dietary Tags */}
                          {item.dietary_tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {item.dietary_tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Buttons fixed at bottom */}
                        <div className="flex gap-2 pt-4 mt-auto">
                          <Button
                            size="sm"
                            className="flex-1 bg-[#5F7161] hover:bg-[#4C5B4F] cursor-pointer"
                            onClick={() => handleAddToMenu(item)}
                            disabled={addingToMenu}
                          >
                            {addingToMenu ? "Adding..." : "Add to Menu"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => handleViewDetails(item)}
                          >
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loading && exploreData && exploreData.items.length === 0 && (
                <div className="text-center py-8">
                  <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No menu items found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your search or filters to find more options.
                  </p>
                </div>
              )}

              {/* Load More */}
              {!loading && exploreData && exploreData.hasMore && (
                <div className="text-center pt-6">
                  <Button
                    variant="outline"
                    className="w-full md:w-auto cursor-pointer"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <>
                        <ThreeDotsLoader size="sm" />
                        Loading More...
                      </>
                    ) : (
                      'Load More Menu Ideas'
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
      
      {/* Modal for menu item details */}
      <MenuItemDetailModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        item={selectedMenuItem}
        onAddToMenu={handleAddToMenu}
      />
    </SidebarProvider>
  );
}
