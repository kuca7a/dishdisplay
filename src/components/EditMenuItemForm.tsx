"use client";

import React, { useState } from "react";
import { Rubik } from "next/font/google";
const rubik = Rubik({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});
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
import { Edit } from "lucide-react";
import { menuItemService } from "@/lib/database";
import { MenuItem, UpdateMenuItemData } from "@/types/database";
import { ImageUpload } from "@/components/ImageUpload";

interface EditMenuItemFormProps {
  item: MenuItem;
  onSuccess: (updatedItem: MenuItem) => void;
  trigger?: React.ReactNode;
}

const categories = [
  { value: "appetizer", label: "Appetizer" },
  { value: "main", label: "Main Course" },
  { value: "dessert", label: "Dessert" },
  { value: "drink", label: "Drink" },
];

export function EditMenuItemForm({
  item,
  onSuccess,
  trigger,
}: EditMenuItemFormProps) {
  const defaultTrigger = (
    <Button variant="outline" size="sm" className="cursor-pointer">
      <Edit className="h-4 w-4" />
    </Button>
  );
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: item.name,
    description: item.description || "",
    price: item.price.toString(),
    category: item.category,
    image_url: item.image_url || "",
    is_available: item.is_available,
    time_to_make: item.time_to_make || "",
    // New required nutritional fields with fallback values
    detailed_description: item.detailed_description || "",
    calories: item.calories?.toString() || "",
    allergens: item.allergens || [],
    ingredients: item.ingredients || "",
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
        // New required nutritional fields
        detailed_description: formData.detailed_description.trim(),
        calories: calories,
        allergens: formData.allergens,
        ingredients: formData.ingredients.trim(),
      };

      const updatedItem = await menuItemService.update(item.id, updateData);
      onSuccess(updatedItem);
      setOpen(false);
    } catch {
      alert("Failed to update menu item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className={`max-w-md ${rubik.className}`}>
        <DialogHeader>
          <DialogTitle>Edit Menu Item</DialogTitle>
          <DialogDescription>
            Update the details of your menu item. All fields marked with * are
            required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-item-name">Item Name *</Label>
            <Input
              id="edit-item-name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g. Margherita Pizza"
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-item-time-to-make">Time to Make</Label>
            <Input
              id="edit-item-time-to-make"
              value={formData.time_to_make}
              onChange={(e) =>
                setFormData({ ...formData, time_to_make: e.target.value })
              }
              placeholder="e.g. 20 minutes"
            />
          </div>
          <div>
            <Label htmlFor="edit-item-description">Description</Label>
            <Textarea
              id="edit-item-description"
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
              <Label htmlFor="edit-item-price">Price (£) *</Label>
              <Input
                id="edit-item-price"
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
              <Label htmlFor="edit-item-category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    category: value as
                      | "appetizer"
                      | "main"
                      | "dessert"
                      | "drink",
                  })
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
            restaurantId={item.restaurant_id}
            currentImageUrl={formData.image_url}
          />

          {/* New Required Nutritional Information Fields */}
          <div>
            <Label htmlFor="edit-detailed-description">Detailed Description *</Label>
            <Textarea
              id="edit-detailed-description"
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
            <Label htmlFor="edit-calories">Calories *</Label>
            <Input
              id="edit-calories"
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
            <Label htmlFor="edit-ingredients">Ingredients *</Label>
            <Textarea
              id="edit-ingredients"
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
            <Label htmlFor="edit-allergens">Allergens (comma-separated)</Label>
            <Input
              id="edit-allergens"
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
              id="edit-item-available"
              checked={formData.is_available}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_available: checked })
              }
            />
            <Label htmlFor="edit-item-available">Available for order</Label>
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
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
