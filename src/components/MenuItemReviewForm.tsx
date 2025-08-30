"use client";

import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, LogIn } from "lucide-react";
import { CreateMenuItemReviewData, MenuItemReview } from "@/types/database";

interface DinerProfile {
  id: string;
  email: string;
  display_name: string;
}

interface MenuItemReviewFormProps {
  menuItemId: string;
  restaurantId: string;
  existingReview?: MenuItemReview;
  onReviewSubmitted: (review: MenuItemReview) => void;
  onCancel?: () => void;
}

export function MenuItemReviewForm({
  menuItemId,
  restaurantId,
  existingReview,
  onReviewSubmitted,
  onCancel,
}: MenuItemReviewFormProps) {
  const { user, isLoading, loginWithRedirect } = useAuth0();
  const pathname = usePathname();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [reviewText, setReviewText] = useState(existingReview?.review_text || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dinerProfile, setDinerProfile] = useState<DinerProfile | null>(null);

  // Get or create diner profile when user loads
  useEffect(() => {
    const ensureDinerProfile = async () => {
      if (user?.email) {
        try {
          const response = await fetch("/api/diner-profile", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: user.email,
              display_name: user.name || user.email.split('@')[0],
            }),
          });

          if (response.ok) {
            const profile = await response.json();
            setDinerProfile(profile);
          }
        } catch (error) {
          console.error("Error ensuring diner profile:", error);
        }
      }
    };

    ensureDinerProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.email || !dinerProfile) {
      setError("You must be logged in to submit a review");
      return;
    }

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const reviewData: CreateMenuItemReviewData = {
        menu_item_id: menuItemId,
        restaurant_id: restaurantId,
        diner_id: dinerProfile.id,
        rating,
        review_text: reviewText.trim() || undefined,
      };

      const url = existingReview 
        ? `/api/menu-item-reviews/${existingReview.id}`
        : "/api/menu-item-reviews";
      
      const method = existingReview ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(existingReview ? { rating, review_text: reviewText.trim() || undefined } : reviewData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit review");
      }

      const review = await response.json();
      onReviewSubmitted(review);
      
      // Reset form if it's a new review
      if (!existingReview) {
        setRating(0);
        setReviewText("");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      setError(error instanceof Error ? error.message : "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading...</span>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="py-6">
          <Alert>
            <AlertDescription className="flex items-center justify-between">
              <span>Please log in to leave a review.</span>
              <Button
                size="sm"
                onClick={() => loginWithRedirect({
                  appState: { returnTo: pathname }
                })}
                className="bg-[#5F7161] hover:bg-[#5F7161]/80 text-white"
              >
                <LogIn className="h-3 w-3 mr-1" />
                Sign In
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {existingReview ? "Edit Your Review" : "Leave a Review"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating *
            </label>
            <StarRating
              rating={rating}
              interactive
              onRatingChange={setRating}
              size="lg"
            />
          </div>

          <div>
            <label 
              htmlFor="review-text" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Your Review (Optional)
            </label>
            <Textarea
              id="review-text"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your thoughts about this dish..."
              rows={4}
              maxLength={500}
              className="resize-none"
            />
            <div className="text-xs text-gray-500 mt-1">
              {reviewText.length}/500 characters
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="flex-1"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {existingReview ? "Update Review" : "Submit Review"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
