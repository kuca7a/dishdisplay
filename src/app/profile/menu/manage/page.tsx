"use client";

import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Fjalla_One } from "next/font/google";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Eye, EyeOff, Utensils } from "lucide-react";
import { menuItemService, restaurantService } from "@/lib/database";
import { Restaurant, MenuItem } from "@/types/database";
import { AddMenuItemForm } from "@/components/AddMenuItemForm";
import { EditMenuItemForm } from "@/components/EditMenuItemForm";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import { EditRestaurantForm } from "@/components/EditRestaurantForm";
import { DeleteRestaurantModal } from "@/components/DeleteRestaurantModal";

const fjallaOne = Fjalla_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

// Quick restaurant creation form component
function QuickRestaurantForm({ 
  userEmail, 
  onSuccess 
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
          placeholder="e.g., Mario's Italian Kitchen"
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
      <Button type="submit" disabled={loading || !name.trim()}>
        {loading ? "Creating..." : "Create Restaurant"}
      </Button>
    </form>
  );
}

export default function MenuManagePage() {
  const { isAuthenticated, isLoading, user } = useAuth0();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      const loadRestaurantData = async () => {
        try {
          setLoading(true);
          setError(null);
          
          console.log("Loading restaurant data for user:", user?.email);
          console.log("Full user object:", user);
          
          // First try to get existing restaurant
          const restaurant = await restaurantService.getByOwnerEmail(user!.email!);
          
          if (restaurant) {
            console.log("Found existing restaurant:", restaurant);
            setRestaurant(restaurant);
            
            // Load menu items for this restaurant
            const items = await menuItemService.getByRestaurantId(restaurant.id);
            console.log("Loaded menu items:", items);
            setMenuItems(items);
          } else {
            console.log("No restaurant found for user");
            setRestaurant(null);
            setMenuItems([]);
          }
        } catch (err) {
          console.error("Error loading restaurant data:", err);
          setError("Failed to load restaurant data. Please try again.");
        } finally {
          setLoading(false);
        }
      };

      loadRestaurantData();
    }
  }, [isAuthenticated, user]);

  const loadRestaurantData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Loading restaurant data for user:", user?.email);
      console.log("Full user object:", user);
      
      // First try to get existing restaurant
      const restaurant = await restaurantService.getByOwnerEmail(user!.email!);
      
      console.log("Found restaurant:", restaurant);
      
      if (!restaurant) {
        // No restaurant found - this is normal for new users
        console.log("No restaurant found for email:", user!.email);
        setRestaurant(null);
        setMenuItems([]);
        return;
      }
      
      // Restaurant exists, get menu items
      const menuItems = await menuItemService.getByRestaurantId(restaurant.id);
      console.log("Found menu items:", menuItems);
      setRestaurant(restaurant);
      setMenuItems(menuItems);
      
    } catch (err) {
      console.error("Error loading restaurant data:", err);
      setError(`Failed to load restaurant data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (itemId: string) => {
    try {
      await menuItemService.toggleAvailability(itemId);
      // Reload menu items
      if (restaurant) {
        const updatedItems = await menuItemService.getByRestaurantId(restaurant.id);
        setMenuItems(updatedItems);
      }
    } catch (err) {
      console.error("Error toggling availability:", err);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      setDeleteLoading(itemId);
      await menuItemService.delete(itemId);
      // Remove item from state immediately for better UX
      setMenuItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      console.error("Error deleting item:", err);
      alert("Failed to delete item. Please try again.");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleAddMenuItem = (newItem: MenuItem) => {
    setMenuItems(prev => [newItem, ...prev]);
  };

  const handleUpdateMenuItem = (updatedItem: MenuItem) => {
    setMenuItems(prev => 
      prev.map(item => item.id === updatedItem.id ? updatedItem : item)
    );
  };

  const handleUpdateRestaurant = (updatedRestaurant: Restaurant) => {
    setRestaurant(updatedRestaurant);
  };

  const handleDeleteRestaurant = async () => {
    if (!restaurant) return;
    
    try {
      setLoading(true);
      // Delete all menu items first (cascade should handle this, but let's be explicit)
      await Promise.all(menuItems.map(item => menuItemService.delete(item.id)));
      
      // Then delete the restaurant
      await restaurantService.delete(restaurant.id);
      
      // Reset state
      setRestaurant(null);
      setMenuItems([]);
      
    } catch (err) {
      console.error("Error deleting restaurant:", err);
      alert("Failed to delete restaurant. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'appetizer': return 'bg-green-100 text-green-800';
      case 'main': return 'bg-blue-100 text-blue-800';
      case 'dessert': return 'bg-pink-100 text-pink-800';
      case 'drink': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading || !isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className={fjallaOne.className}>
            <div className="flex items-center justify-center h-screen">
              <div className="text-xl">Loading your menu...</div>
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
        <SidebarInset>
          <div className={fjallaOne.className}>
            <div className="flex items-center justify-center h-screen">
              <Card className="w-96">
                <CardHeader>
                  <CardTitle className="text-red-600">Error</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{error}</p>
                  <Button onClick={loadRestaurantData} className="mt-4">
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!restaurant) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className={fjallaOne.className}>
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
                    Let's create your restaurant profile so you can start managing your menu.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <QuickRestaurantForm 
                    userEmail={user!.email!} 
                    onSuccess={(restaurant: Restaurant) => {
                      setRestaurant(restaurant);
                      setMenuItems([]);
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className={fjallaOne.className}>
          <header className="flex flex-col gap-2 h-auto shrink-0 items-start px-4 pt-4">
            <span className="text-xl font-semibold">
              Menu Management
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
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Menu Items ({menuItems.length})</h2>
              <AddMenuItemForm 
                restaurantId={restaurant.id} 
                onSuccess={handleAddMenuItem}
              />
            </div>

            {/* Menu Items Grid */}
            {menuItems.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="flex flex-col items-center space-y-4">
                    <Utensils className="h-12 w-12 text-gray-400" />
                    <h3 className="text-xl font-semibold">No menu items yet</h3>
                    <p className="text-gray-600 max-w-md">
                      Start building your menu by adding your first dish. Your customers will love seeing photos of your delicious food!
                    </p>
                    <AddMenuItemForm 
                      restaurantId={restaurant.id} 
                      onSuccess={handleAddMenuItem}
                      trigger={
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Item
                        </Button>
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {menuItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    {item.image_url && (
                      <div className="aspect-video bg-gray-100 relative">
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{item.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getCategoryColor(item.category)}>
                              {item.category}
                            </Badge>
                            <Badge variant={item.is_available ? "default" : "secondary"}>
                              {item.is_available ? "Available" : "Unavailable"}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-lg font-semibold text-green-600">
                          £{item.price.toFixed(2)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {item.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleAvailability(item.id)}
                        >
                          {item.is_available ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
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
                    </CardContent>
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
