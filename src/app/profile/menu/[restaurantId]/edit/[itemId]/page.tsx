"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Rubik } from "next/font/google";
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
import { ArrowLeft, Save } from "lucide-react";
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
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ThreeDotsLoader size="lg" color="#5F7161" />
          <p className="text-lg text-gray-600 mt-4">Loading menu item...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
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

  return (
    <div className={`min-h-screen bg-gray-50 ${rubik.className}`}>
      {/* Header */}
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
            Edit Menu Item
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Update Menu Item Details</CardTitle>
            <p className="text-sm text-gray-600">
              Update the details of your menu item. All fields marked with * are required.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>
                
                <div>
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

                <div>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <div>
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
                
                <div>
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
  );
}
