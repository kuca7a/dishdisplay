"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Switch } from "@/components/ui/switch";
import { Save, ArrowLeft } from "lucide-react";
import { menuItemService } from "@/lib/database";
import { MenuItem, UpdateMenuItemData } from "@/types/database";
import { ImageUpload } from "@/components/ImageUpload";
import { ThreeDotsLoader } from "@/components/ui/three-dots-loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const rubik = Rubik({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

const categories = [
  { value: "appetizer", label: "Appetizer" },
  { value: "main", label: "Main Course" },
  { value: "dessert", label: "Dessert" },
  { value: "drink", label: "Drink" },
];

export default function EditMenuItemPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.restaurantId as string;
  const itemId = params.itemId as string;

  const [item, setItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image_url: "",
    is_available: true,
    time_to_make: "",
    detailed_description: "",
    calories: "",
    allergens: [] as string[],
    ingredients: "",
  });

  useEffect(() => {
    const loadItem = async () => {
      try {
        setLoading(true);
        const menuItem = await menuItemService.getById(itemId);
        
        if (!menuItem || menuItem.restaurant_id !== restaurantId) {
          setError("Menu item not found or you don't have permission to edit it");
          return;
        }

        setItem(menuItem);
        setFormData({
          name: menuItem.name,
          description: menuItem.description || "",
          price: menuItem.price.toString(),
          category: menuItem.category,
          image_url: menuItem.image_url || "",
          is_available: menuItem.is_available,
          time_to_make: menuItem.time_to_make || "",
          detailed_description: menuItem.detailed_description || "",
          calories: menuItem.calories?.toString() || "",
          allergens: menuItem.allergens || [],
          ingredients: menuItem.ingredients || "",
        });
      } catch (err) {
        console.error("Error loading menu item:", err);
        setError("Failed to load menu item");
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [itemId, restaurantId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.price || !formData.category) {
      alert("Please fill in all required fields");
      return;
    }

    // Validate new required fields
    if (!formData.detailed_description.trim()) {
      alert("Please provide a detailed description");
      return;
    }

    if (!formData.calories || parseInt(formData.calories) <= 0) {
      alert("Please enter a valid calorie count");
      return;
    }

    if (!formData.ingredients.trim()) {
      alert("Please list the ingredients");
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      alert("Please enter a valid price");
      return;
    }

    const calories = parseInt(formData.calories);
    if (isNaN(calories) || calories <= 0) {
      alert("Please enter a valid calorie count");
      return;
    }

    try {
      setSaving(true);

      const updateData: UpdateMenuItemData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        price: price,
        category: formData.category as
          | "appetizer"
          | "main"
          | "dessert"
          | "drink",
        image_url: formData.image_url.trim() || undefined,
        is_available: formData.is_available,
        time_to_make: formData.time_to_make.trim() || undefined,
        detailed_description: formData.detailed_description.trim(),
        calories: calories,
        allergens: formData.allergens,
        ingredients: formData.ingredients.trim(),
      };

      await menuItemService.update(itemId, updateData);
      
      // Navigate back to menu management
      router.push(`/profile/menu/manage`);
    } catch (err) {
      console.error("Error updating menu item:", err);
      alert("Failed to update menu item");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push(`/profile/menu/manage`);
  };

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex h-full w-full items-center justify-center">
            <div className="text-center">
              <ThreeDotsLoader size="md" />
              <p className="text-lg text-gray-600 mt-4">Loading menu item...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (error || !item) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex h-full w-full items-center justify-center p-4">
            <div className="text-center">
              <div className="text-6xl mb-4">🍽️</div>
              <h1 className="text-2xl font-bold mb-2 text-gray-800">
                Item Not Found
              </h1>
              <p className="text-gray-600 mb-4">
                {error || "Sorry, we couldn't find this menu item."}
              </p>
              <Button onClick={handleBack} className="bg-[#5F7161] hover:bg-[#4C5B4F]">
                Go Back to Menu
              </Button>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <div className={rubik.className}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/profile">Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/profile/menu/manage">Menu Management</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Edit Menu Item</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Edit Menu Item</h1>
                <p className="text-muted-foreground">
                  Update the details of your menu item
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleBack}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Menu
              </Button>
            </div>

            <div className="grid auto-rows-min gap-4 md:grid-cols-1">
              <Card>
                <CardHeader>
                  <CardTitle>Menu Item Details</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Update the details of your menu item. All fields marked with * are required.
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <Label htmlFor="item-name">Item Name *</Label>
                          <Input
                            id="item-name"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            placeholder="e.g. Margherita Pizza"
                            required
                          />
                        </div>

                        <div className="md:col-span-2">
                          <Label htmlFor="item-description">Short Description</Label>
                          <Textarea
                            id="item-description"
                            value={formData.description}
                            onChange={(e) =>
                              setFormData({ ...formData, description: e.target.value })
                            }
                            placeholder="Brief description for menu list..."
                            rows={2}
                          />
                        </div>

                        <div>
                          <Label htmlFor="item-price">Price (£) *</Label>
                          <Input
                            id="item-price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.price}
                            onChange={(e) =>
                              setFormData({ ...formData, price: e.target.value })
                            }
                            placeholder="12.99"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="item-category">Category *</Label>
                          <Select
                            value={formData.category}
                            onValueChange={(value) =>
                              setFormData({ ...formData, category: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                  {category.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="md:col-span-2">
                          <Label htmlFor="item-time-to-make">Time to Make</Label>
                          <Input
                            id="item-time-to-make"
                            value={formData.time_to_make}
                            onChange={(e) =>
                              setFormData({ ...formData, time_to_make: e.target.value })
                            }
                            placeholder="e.g. 20 minutes"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Image</h3>
                      <ImageUpload
                        onImageUploaded={(url) =>
                          setFormData({ ...formData, image_url: url })
                        }
                        restaurantId={restaurantId}
                        currentImageUrl={formData.image_url}
                      />
                    </div>

                    {/* Nutritional Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Nutritional Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <Label htmlFor="detailed-description">Detailed Description *</Label>
                          <Textarea
                            id="detailed-description"
                            value={formData.detailed_description}
                            onChange={(e) =>
                              setFormData({ ...formData, detailed_description: e.target.value })
                            }
                            placeholder="Provide a detailed description of the dish, its preparation, and what makes it special..."
                            rows={4}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="calories">Calories *</Label>
                          <Input
                            id="calories"
                            type="number"
                            min="1"
                            value={formData.calories}
                            onChange={(e) =>
                              setFormData({ ...formData, calories: e.target.value })
                            }
                            placeholder="e.g. 350"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="allergens">Allergens (comma-separated)</Label>
                          <Input
                            id="allergens"
                            value={formData.allergens.join(", ")}
                            onChange={(e) => {
                              const allergenList = e.target.value
                                .split(",")
                                .map(item => item.trim())
                                .filter(item => item.length > 0);
                              setFormData({ ...formData, allergens: allergenList });
                            }}
                            placeholder="e.g. Gluten, Dairy, Nuts, Eggs"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <Label htmlFor="ingredients">Ingredients *</Label>
                          <Textarea
                            id="ingredients"
                            value={formData.ingredients}
                            onChange={(e) =>
                              setFormData({ ...formData, ingredients: e.target.value })
                            }
                            placeholder="List all ingredients used in this dish..."
                            rows={4}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Availability */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Availability</h3>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="item-available"
                          checked={formData.is_available}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, is_available: checked })
                          }
                        />
                        <Label htmlFor="item-available">Available for order</Label>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-6 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={
                          saving ||
                          !formData.name.trim() ||
                          !formData.price ||
                          !formData.category ||
                          !formData.detailed_description.trim() ||
                          !formData.calories ||
                          !formData.ingredients.trim()
                        }
                        className="flex-1 bg-[#5F7161] hover:bg-[#4C5B4F]"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
