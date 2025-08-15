"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Camera,
  Upload,
  X,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { uploadMenuImage, compressImage } from "@/lib/storage";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThreeDotsLoader } from "./ui/three-dots-loader";

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  restaurantId: string;
  currentImageUrl?: string;
  className?: string;
}

export function ImageUpload({
  onImageUploaded,
  restaurantId,
  currentImageUrl,
  className = "",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || "");
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      setProgress(10);

      // Show preview immediately
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setProgress(30);

      // Compress image
      const compressedFile = await compressImage(file);
      setProgress(60);

      // Upload via API route
      const result = await uploadMenuImage(compressedFile, restaurantId);
      setProgress(90);

      if ("error" in result) {
        setError(result.error);
        setPreviewUrl(currentImageUrl || "");
        return;
      }

      // Success
      setProgress(100);
      onImageUploaded(result.url);
      setPreviewUrl(result.url);

      // Clean up object URL
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Failed to upload image");
      setPreviewUrl(currentImageUrl || "");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleFileSelect(file);
    } else {
      setError("Please select an image file");
    }
  };

  const removeImage = () => {
    setPreviewUrl("");
    onImageUploaded("");
    setError(null);

    // Reset file inputs
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Label>Menu Item Image</Label>

      {/* Image Preview */}
      {previewUrl && (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border">
          <Image
            src={previewUrl}
            alt="Menu item preview"
            fill
            className="object-cover"
          />
          {!uploading && (
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center text-white space-y-2">
                <ThreeDotsLoader size="md" color="white" />
                <div className="text-sm">Uploading...</div>
                <Progress value={progress} className="w-32" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Area */}
      {!previewUrl && (
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
            ${
              dragActive
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }
            ${uploading ? "pointer-events-none opacity-50" : ""}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <div className="space-y-3">
              <ThreeDotsLoader size="md" />
              <div>
                <div className="text-sm font-medium">Uploading image...</div>
                <Progress value={progress} className="w-48 mx-auto mt-2" />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <ImageIcon className="h-12 w-12 mx-auto text-gray-400" />
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Click to upload or drag and drop
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  PNG, JPG, WEBP up to 5MB
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {!uploading && (
        <div className="flex gap-2">
          {/* File Upload */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose File
          </Button>

          {/* Camera Capture */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => cameraInputRef.current?.click()}
            className="flex-1"
          >
            <Camera className="h-4 w-4 mr-2" />
            Take Photo
          </Button>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment" // Use back camera on mobile
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Helper Text */}
      <p className="text-xs text-gray-500">
        Upload a high-quality image of your dish. Images will be automatically
        optimized for fast loading.
      </p>
    </div>
  );
}
