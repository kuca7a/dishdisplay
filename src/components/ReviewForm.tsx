"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Star, 
  X, 
  Camera,
  Clock
} from "lucide-react";
import Image from "next/image";

interface ReviewFormProps {
  visitId: string;
  onSubmit: (reviewData: ReviewFormData) => Promise<void>;
  onClose: () => void;
}

interface ReviewFormData {
  rating: number;
  content?: string;
  photo_urls?: string[];
  is_public?: boolean;
}

export default function ReviewForm({ visitId, onSubmit, onClose }: ReviewFormProps) {
  const [formData, setFormData] = useState<ReviewFormData>({
    rating: 0,
    content: "",
    photo_urls: [],
    is_public: true
  });
  
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        formDataUpload.append('type', 'review');
        
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formDataUpload,
        });
        
        if (!response.ok) throw new Error('Upload failed');
        const data = await response.json();
        return data.url;
      });

      const urls = await Promise.all(uploadPromises);
      setFormData(prev => ({ 
        ...prev, 
        photo_urls: [...(prev.photo_urls || []), ...urls] 
      }));
    } catch (error) {
      console.error('Photo upload error:', error);
      alert('Failed to upload photos. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photo_urls: (prev.photo_urls || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (formData.rating === 0) {
      alert('Please provide a rating');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
      // Reset form
      setFormData({
        rating: 0,
        content: "",
        photo_urls: [],
        is_public: true
      });
    } catch (error) {
      console.error('Review submission error:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Share your dining experience with other food lovers
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Rating */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold">Overall Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, rating }))}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-8 w-8 ${
                      rating <= formData.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Written Review */}
          <div className="space-y-3">
            <Label htmlFor="content" className="font-semibold">
              Tell us about your experience (optional)
            </Label>
            <Textarea
              id="content"
              placeholder="Share details about the food, service, atmosphere, or anything that stood out about your visit..."
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Photo Upload */}
          <div className="space-y-3">
            <Label className="font-semibold">Add Photos (Optional)</Label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  className="gap-2"
                  onClick={() => document.getElementById('photo-upload')?.click()}
                >
                  <Camera className="h-4 w-4" />
                  {uploading ? 'Uploading...' : 'Add Photos'}
                </Button>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <span className="text-sm text-gray-500">
                  Max 5 photos, 10MB each
                </span>
              </div>

              {formData.photo_urls && formData.photo_urls.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {formData.photo_urls.map((url, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={url}
                        alt={`Review photo ${index + 1}`}
                        width={96}
                        height={96}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Privacy Setting */}
          <div className="space-y-3">
            <Label className="font-semibold">Privacy</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_public"
                checked={formData.is_public}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: checked }))}
              />
              <Label htmlFor="is_public">Make this review public</Label>
            </div>
            <p className="text-sm text-gray-500">
              Public reviews help other diners discover great restaurants
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || formData.rating === 0}
              className="gap-2"
            >
              {submitting ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
