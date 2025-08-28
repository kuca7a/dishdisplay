"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ChefHat, Users } from "lucide-react";
import { ExploreMenuItem } from "@/types/explore";
import Image from "next/image";

interface MenuItemDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ExploreMenuItem | null;
  onAddToMenu: (item: ExploreMenuItem) => void;
}

export default function MenuItemDetailModal({
  open,
  onOpenChange,
  item,
  onAddToMenu,
}: MenuItemDetailModalProps) {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {item.name}
          </DialogTitle>
          <DialogDescription>
            {item.category} • {item.cuisine} Cuisine
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image */}
          <div className="relative w-full h-64 rounded-lg overflow-hidden">
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              className="object-cover"
              onError={(e) => {
                e.currentTarget.src = '/pasta.jpg'; // Fallback image
              }}
            />
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="bg-white/90">
                {item.difficulty_level}
              </Badge>
            </div>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center space-y-1">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                {item.estimated_prep_time}
              </div>
              <span className="text-xs text-gray-500">Prep Time</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-1" />
                {item.estimated_calories} cal
              </div>
              <span className="text-xs text-gray-500">Per Serving</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <div className="flex items-center text-sm text-gray-600">
                <ChefHat className="h-4 w-4 mr-1" />
                {item.difficulty_level}
              </div>
              <span className="text-xs text-gray-500">Difficulty</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">
              {item.restaurant_description}
            </p>
          </div>

          {/* Instructions */}
          {item.instructions && item.instructions !== 'Recipe instructions will be available when you view the full details.' && (
            <div>
              <h3 className="font-semibold mb-2">Instructions</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {item.instructions}
              </p>
            </div>
          )}

          {/* Ingredients */}
          {item.ingredients && item.ingredients.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Ingredients</h3>
              <div className="grid grid-cols-2 gap-2">
                {item.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <span className="font-medium">{ingredient.name}</span>
                    {ingredient.measurement && (
                      <span className="text-gray-500">({ingredient.measurement})</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dietary Tags */}
          {item.dietary_tags && item.dietary_tags.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Dietary Information</h3>
              <div className="flex flex-wrap gap-2">
                {item.dietary_tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              className="flex-1 bg-[#5F7161] hover:bg-[#4C5B4F]"
              onClick={() => {
                onAddToMenu(item);
                onOpenChange(false);
              }}
            >
              Add to Menu
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
