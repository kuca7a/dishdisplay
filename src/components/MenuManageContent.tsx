"use client";

import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Rubik } from "next/font/google";
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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Eye, EyeOff, Utensils, Filter } from "lucide-react";
import { menuItemService, restaurantService } from "@/lib/database";
import { Restaurant } from "@/types/database";
import { AddMenuItemForm } from "@/components/AddMenuItemForm";
import { EditMenuItemForm } from "@/components/EditMenuItemForm";
import { ThreeDotsLoader } from "@/components/ui/three-dots-loader";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import { EditRestaurantForm } from "@/components/EditRestaurantForm";
import { DeleteRestaurantModal } from "@/components/DeleteRestaurantModal";
import { useRestaurantData } from "@/hooks/use-cached-data";

const rubik = Rubik({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

// Quick restaurant creation form component
function QuickRestaurantForm({
  userEmail,
  onSuccess,
}: {
  userEmail: string;
  onSuccess: (restaurant: Restaurant) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      const restaurant = await restaurantService.create({
        name: name.trim(),
        owner_email: userEmail,
        description: description.trim() || undefined,
      });
      onSuccess(restaurant);
    } catch (error) {
      console.error("Error creating restaurant:", error);
      alert("Failed to create restaurant. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="restaurant-name">Restaurant Name *</Label>
        <Input
          id="restaurant-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Mario's Italian Kitchen"
          required
        />
      </div>
      <div>
        <Label htmlFor="restaurant-description">Description (Optional)</Label>
        <Textarea
          id="restaurant-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell customers about your restaurant..."
          rows={3}
        />
      </div>
      <Button
        type="submit"
        disabled={loading || !name.trim()}
        className="cursor-pointer"
      >
        {loading ? "Creating..." : "Create Restaurant"}
      </Button>
    </form>
  );
}

export default function MenuManageContent() {
  const { isAuthenticated, isLoading, user } = useAuth0();
  const router = useRouter();

  // Use cached data hook
  const { restaurant, menuItems, loading, refetch, invalidateCache } =
    useRestaurantData();

  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  const handleToggleAvailability = async (itemId: string) => {
    try {
      setDeleteLoading(itemId);
      await menuItemService.toggleAvailability(itemId);

      // Invalidate cache and refetch data
      invalidateCache();
      await refetch(true); // Force fresh data
    } catch (err) {
      console.error("Error toggling availability:", err);
      alert("Failed to update item availability");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      setDeleteLoading(itemId);
      await menuItemService.delete(itemId);

      // Invalidate cache and refetch data
      invalidateCache();
      await refetch(true); // Force fresh data
    } catch (err) {
      console.error("Error deleting item:", err);
      alert("Failed to delete item");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleAddMenuItem = async () => {
    // Invalidate cache and refetch data to include new item
    invalidateCache();
    await refetch(true); // Force fresh data
  };

  const handleUpdateMenuItem = async () => {
    // Invalidate cache and refetch data to include updates
    invalidateCache();
    await refetch(true); // Force fresh data
  };

  const handleUpdateRestaurant = async () => {
    // Invalidate cache and refetch data
    invalidateCache();
    await refetch(true); // Force fresh data
  };

  const handleDeleteRestaurant = async () => {
    if (!restaurant) return;

    try {
      setError(null);
      // Delete all menu items first (cascade should handle this, but let's be explicit)
      await Promise.all(
        menuItems.map((item) => menuItemService.delete(item.id))
      );

      // Then delete the restaurant
      await restaurantService.delete(restaurant.id);

      // Invalidate cache and refetch data
      invalidateCache();
      await refetch(true); // Force fresh data
    } catch (err) {
      console.error("Error deleting restaurant:", err);
      alert("Failed to delete restaurant. Please try again.");
    }
  };

  const handleQuickCreateSuccess = async () => {
    // Invalidate cache and refetch data to include new restaurant
    invalidateCache();
    await refetch(true); // Force fresh data
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "appetizer":
        return "bg-green-100 text-green-800";
      case "main":
        return "bg-blue-100 text-blue-800";
      case "dessert":
        return "bg-pink-100 text-pink-800";
      case "drink":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get unique categories from menu items
  const getCategories = () => {
    const categories = [...new Set(menuItems.map((item) => item.category))];
    return categories.sort();
  };

  // Filter and sort menu items
  const getFilteredAndSortedItems = () => {
    let filtered =
      selectedCategory === "all"
        ? menuItems
        : menuItems.filter((item) => item.category === selectedCategory);

    // Sort items
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price":
          return a.price - b.price;
        case "category":
          return a.category.localeCompare(b.category);
        case "availability":
          return (b.is_available ? 1 : 0) - (a.is_available ? 1 : 0);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredAndSortedItems = getFilteredAndSortedItems();

  if (isLoading || !isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className={rubik.className}>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <ThreeDotsLoader size="md" />
              <p className="mt-4">Loading your menu...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (error) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className={rubik.className}>
          <div className="flex items-center justify-center h-screen">
            <Card className="w-96">
              <CardHeader>
                <CardTitle className="text-red-600">Error</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{error}</p>
                <Button
                  onClick={() => refetch(true)}
                  className="mt-4 cursor-pointer"
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

  if (!restaurant) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className={rubik.className}>
          <header className="flex flex-col gap-2 h-auto shrink-0 items-start px-4 pt-4">
            <span className="text-xl font-semibold">
              Create Your Restaurant
            </span>
            <div className="flex h-16 items-center gap-2 w-full">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/profile">Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Setup Restaurant</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Welcome to Dish Display!</CardTitle>
                <CardDescription>
                  Let's create your restaurant profile so you can start managing
                  your menu.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QuickRestaurantForm
                  userEmail={user!.email!}
                  onSuccess={handleQuickCreateSuccess}
                />
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className={rubik.className}>
        <div>
          <header className="flex flex-col gap-2 h-auto shrink-0 items-start px-4 pt-4">
            <span className="text-xl font-semibold">Menu Management</span>
            <div className="flex h-16 items-center gap-2 w-full">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/profile">Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Menu</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Manage</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {/* Restaurant Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle>{restaurant.name}</CardTitle>
                    <CardDescription>
                      {restaurant.description || "No description added yet"}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <EditRestaurantForm
                      restaurant={restaurant}
                      onSuccess={handleUpdateRestaurant}
                    />
                    <DeleteRestaurantModal
                      restaurantName={restaurant.name}
                      menuItemCount={menuItems.length}
                      onConfirm={handleDeleteRestaurant}
                      loading={loading}
                    />
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Add New Item Button */}
            <div className="flex justify-between items-center py-2">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-gray-900">Menu Items</h2>
                <p className="text-gray-600">
                  {menuItems.length} {menuItems.length === 1 ? "item" : "items"}{" "}
                  in your menu
                </p>
              </div>
              <AddMenuItemForm
                restaurantId={restaurant.id}
                onSuccess={handleAddMenuItem}
              />
            </div>

            {/* Filter and Sort Controls */}
            {menuItems.length > 0 && (
              <div className="flex gap-4 items-center p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Filter & Sort:
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="category-filter"
                    className="text-sm text-gray-600"
                  >
                    Category:
                  </Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger
                      className={`w-32 cursor-pointer ${rubik.className}`}
                    >
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent className={rubik.className}>
                      <SelectItem value="all">All</SelectItem>
                      {getCategories().map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="sort-select"
                    className="text-sm text-gray-600"
                  >
                    Sort by:
                  </Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger
                      className={`w-36 cursor-pointer ${rubik.className}`}
                    >
                      <SelectValue placeholder="Name" />
                    </SelectTrigger>
                    <SelectContent className={rubik.className}>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="availability">Availability</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-xs text-gray-500">
                  Showing {filteredAndSortedItems.length} of {menuItems.length}{" "}
                  items
                </div>
              </div>
            )}

            {/* Menu Items Grid */}
            {menuItems.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="flex flex-col items-center space-y-4">
                    <Utensils className="h-12 w-12 text-gray-400" />
                    <h3 className="text-xl font-semibold">No menu items yet</h3>
                    <p className="text-gray-600 max-w-md">
                      Start building your menu by adding your first dish. Your
                      customers will love seeing photos of your delicious food!
                    </p>
                    <AddMenuItemForm
                      restaurantId={restaurant.id}
                      onSuccess={handleAddMenuItem}
                      trigger={
                        <Button className="cursor-pointer">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Item
                        </Button>
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            ) : filteredAndSortedItems.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="flex flex-col items-center space-y-4">
                    <Filter className="h-12 w-12 text-gray-400" />
                    <h3 className="text-xl font-semibold">
                      No items match your filter
                    </h3>
                    <p className="text-gray-600 max-w-md">
                      Try adjusting your category filter or sort options to see
                      more items.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedCategory("all");
                        setSortBy("name");
                      }}
                      className="cursor-pointer"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedItems.map((item) => (
                  <Card
                    key={item.id}
                    className="group hover:shadow-lg transition-shadow duration-200 overflow-hidden bg-white border border-gray-200"
                  >
                    <div className="flex min-h-32">
                      {/* Left side - Image (1/3 of space) */}
                      <div className="w-1/3 bg-gray-50 relative overflow-hidden">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Utensils className="h-8 w-8 text-gray-300" />
                          </div>
                        )}
                        {/* Availability indicator */}
                        <div className="absolute top-2 right-2">
                          <Badge
                            variant={
                              item.is_available ? "default" : "secondary"
                            }
                            className="text-xs"
                          >
                            {item.is_available ? "Available" : "Unavailable"}
                          </Badge>
                        </div>
                      </div>

                      {/* Right side - Content (2/3 of space) */}
                      <div className="w-2/3 p-4 flex flex-col justify-between">
                        <div className="space-y-2">
                          {/* Display name and ID */}
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                              {item.name}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Item ID: {item.id.slice(0, 8).toUpperCase()}
                            </p>
                          </div>

                          {/* Category and Price */}
                          <div className="flex items-center gap-3">
                            <Badge
                              className={`${getCategoryColor(
                                item.category
                              )} text-xs`}
                            >
                              {item.category}
                            </Badge>
                            <div className="text-xl font-bold text-gray-900">
                              £{item.price.toFixed(2)}
                            </div>
                          </div>

                          {/* Description */}
                          {item.description && (
                            <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">
                              {item.description}
                            </p>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleAvailability(item.id)}
                            className="cursor-pointer"
                          >
                            {item.is_available ? (
                              <EyeOff className="h-3 w-3 mr-1" />
                            ) : (
                              <Eye className="h-3 w-3 mr-1" />
                            )}
                            {item.is_available ? "Hide" : "Show"}
                          </Button>
                          <EditMenuItemForm
                            item={item}
                            onSuccess={handleUpdateMenuItem}
                          />
                          <DeleteConfirmationModal
                            itemName={item.name}
                            onConfirm={() => handleDeleteItem(item.id)}
                            loading={deleteLoading === item.id}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
