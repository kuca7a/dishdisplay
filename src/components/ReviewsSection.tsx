"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Star, MessageSquare, TrendingUp } from "lucide-react";
import { ThreeDotsLoader } from "@/components/ui/three-dots-loader";

interface MenuItemReviewWithDetails {
  id: string;
  rating: number;
  review_text?: string;
  created_at: string;
  diner_email: string;
  diner_name: string;
  diner_avatar?: string;
  menu_item_id: string;
  menu_item_name: string;
  menu_item_description: string;
  menu_item_price: number;
  menu_item_image_url?: string;
  menu_item_category: string;
}

interface ReviewsSectionProps {
  restaurantId: string;
}

export default function ReviewsSection({ restaurantId }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<MenuItemReviewWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        // Fetch menu item reviews for this restaurant
        const response = await fetch(
          `/api/menu-item-reviews?restaurant_id=${restaurantId}`
        );
        if (response.ok) {
          const reviewsData = await response.json();
          setReviews(reviewsData);

          // Calculate stats
          const totalReviews = reviewsData.length;
          const averageRating =
            totalReviews > 0
              ? reviewsData.reduce(
                  (sum: number, review: MenuItemReviewWithDetails) => sum + review.rating,
                  0
                ) / totalReviews
              : 0;

          const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
          reviewsData.forEach((review: MenuItemReviewWithDetails) => {
            ratingDistribution[
              review.rating as keyof typeof ratingDistribution
            ]++;
          });

          setStats({ totalReviews, averageRating, ratingDistribution });
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId) {
      fetchReviews();
    }
  }, [restaurantId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 3.5) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Customer Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <ThreeDotsLoader size="md" />
            <p className="text-gray-500 mt-2">Loading reviews...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Review Analytics
          </CardTitle>
          <CardDescription>
            Customer satisfaction and review trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Total Reviews with trend indicator */}
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-gray-900">
                {stats.totalReviews}
              </div>
              <p className="text-sm font-medium text-gray-700">Total Reviews</p>
              <p className="text-xs text-gray-500">
                {stats.totalReviews > 0 
                  ? "Customer feedback received" 
                  : "Waiting for first review"}
              </p>
            </div>

            {/* Average Rating with enhanced star display */}
            <div className="text-center space-y-3">
              <div className={`text-4xl font-bold ${getRatingColor(stats.averageRating)}`}>
                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "--"}
              </div>
              <div className="flex items-center justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(stats.averageRating)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm font-medium text-gray-700">Average Rating</p>
              <p className="text-xs text-gray-500">
                {stats.averageRating >= 4.5 
                  ? "Excellent satisfaction" 
                  : stats.averageRating >= 3.5 
                  ? "Good satisfaction" 
                  : stats.averageRating > 0 
                  ? "Room for improvement" 
                  : "No ratings yet"}
              </p>
            </div>

            {/* Rating Distribution with improved spacing */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700 text-center mb-4">
                Rating Breakdown
              </p>
              {Object.entries(stats.ratingDistribution)
                .reverse()
                .map(([rating, count]) => (
                  <div key={rating} className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1 w-8">
                      <span className="text-gray-700 font-medium">{rating}</span>
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all duration-300"
                        style={{
                          width: stats.totalReviews > 0 
                            ? `${(count / stats.totalReviews) * 100}%` 
                            : "0%",
                        }}
                      ></div>
                    </div>
                    <span className="w-8 text-gray-600 font-medium text-right">{count}</span>
                    <span className="w-10 text-xs text-gray-500 text-right">
                      {stats.totalReviews > 0 ? `${Math.round((count / stats.totalReviews) * 100)}%` : "0%"}
                    </span>
                  </div>
                ))}
              {stats.totalReviews === 0 && (
                <div className="text-center py-4">
                  <p className="text-xs text-gray-400 italic">
                    Rating distribution will appear when you receive reviews
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Additional insights row */}
          {stats.totalReviews > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-lg font-bold text-green-700">
                    {Math.round((stats.ratingDistribution[5] + stats.ratingDistribution[4]) / stats.totalReviews * 100)}%
                  </div>
                  <p className="text-xs text-green-600 font-medium">Positive Reviews</p>
                  <p className="text-xs text-green-500">4+ star ratings</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-lg font-bold text-blue-700">
                    {reviews.filter(r => r.review_text && r.review_text.length > 20).length}
                  </div>
                  <p className="text-xs text-blue-600 font-medium">Detailed Reviews</p>
                  <p className="text-xs text-blue-500">With written feedback</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-lg font-bold text-purple-700">
                    {new Set(reviews.map(r => r.menu_item_id)).size}
                  </div>
                  <p className="text-xs text-purple-600 font-medium">Items Reviewed</p>
                  <p className="text-xs text-purple-500">Different menu items</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Menu Item Reviews
          </CardTitle>
          <CardDescription>
            What your customers are saying about specific dishes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                No reviews yet
              </h3>
              <p className="text-gray-500">
                When customers leave reviews on menu items, they'll appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.slice(0, 10).map((review) => (
                <div key={review.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Header with name, rating, and menu item */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-900">
                          {review.diner_name}
                        </span>
                        <span className="text-gray-400">•</span>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < review.rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm font-medium text-blue-600">
                          {review.menu_item_name}
                        </span>
                      </div>

                      {/* Review text */}
                      {review.review_text && (
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {review.review_text}
                        </p>
                      )}
                    </div>

                    {/* Date */}
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                </div>
              ))}

              {reviews.length > 10 && (
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-500">
                    Showing latest 10 reviews • {reviews.length - 10} more available
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
