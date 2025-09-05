import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Common validation schemas
export const emailSchema = z.string().email("Invalid email format");
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters");
export const uuidSchema = z.string().uuid("Invalid UUID format");
export const phoneSchema = z
  .string()
  .regex(/^[\+]?[1-9][\d]{0,15}$/, "Invalid phone number");
export const urlSchema = z.string().url("Invalid URL format");

// Restaurant validation schemas
export const restaurantNameSchema = z
  .string()
  .min(1, "Restaurant name is required")
  .max(100, "Restaurant name must be less than 100 characters")
  .regex(
    /^[a-zA-Z0-9\s\-\.\'&]+$/,
    "Restaurant name contains invalid characters"
  );

export const menuItemNameSchema = z
  .string()
  .min(1, "Menu item name is required")
  .max(100, "Menu item name must be less than 100 characters");

export const priceSchema = z
  .number()
  .min(0, "Price must be positive")
  .max(10000, "Price seems too high");

export const descriptionSchema = z
  .string()
  .max(1000, "Description must be less than 1000 characters");

// Review validation schemas
export const ratingSchema = z
  .number()
  .int("Rating must be a whole number")
  .min(1, "Rating must be at least 1")
  .max(5, "Rating must be at most 5");

export const reviewTextSchema = z
  .string()
  .max(2000, "Review text must be less than 2000 characters");

// Generic validation middleware
export function validateBody<T>(schema: z.ZodSchema<T>) {
  return async (
    request: NextRequest
  ): Promise<
    { data: T; error?: never } | { data?: never; error: NextResponse }
  > => {
    try {
      const body = await request.json();
      const data = schema.parse(body);
      return { data };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          error: NextResponse.json(
            {
              error: "Validation failed",
              details: error.issues.map((err: z.ZodIssue) => ({
                field: err.path.join("."),
                message: err.message,
              })),
            },
            { status: 400 }
          ),
        };
      }

      return {
        error: NextResponse.json(
          { error: "Invalid JSON format" },
          { status: 400 }
        ),
      };
    }
  };
}

// Validate query parameters
export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return (
    searchParams: URLSearchParams
  ): { data: T; error?: never } | { data?: never; error: NextResponse } => {
    try {
      const queryObject = Object.fromEntries(searchParams.entries());
      const data = schema.parse(queryObject);
      return { data };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          error: NextResponse.json(
            {
              error: "Query validation failed",
              details: error.issues.map((err: z.ZodIssue) => ({
                field: err.path.join("."),
                message: err.message,
              })),
            },
            { status: 400 }
          ),
        };
      }

      return {
        error: NextResponse.json(
          { error: "Invalid query parameters" },
          { status: 400 }
        ),
      };
    }
  };
}

// Sanitize HTML input to prevent XSS
export function sanitizeHtml(input: string): string {
  // Basic HTML sanitization - in production, use a library like DOMPurify
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// Validate and sanitize text input
export function sanitizeText(input: string, maxLength: number = 1000): string {
  return sanitizeHtml(input.trim()).slice(0, maxLength);
}

// Common validation schemas for API endpoints
export const createRestaurantSchema = z.object({
  name: restaurantNameSchema,
  business_type: z.string().max(50),
  description: descriptionSchema.optional(),
  phone: phoneSchema.optional(),
  business_email: emailSchema.optional(),
  website: urlSchema.optional(),
});

export const createMenuItemSchema = z.object({
  name: menuItemNameSchema,
  description: descriptionSchema.optional(),
  price: priceSchema,
  category: z.string().max(50),
  is_available: z.boolean().optional(),
  dietary_info: z.array(z.string()).optional(),
});

export const createReviewSchema = z.object({
  rating: ratingSchema,
  review_text: reviewTextSchema.optional(),
  photos: z
    .array(z.string().url())
    .max(5, "Maximum 5 photos allowed")
    .optional(),
});

export const updateProfileSchema = z.object({
  display_name: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  is_public: z.boolean().optional(),
});

// Rate limiting validation
export const rateLimitBypassSchema = z.object({
  bypass_token: z.string().optional(),
});

// Middleware to validate CSRF tokens (simplified)
export function validateCSRF(request: NextRequest): boolean {
  // In a real implementation, you'd validate CSRF tokens
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  // Basic origin validation
  if (origin && !isAllowedOrigin(origin)) {
    return false;
  }

  if (referer && !isAllowedOrigin(new URL(referer).origin)) {
    return false;
  }

  return true;
}

function isAllowedOrigin(origin: string): boolean {
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_BASE_URL,
    "http://localhost:3000",
    "https://localhost:3000",
  ].filter(Boolean);

  return allowedOrigins.includes(origin);
}

// Helper to validate file uploads
export const fileUploadSchema = z.object({
  filename: z.string().max(255),
  size: z.number().max(5 * 1024 * 1024), // 5MB max
  type: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]),
});

export function validateFileUpload(file: {
  name: string;
  size: number;
  type: string;
}) {
  return fileUploadSchema.safeParse({
    filename: file.name,
    size: file.size,
    type: file.type,
  });
}
