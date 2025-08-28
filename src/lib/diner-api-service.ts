import { PhotoData } from "@/hooks/use-diner-actions";

export interface VisitData {
  restaurant_id: string;
  visit_date: string;
  notes: string;
  user_email: string;
  user_name: string;
}

export interface ReviewData {
  restaurant_id: string;
  rating: number;
  content: string;
  photo_urls: string[];
  user_email: string;
  user_name: string;
}

export interface ApiError {
  error: string;
  message: string;
  canRetry?: boolean;
}

export const dinerApiService = {
  async logVisit(
    data: VisitData
  ): Promise<{ success: boolean; error?: ApiError; pointsEarned?: number }> {
    try {
      const response = await fetch("/api/diner/visits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            error: result.error || "Failed to log visit",
            message:
              result.message || result.details || "Please try again later",
            canRetry: response.status >= 500 || result.canRetry,
          },
        };
      }

      return {
        success: true,
        pointsEarned: result.points_earned || 0,
      };
    } catch {
      return {
        success: false,
        error: {
          error: "Network error",
          message: "Please check your connection and try again",
          canRetry: true,
        },
      };
    }
  },

  async submitReview(
    data: ReviewData
  ): Promise<{ success: boolean; error?: ApiError; pointsEarned?: number }> {
    try {
      const response = await fetch("/api/diner/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            error: result.error || "Failed to submit review",
            message:
              result.message || result.details || "Please try again later",
            canRetry: response.status >= 500 || result.canRetry,
          },
        };
      }

      return {
        success: true,
        pointsEarned: result.points_earned || 0,
      };
    } catch {
      return {
        success: false,
        error: {
          error: "Network error",
          message: "Please check your connection and try again",
          canRetry: true,
        },
      };
    }
  },

  async uploadPhoto(file: File): Promise<PhotoData | null> {
    if (!file) return null;

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      throw new Error("Please select an image file");
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Image must be less than 5MB");
    }

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
        return {
          url: data.url,
          preview: URL.createObjectURL(file),
        };
      } else {
        await response.text();
        throw new Error(`Failed to upload image: ${response.status}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to upload image");
    }
  },
};
