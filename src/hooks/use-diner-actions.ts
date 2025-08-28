"use client";

import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Restaurant } from "@/types/database";
import { dinerApiService } from "@/lib/diner-api-service";

export interface PhotoData {
  url: string;
  preview: string;
}

export function useDinerActions(
  restaurant: Restaurant,
  onSuccess: (message: string) => void
) {
  const { isAuthenticated, user } = useAuth0();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewPhotos, setReviewPhotos] = useState<PhotoData[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visitError, setVisitError] = useState<string>("");
  const [reviewError, setReviewError] = useState<string>("");

  const resetReviewForm = () => {
    setRating(0);
    setReviewText("");
    setReviewPhotos([]);
    setUploadingPhotos(false);
    setReviewError(""); // Clear errors when resetting
  };

  const handleLogVisit = async () => {
    if (!isAuthenticated || !user?.email) return;

    setIsSubmitting(true);
    setVisitError(""); // Clear any previous errors

    try {
      const result = await dinerApiService.logVisit({
        restaurant_id: restaurant.id,
        visit_date: new Date().toISOString(),
        notes: "Visited via QR code menu",
        user_email: user.email,
        user_name: user.name || user.email.split("@")[0],
      });

      if (result.success) {
        onSuccess(`Visit logged! +${result.pointsEarned} points earned.`);
      } else {
        setVisitError(
          result.error?.message || "Failed to log visit. Please try again."
        );
      }
    } catch {
      setVisitError("Failed to log visit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0 || !isAuthenticated || !user?.email) return;

    setIsSubmitting(true);
    setReviewError(""); // Clear any previous errors

    try {
      const result = await dinerApiService.submitReview({
        restaurant_id: restaurant.id,
        rating,
        content: reviewText,
        photo_urls: reviewPhotos.map((p) => p.url),
        user_email: user.email,
        user_name: user.name || user.email.split("@")[0],
      });

      if (result.success) {
        resetReviewForm();
        onSuccess(
          `Review submitted! +${result.pointsEarned} points earned. Thank you for sharing your experience.`
        );
      } else {
        setReviewError(
          result.error?.message || "Failed to submit review. Please try again."
        );
      }
    } catch {
      setReviewError("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    if (!file) return;

    setUploadingPhotos(true);
    setReviewError(""); // Clear any previous errors

    try {
      const photoData = await dinerApiService.uploadPhoto(file);
      if (photoData) {
        setReviewPhotos((prev) => [...prev, photoData]);
      }
    } catch (error) {
      setReviewError(
        error instanceof Error
          ? error.message
          : "Failed to upload photo. Please try again."
      );
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setReviewPhotos((prev) => {
      const newPhotos = [...prev];
      // Revoke the preview URL to free memory
      URL.revokeObjectURL(newPhotos[index].preview);
      newPhotos.splice(index, 1);
      return newPhotos;
    });
  };

  return {
    isAuthenticated,
    user,
    rating,
    setRating,
    reviewText,
    setReviewText,
    reviewPhotos,
    uploadingPhotos,
    isSubmitting,
    visitError,
    reviewError,
    handleLogVisit,
    handleSubmitReview,
    handlePhotoUpload,
    handleRemovePhoto,
    resetReviewForm,
    clearVisitError: () => setVisitError(""),
    clearReviewError: () => setReviewError(""),
  };
}
