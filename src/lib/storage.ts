import { getSupabaseClient } from "./supabase";

const supabase = getSupabaseClient();
const BUCKET_NAME = "menu-images";

export interface UploadResult {
  url: string;
  path: string;
}

export interface UploadError {
  error: string;
  details?: string;
}

/**
 * Initialize storage bucket (create if doesn't exist)
 */
export const initializeStorageBucket = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    if (!supabase) {
      return { success: false, error: "Supabase client not available" };
    }

    // Check if bucket exists
    const { data: buckets, error: listError } =
      await supabase.storage.listBuckets();

    if (listError) {
      return { success: false, error: listError.message };
    }

    const bucketExists = buckets?.some((bucket) => bucket.name === BUCKET_NAME);

    if (!bucketExists) {
      // Create bucket with public access
      const { error: createError } = await supabase.storage.createBucket(
        BUCKET_NAME,
        {
          public: true,
          allowedMimeTypes: ["image/*"],
          fileSizeLimit: 5242880, // 5MB
        }
      );

      if (createError) {
        return { success: false, error: createError.message };
      }
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Upload an image file using the API route (production-ready)
 */
export const uploadMenuImage = async (
  file: File,
  restaurantId: string
): Promise<UploadResult | UploadError> => {
  try {
    // Validate file
    if (!file.type.startsWith("image/")) {
      return { error: "Please select an image file" };
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { error: "Image must be smaller than 5MB" };
    }

    // Create form data for API request
    const formData = new FormData();
    formData.append("file", file);
    formData.append("restaurantId", restaurantId);

    // Upload via API route
    const response = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        error: result.error || "Failed to upload image",
        details: result.details,
      };
    }

    if (!result.success) {
      return {
        error: result.error || "Upload failed",
        details: result.details,
      };
    }

    return {
      url: result.url,
      path: result.path,
    };
  } catch {
    return { error: "Failed to upload image" };
  }
};

/**
 * Delete an image from Supabase Storage
 */
export const deleteMenuImage = async (imagePath: string): Promise<boolean> => {
  try {
    if (!imagePath) return true;

    // Extract path from full URL if needed
    const path = imagePath.includes(BUCKET_NAME)
      ? imagePath.split(`${BUCKET_NAME}/`)[1]
      : imagePath;

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

    if (error) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

/**
 * Get optimized image URL with transformations
 */
export const getOptimizedImageUrl = (
  originalUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
  } = {}
): string => {
  if (!originalUrl) return originalUrl;

  const { width = 400, height = 300, quality = 80 } = options;

  // Supabase automatically optimizes images with transform parameters
  const url = new URL(originalUrl);
  url.searchParams.set("width", width.toString());
  url.searchParams.set("height", height.toString());
  url.searchParams.set("resize", "cover");
  url.searchParams.set("quality", quality.toString());

  return url.toString();
};

/**
 * Compress image file before upload (client-side)
 */
export const compressImage = (
  file: File,
  maxWidth = 800,
  quality = 0.8
): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      const newWidth = img.width * ratio;
      const newHeight = img.height * ratio;

      // Set canvas size
      canvas.width = newWidth;
      canvas.height = newHeight;

      // Draw and compress
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      canvas.toBlob(
        (blob) => {
          const compressedFile = new File([blob!], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        file.type,
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
};
