"use client";

import React, { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";
import { menuItemService } from "@/lib/database";
import { CreateMenuItemData, MenuItem } from "@/types/database";
import { ImageUpload } from "@/components/ImageUpload";

const rubik = Rubik({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

interface AddMenuItemFormProps {
  restaurantId: string;
  onSuccess: (newItem: MenuItem) => void;
  trigger?: React.ReactNode;
}

const categories = [
  { value: "appetizer", label: "Appetizer" },
  { value: "main", label: "Main Course" },
  { value: "dessert", label: "Dessert" },
  { value: "drink", label: "Drink" },
];

export function AddMenuItemForm({
  restaurantId,
  onSuccess,
  trigger,
}: AddMenuItemFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image_url: "",
    is_available: true,
    time_to_make: "",
    // New required nutritional fields
    detailed_description: "",
    calories: "",
    allergens: [] as string[],
    ingredients: "",
  });

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
      setLoading(true);

      const menuItemData: CreateMenuItemData = {
        restaurant_id: restaurantId,
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
        // New required nutritional fields
        detailed_description: formData.detailed_description.trim(),
        calories: calories,
        allergens: formData.allergens,
        ingredients: formData.ingredients.trim(),
      };

      const newItem = await menuItemService.create(menuItemData);

      // Reset form
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        image_url: "",
        is_available: true,
        time_to_make: "",
        // Reset new nutritional fields
        detailed_description: "",
        calories: "",
        allergens: [],
        ingredients: "",
      });

      setOpen(false);
      onSuccess(newItem);
    } catch (error) {
      console.error("Error creating menu item:", error);
      alert("Failed to create menu item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button className="cursor-pointer">
      <Plus className="h-4 w-4 mr-2" />
      Add New Item
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className={`max-w-md ${rubik.className}`}>
        <DialogHeader>
          <DialogTitle>Add New Menu Item</DialogTitle>
          <DialogDescription>
            Create a new dish for your menu. All fields marked with * are
            required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <Label htmlFor="item-description">Description</Label>
            <Textarea
              id="item-description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe your dish..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                <SelectTrigger className={`cursor-pointer ${rubik.className}`}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className={rubik.className}>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Image Upload */}
          <ImageUpload
            onImageUploaded={(url) =>
              setFormData({ ...formData, image_url: url })
            }
            restaurantId={restaurantId}
            currentImageUrl={formData.image_url}
          />

          {/* New Required Nutritional Information Fields */}
          <div>
            <Label htmlFor="detailed-description">Detailed Description *</Label>
            <Textarea
              id="detailed-description"
              value={formData.detailed_description}
              onChange={(e) =>
                setFormData({ ...formData, detailed_description: e.target.value })
              }
              placeholder="Provide a detailed description of the dish, its preparation, and what makes it special..."
              rows={3}
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
              rows={3}
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

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                !formData.name.trim() ||
                !formData.price ||
                !formData.category ||
                !formData.detailed_description.trim() ||
                !formData.calories ||
                !formData.ingredients.trim()
              }
              className="flex-1 cursor-pointer"
            >
              {loading ? "Adding..." : "Add Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
