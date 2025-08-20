"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MessageSquare, TrendingUp } from "lucide-react";

interface DinerReview {
  id: string;
  rating: number;
  review_text: string;
  created_at: string;
  diner_profiles: {
    name: string;
    avatar_url?: string;
    email: string;
  };
}

interface ReviewsSectionProps {
  restaurantId: string;
}

export default function ReviewsSection({ restaurantId }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<DinerReview[]>([]);
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
        // Fetch reviews for this restaurant
        const response = await fetch(
          `/api/restaurant-reviews?restaurant_id=${restaurantId}`
        );
        if (response.ok) {
          const reviewsData = await response.json();
          setReviews(reviewsData);

          // Calculate stats
          const totalReviews = reviewsData.length;
          const averageRating =
            totalReviews > 0
              ? reviewsData.reduce(
                  (sum: number, review: DinerReview) => sum + review.rating,
                  0
                ) / totalReviews
              : 0;

          const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
          reviewsData.forEach((review: DinerReview) => {
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
          <div className="flex items-center justify-center py-8">
            <div className="text-center text-gray-500">Loading reviews...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReviews}</div>
            <p className="text-xs text-muted-foreground">
              From diner experiences
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Rating
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageRating.toFixed(1)}
              <span className="text-lg text-gray-500">/5</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              {renderStars(Math.round(stats.averageRating))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-xs w-3">{rating}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#5F7161] h-2 rounded-full"
                      style={{
                        width:
                          stats.totalReviews > 0
                            ? `${
                                (stats.ratingDistribution[
                                  rating as keyof typeof stats.ratingDistribution
                                ] /
                                  stats.totalReviews) *
                                100
                              }%`
                            : "0%",
                      }}
                    />
                  </div>
                  <span className="text-xs w-6">
                    {
                      stats.ratingDistribution[
                        rating as keyof typeof stats.ratingDistribution
                      ]
                    }
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Customer Reviews
          </CardTitle>
          <CardDescription>
            What your customers are saying about their dining experience
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
                When customers scan your QR code and leave reviews, they'll
                appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.slice(0, 10).map((review) => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.diner_profiles.avatar_url} />
                      <AvatarFallback>
                        {review.diner_profiles.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">
                            {review.diner_profiles.name}
                          </h4>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {renderStars(review.rating)}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {review.rating}/5
                            </Badge>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(review.created_at)}
                        </span>
                      </div>

                      {review.review_text && (
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {review.review_text}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {reviews.length > 10 && (
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-500">
                    Showing latest 10 reviews • {reviews.length - 10} more
                    available
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
