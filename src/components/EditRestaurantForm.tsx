"use client";

import React, { useState } from "react";
import { Rubik } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit } from "lucide-react";
import { restaurantService } from "@/lib/database";
import { Restaurant } from "@/types/database";

const rubik = Rubik({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

interface EditRestaurantFormProps {
  restaurant: Restaurant;
  onSuccess: (updatedRestaurant: Restaurant) => void;
  trigger?: React.ReactNode;
}

export function EditRestaurantForm({
  restaurant,
  onSuccess,
  trigger,
}: EditRestaurantFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: restaurant.name,
    description: restaurant.description || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter a restaurant name");
      return;
    }

    try {
      setLoading(true);

      const updateData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      };

      const updatedRestaurant = await restaurantService.update(
        restaurant.id,
        updateData
      );

      setOpen(false);
      onSuccess(updatedRestaurant);
    } catch (error) {
      console.error("Error updating restaurant:", error);
      alert("Failed to update restaurant. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Reset form data when restaurant changes or dialog opens
  React.useEffect(() => {
    if (open) {
      setFormData({
        name: restaurant.name,
        description: restaurant.description || "",
      });
    }
  }, [open, restaurant]);

  const defaultTrigger = (
    <Button variant="outline" className="cursor-pointer">
      <Edit className="h-4 w-4 mr-2" />
      Edit Restaurant
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className={`max-w-md ${rubik.className}`}>
        <DialogHeader>
          <DialogTitle>Edit Restaurant Details</DialogTitle>
          <DialogDescription>
            Update your restaurant information. This will be displayed to your
            customers.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-restaurant-name">Restaurant Name *</Label>
            <Input
              id="edit-restaurant-name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g. Mario's Italian Kitchen"
              required
            />
          </div>

          <div>
            <Label htmlFor="edit-restaurant-description">Description</Label>
            <Textarea
              id="edit-restaurant-description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Tell customers about your restaurant..."
              rows={3}
            />
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
              disabled={loading || !formData.name.trim()}
              className="flex-1 cursor-pointer"
            >
              {loading ? "Updating..." : "Update Restaurant"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
