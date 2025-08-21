"use client";

import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  LogIn,
  User,
  Trophy,
  MapPin,
  Calendar,
  StarIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Restaurant } from "@/types/database";

interface DinerMenuInteractionsProps {
  restaurant: Restaurant;
}

export default function DinerMenuInteractions({
  restaurant,
}: DinerMenuInteractionsProps) {
  const { isAuthenticated, user, isLoading } = useAuth0();
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showVisitDialog, setShowVisitDialog] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isVisitLogged, setIsVisitLogged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleLogVisit = async () => {
    setIsSubmitting(true);
    try {
      // Call API to log visit
      const response = await fetch("/api/diner/visits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurant_id: restaurant.id,
          visit_date: new Date().toISOString(),
          notes: "Visited via QR code menu",
        }),
      });

      if (response.ok) {
        setIsVisitLogged(true);
        setShowVisitDialog(false);
        setSuccessMessage("Visit logged! +10 points earned.");
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        const error = await response.json();
        console.error("Visit logging failed:", error);
        alert("Failed to log visit. Please try again.");
      }
    } catch (error) {
      console.error("Error logging visit:", error);
      alert("Failed to log visit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      // Call API to submit review
      const response = await fetch("/api/diner/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurant_id: restaurant.id,
          rating,
          review_text: reviewText,
          photos: [],
        }),
      });

      if (response.ok) {
        setShowReviewDialog(false);
        setRating(0);
        setReviewText("");
        setSuccessMessage(
          "Review submitted! Thank you for sharing your experience."
        );
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        const error = await response.json();
        console.error("Review submission failed:", error);
        alert("Failed to submit review. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't show anything while Auth0 is loading
  if (isLoading) {
    return null;
  }

  // Guest user - show login prompt
  if (!isAuthenticated) {
    return (
      <Card className="fixed bottom-4 right-4 max-w-sm shadow-lg border-2 border-[#5F7161]/20 bg-white/95 backdrop-blur z-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="bg-[#5F7161] rounded-full p-2">
              <Trophy className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">
                Unlock Food Explorer Features!
              </h3>
              <p className="text-xs text-gray-600 mb-3">
                Track visits, write reviews, and earn dining achievements
              </p>
              <Link href="/login">
                <Button
                  size="sm"
                  className="w-full bg-[#5F7161] hover:bg-[#4C5B4F] text-white"
                >
                  <LogIn className="h-3 w-3 mr-1" />
                  Join as Food Explorer
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Authenticated user - show diner interactions
  return (
    <>
      {/* Success Message */}
      {successMessage && (
        <Card className="fixed bottom-20 right-4 max-w-sm shadow-lg border-2 border-green-200 bg-green-50 z-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="bg-green-500 rounded-full p-1">
                <Trophy className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-medium text-green-800">
                {successMessage}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Floating Action Menu */}
      <Card className="fixed bottom-4 right-4 shadow-lg border-2 border-[#5F7161]/20 bg-white/95 backdrop-blur z-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-[#5F7161] rounded-full p-1">
              <User className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs font-medium text-gray-700">
              {user?.name?.split(" ")[0]} • Food Explorer
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setShowVisitDialog(true)}
              size="sm"
              variant="outline"
              className="flex-1 text-xs"
              disabled={isVisitLogged}
            >
              <MapPin className="h-3 w-3 mr-1" />
              {isVisitLogged ? "Visited ✓" : "Log Visit"}
            </Button>
            <Button
              onClick={() => setShowReviewDialog(true)}
              size="sm"
              className="flex-1 bg-[#5F7161] hover:bg-[#4C5B4F] text-white text-xs"
            >
              <Star className="h-3 w-3 mr-1" />
              Review
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Visit Confirmation Dialog */}
      <Dialog open={showVisitDialog} onOpenChange={setShowVisitDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#5F7161]" />
              Log Your Visit
            </DialogTitle>
            <DialogDescription>
              Track your visit to {restaurant.name} and earn points toward your
              next dining achievement!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-[#5F7161]/5 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm">{restaurant.name}</h3>
                  <p className="text-xs text-gray-600">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <Badge className="bg-[#5F7161] text-white">+10 pts</Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowVisitDialog(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleLogVisit}
                className="flex-1 bg-[#5F7161] hover:bg-[#4C5B4F] text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging..." : "Log Visit"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-[#5F7161]" />
              Review {restaurant.name}
            </DialogTitle>
            <DialogDescription>
              Share your experience to help other food explorers discover great
              dining!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Rating Stars */}
            <div>
              <Label className="text-sm font-medium">Rating</Label>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <StarIcon
                      className={`h-6 w-6 ${
                        star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Review Text */}
            <div>
              <Label htmlFor="review" className="text-sm font-medium">
                Your Review (Optional)
              </Label>
              <Textarea
                id="review"
                placeholder="Tell others about your experience..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowReviewDialog(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReview}
                disabled={rating === 0 || isSubmitting}
                className="flex-1 bg-[#5F7161] hover:bg-[#4C5B4F] text-white"
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
