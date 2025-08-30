"use client";

import React, { useState } from "react";
import { MenuItemReviewForm } from "@/components/MenuItemReviewForm";
import { MenuItemReviewsDisplay } from "@/components/MenuItemReviewsDisplay";
import { MenuItemReview } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";

interface MenuItemReviewSectionProps {
  menuItemId: string;
  restaurantId: string;
  menuItemName: string;
}

export function MenuItemReviewSection({
  menuItemId,
  restaurantId,
  menuItemName,
}: MenuItemReviewSectionProps) {
  const [editingReview, setEditingReview] = useState<MenuItemReview | null>(null);
  const [reviewStats] = useState({
    total_reviews: 0,
    average_rating: 0,
  });

  const handleReviewSubmitted = () => {
    // Reset form state
    setEditingReview(null);
    
    // Force refresh of the reviews display
    window.location.reload();
  };

  const handleEditReview = (review: MenuItemReview) => {
    setEditingReview(review);
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
  };

  const handleReviewDeleted = () => {
    // Force refresh of the reviews display
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Review Stats Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            Reviews for {menuItemName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <StarRating rating={reviewStats.average_rating} size="lg" />
            <span className="text-lg font-medium text-gray-700">
              {reviewStats.total_reviews} review{reviewStats.total_reviews !== 1 ? 's' : ''}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Review Form */}
      <MenuItemReviewForm
        menuItemId={menuItemId}
        restaurantId={restaurantId}
        existingReview={editingReview || undefined}
        onReviewSubmitted={handleReviewSubmitted}
        onCancel={editingReview ? handleCancelEdit : undefined}
      />

      {/* Reviews Display */}
      <MenuItemReviewsDisplay
        menuItemId={menuItemId}
        onEditReview={handleEditReview}
        onReviewDeleted={handleReviewDeleted}
      />
    </div>
  );
}
