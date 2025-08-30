"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { Loader2, MessageCircle, MoreVertical, Edit, Trash2 } from "lucide-react";
import { MenuItemReviewWithDiner, MenuItemReview } from "@/types/database";
import { useAuth0 } from "@auth0/auth0-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MenuItemReviewsDisplayProps {
  menuItemId: string;
  onEditReview?: (review: MenuItemReview) => void;
  onReviewDeleted?: (reviewId: string) => void;
}

export function MenuItemReviewsDisplay({
  menuItemId,
  onEditReview,
  onReviewDeleted,
}: MenuItemReviewsDisplayProps) {
  const { user } = useAuth0();
  const [reviews, setReviews] = useState<MenuItemReviewWithDiner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/menu-item-reviews?menu_item_id=${menuItemId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch reviews");
        }

        const reviewsData = await response.json();
        setReviews(reviewsData);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setError("Failed to load reviews");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [menuItemId]);

  const handleDeleteReview = async (reviewId: string) => {
    try {
      setDeletingReviewId(reviewId);

      const response = await fetch(`/api/menu-item-reviews/${reviewId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete review");
      }

      // Remove review from local state
      setReviews(prev => prev.filter(review => review.id !== reviewId));
      
      if (onReviewDeleted) {
        onReviewDeleted(reviewId);
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      setError("Failed to delete review");
    } finally {
      setDeletingReviewId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading reviews...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No reviews yet. Be the first to review this item!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <CardHeader className="px-0 pb-4">
        <CardTitle className="text-lg">
          Reviews ({reviews.length})
        </CardTitle>
      </CardHeader>
      
      {reviews.map((review) => {
        const isOwnReview = user?.email === review.diner_email;
        
        return (
          <Card key={review.id} className="relative">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {review.diner_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">
                        {review.diner_name}
                      </span>
                    </div>
                    <span className="text-gray-500 text-sm">
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <StarRating rating={review.rating} size="sm" />
                  </div>
                  
                  {review.review_text && (
                    <p className="text-gray-700 leading-relaxed">
                      {review.review_text}
                    </p>
                  )}
                </div>

                {isOwnReview && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => onEditReview && onEditReview(review)}
                        className="cursor-pointer"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteReview(review.id)}
                        className="cursor-pointer text-red-600"
                        disabled={deletingReviewId === review.id}
                      >
                        {deletingReviewId === review.id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
