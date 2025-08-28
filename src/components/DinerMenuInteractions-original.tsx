"use client";

import React, { useState, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, LogIn, User, Trophy, Calendar, StarIcon } from "lucide-react";
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

  // Modular state management
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showVisitDialog, setShowVisitDialog] = useState(false);
  const [showEarnPointsModal, setShowEarnPointsModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState<
    "visit" | "review" | "photo-review" | null
  >(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Custom hook for diner actions
  const { handleLogVisit, handleSubmitReview } = useDinerActions(
    restaurant,
    (message) => setSuccessMessage(message)
  );

  const handleLogVisit = async () => {
    if (!isAuthenticated || !user?.email) {
      return;
    }

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
          user_email: user.email,
          user_name: user.name || user.email.split("@")[0],
        }),
      });

      if (response.ok) {
        setShowVisitDialog(false);
        setSuccessMessage("Visit logged! +10 points earned.");
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        await response.json();
        alert("Failed to log visit. Please try again.");
      }
    } catch {
      alert("Failed to log visit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) return;

    if (!isAuthenticated || !user?.email) {
      return;
    }

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
          user_email: user.email,
          user_name: user.name || user.email.split("@")[0],
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
        await response.json();
        alert("Failed to submit review. Please try again.");
      }
    } catch {
      alert("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // New functions for enhanced functionality
  const handlePhotoUpload = async (file: File) => {
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB");
      return;
    }

    setUploadingPhotos(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "review");

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const newPhoto = {
          url: data.url,
          preview: URL.createObjectURL(file),
        };
        setReviewPhotos((prev) => [...prev, newPhoto]);
      } else {
        await response.text();
        alert(`Failed to upload image: ${response.status}`);
      }
    } catch {
      alert("Failed to upload image");
    } finally {
      setUploadingPhotos(false);
    }
  };

  const removePhoto = (index: number) => {
    setReviewPhotos((prev) => {
      const newPhotos = [...prev];
      // Revoke the preview URL to free memory
      if (newPhotos[index].preview.startsWith("blob:")) {
        URL.revokeObjectURL(newPhotos[index].preview);
      }
      newPhotos.splice(index, 1);
      return newPhotos;
    });
  };

  const calculateReviewPoints = () => {
    let points = 0;
    if (rating > 0) points += 25; // Base review points
    if (reviewText.length >= 50) points += 10; // Detailed review bonus
    if (reviewPhotos.length > 0) points += reviewPhotos.length * 15; // Photo bonus
    return points;
  };

  const handleEarnPointsAction = (
    action: "visit" | "review" | "photo-review"
  ) => {
    setShowEarnPointsModal(false);
    setSelectedAction(action);

    if (action === "visit") {
      handleLogVisit();
    }
    // For review and photo-review, the dialog will open automatically via selectedAction state
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
              <Link href={`/login?returnTo=${encodeURIComponent(pathname)}`}>
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
              onClick={() => setShowEarnPointsModal(true)}
              size="sm"
              className="flex-1 bg-gradient-to-r from-[#5F7161] to-[#4C5B4F] hover:from-[#4C5B4F] hover:to-[#3A4A3D] text-white text-xs font-medium"
            >
              <Trophy className="h-3 w-3 mr-1" />
              Earn Points
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

      {/* Earn Points Modal */}
      <Dialog open={showEarnPointsModal} onOpenChange={setShowEarnPointsModal}>
        <DialogContent className="w-[95%] max-w-md mx-auto my-4 bg-white border shadow-lg rounded-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center text-[#5F7161]">
              Earn Points
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Choose how you'd like to earn points at {restaurant.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 p-4">
            {/* Log Visit Option */}
            <button
              onClick={() => handleEarnPointsAction("visit")}
              className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-[#5F7161] hover:bg-green-50 transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Log Visit</h3>
                  <p className="text-gray-600 text-sm">
                    Quick check-in for your visit
                  </p>
                </div>
                <div className="text-[#5F7161] font-bold">+10 points</div>
              </div>
            </button>

            {/* Review Option */}
            <button
              onClick={() => handleEarnPointsAction("review")}
              className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-[#5F7161] hover:bg-green-50 transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Write Review</h3>
                  <p className="text-gray-600 text-sm">
                    Share your experience with others
                  </p>
                </div>
                <div className="text-[#5F7161] font-bold">+25+ points</div>
              </div>
            </button>

            {/* Photo Review Option */}
            <button
              onClick={() => handleEarnPointsAction("photo-review")}
              className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-[#5F7161] hover:bg-green-50 transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Photo Review</h3>
                  <p className="text-gray-600 text-sm">
                    Upload photos with your review
                  </p>
                </div>
                <div className="text-[#5F7161] font-bold">+40+ points</div>
              </div>
            </button>
          </div>

          <div className="flex justify-center p-4">
            <Button
              variant="outline"
              onClick={() => setShowEarnPointsModal(false)}
              className="px-8"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Review Dialog with Photo Upload */}
      <Dialog
        open={selectedAction === "review" || selectedAction === "photo-review"}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedAction(null);
            setReviewText("");
            setRating(0);
            setReviewPhotos([]);
          }
        }}
      >
        <DialogContent className="w-[95%] max-w-md mx-auto my-4 bg-white border shadow-lg rounded-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {selectedAction === "photo-review"
                ? "Photo Review"
                : "Write Review"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Rating */}
            <div>
              <Label className="text-sm font-medium">Rating *</Label>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-2xl focus:outline-none"
                  >
                    {star <= rating ? "⭐" : "☆"}
                  </button>
                ))}
              </div>
            </div>

            {/* Review Text */}
            <div>
              <Label htmlFor="review" className="text-sm font-medium">
                Your Review{" "}
                {selectedAction === "photo-review" ? "*" : "(Optional)"}
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

            {/* Photo Upload Section */}
            {selectedAction === "photo-review" && (
              <div>
                <Label className="text-sm font-medium">Photos *</Label>
                <div className="mt-2 space-y-3">
                  {/* Upload Button */}
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={async (e) => {
                        if (!e.target.files) return;

                        const files = Array.from(e.target.files);

                        for (const file of files) {
                          await handlePhotoUpload(file);
                        }

                        // Reset the input so the same file can be selected again if needed
                        e.target.value = "";
                      }}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        fileInputRef.current?.click();
                      }}
                      disabled={uploadingPhotos || reviewPhotos.length >= 5}
                      className="flex items-center gap-2"
                    >
                      📸 Add Photos ({reviewPhotos.length}/5)
                    </Button>
                    <span className="text-xs text-gray-500">
                      {reviewPhotos.length}/5 photos
                    </span>
                  </div>

                  {/* Photo Previews */}
                  {reviewPhotos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {reviewPhotos.map((photo, index) => (
                        <div key={index} className="relative">
                          <Image
                            src={photo.preview}
                            alt={`Review photo ${index + 1}`}
                            width={80}
                            height={80}
                            className="w-full h-20 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {uploadingPhotos && (
                    <div className="text-sm text-gray-600">
                      Uploading photos...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Points Preview */}
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-green-800">
                Points you'll earn: +{calculateReviewPoints()} points
              </div>
              <div className="text-xs text-green-600 mt-1">
                {rating > 0 && "25 base points"}
                {reviewText.length >= 50 && " + 10 detailed review"}
                {selectedAction === "photo-review" &&
                  reviewPhotos.length > 0 &&
                  ` + ${reviewPhotos.length * 15} photo bonus`}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedAction(null);
                  setReviewText("");
                  setRating(0);
                  setReviewPhotos([]);
                }}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Enhanced handleSubmitReview logic
                  if (rating === 0) return;

                  if (!isAuthenticated || !user?.email) {
                    return;
                  }

                  // Additional validation for photo reviews
                  if (selectedAction === "photo-review") {
                    if (reviewPhotos.length === 0) {
                      alert("Please add at least one photo for a photo review");
                      return;
                    }
                    if (reviewText.length < 10) {
                      alert(
                        "Please write a detailed review to accompany your photos (at least 10 characters)"
                      );
                      return;
                    }
                  }

                  setIsSubmitting(true);

                  fetch("/api/diner/reviews", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      restaurant_id: restaurant.id,
                      rating,
                      review_text: reviewText,
                      photos: reviewPhotos.map((photo) => photo.url),
                      user_email: user.email,
                      user_name: user.name || user.email.split("@")[0],
                    }),
                  })
                    .then((response) => {
                      if (response.ok) {
                        setSelectedAction(null);
                        setRating(0);
                        setReviewText("");
                        setReviewPhotos([]);
                        const points = calculateReviewPoints();
                        setSuccessMessage(
                          `Review submitted! +${points} points earned. Thank you for sharing your experience.`
                        );
                        // Clear success message after 3 seconds
                        setTimeout(() => setSuccessMessage(""), 3000);
                      } else {
                        response.json().then(() => {
                          alert("Failed to submit review. Please try again.");
                        });
                      }
                    })
                    .catch(() => {
                      alert("Failed to submit review. Please try again.");
                    })
                    .finally(() => {
                      setIsSubmitting(false);
                    });
                }}
                disabled={
                  rating === 0 ||
                  isSubmitting ||
                  uploadingPhotos ||
                  (selectedAction === "photo-review" &&
                    (reviewPhotos.length === 0 || reviewText.length < 10))
                }
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
