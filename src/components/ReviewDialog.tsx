"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, StarIcon, Upload, X, AlertCircle } from "lucide-react";
import { PhotoData } from "@/hooks/use-diner-actions";

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rating: number;
  onRatingChange: (rating: number) => void;
  reviewText: string;
  onReviewTextChange: (text: string) => void;
  reviewPhotos: PhotoData[];
  onPhotoUpload: (file: File) => Promise<void>;
  onPhotoRemove: (index: number) => void;
  uploadingPhotos: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
  restaurantName: string;
  selectedAction: "review" | "photo-review" | null;
  error?: string;
  onClearError?: () => void;
}

export default function ReviewDialog({
  open,
  onOpenChange,
  rating,
  onRatingChange,
  reviewText,
  onReviewTextChange,
  reviewPhotos,
  onPhotoUpload,
  onPhotoRemove,
  uploadingPhotos,
  isSubmitting,
  onSubmit,
  restaurantName,
  selectedAction,
  error,
  onClearError,
}: ReviewDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPhotoReview = selectedAction === "photo-review";
  const isSubmitDisabled =
    rating === 0 ||
    isSubmitting ||
    uploadingPhotos ||
    (isPhotoReview && (reviewPhotos.length === 0 || reviewText.length < 10));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    for (const file of files) {
      if (reviewPhotos.length >= 5) {
        onClearError?.(); // Clear previous errors
        // Use a more gentle approach than alert - could set a warning state
        break;
      }
      await onPhotoUpload(file);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = () => {
    if (rating === 0) return;

    // Clear any previous errors before validation
    onClearError?.();

    // Additional validation for photo reviews
    if (selectedAction === "photo-review") {
      if (reviewPhotos.length === 0) {
        return; // The validation will be handled by the disabled state
      }
      if (reviewText.length < 10) {
        return; // The validation will be handled by the disabled state
      }
    }

    onSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            {isPhotoReview ? "Photo Review" : "Write Review"} - {restaurantName}
          </DialogTitle>
          <DialogDescription>
            {isPhotoReview
              ? "Share your experience with photos and detailed review (+40 points)"
              : "Share your dining experience (+25 points)"}
          </DialogDescription>
        </DialogHeader>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Rating */}
          <div>
            <Label className="text-sm font-medium">Rating *</Label>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => onRatingChange(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  {star <= rating ? (
                    <StarIcon className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                  ) : (
                    <StarIcon className="h-6 w-6 text-gray-300" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Review Text */}
          <div>
            <Label htmlFor="review-text" className="text-sm font-medium">
              Review {isPhotoReview ? "*" : "(Optional)"}
            </Label>
            <Textarea
              id="review-text"
              placeholder={
                isPhotoReview
                  ? "Write a detailed review to accompany your photos (minimum 10 characters)..."
                  : "Tell us about your experience..."
              }
              value={reviewText}
              onChange={(e) => onReviewTextChange(e.target.value)}
              className="mt-2 min-h-[100px]"
            />
            {isPhotoReview && (
              <p className="text-xs text-gray-500 mt-1">
                {reviewText.length}/10 characters minimum
              </p>
            )}
          </div>

          {/* Photo Upload */}
          <div>
            <Label className="text-sm font-medium">
              Photos {isPhotoReview ? "*" : "(Optional)"}
            </Label>
            <div className="mt-2 space-y-3">
              {/* Photo Grid */}
              {reviewPhotos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {reviewPhotos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={photo.preview}
                        alt={`Review photo ${index + 1}`}
                        width={150}
                        height={150}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        onClick={() => onPhotoRemove(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              {reviewPhotos.length < 5 && (
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhotos || reviewPhotos.length >= 5}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingPhotos
                      ? "Uploading..."
                      : `Add Photos (${reviewPhotos.length}/5)`}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => {
                onClearError?.();
                onOpenChange(false);
              }}
              variant="outline"
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitDisabled || !!error}
              className="flex-1 bg-[#5F7161] hover:bg-[#5F7161]/80"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
