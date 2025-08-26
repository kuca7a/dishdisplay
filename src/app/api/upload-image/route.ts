import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

const MENU_BUCKET = "menu-images";
const REVIEW_BUCKET = "review-photos";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Generate a unique filename for menu images
 */
const generateFileName = (
  originalName: string,
  restaurantId: string
): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const extension = originalName.split(".").pop()?.toLowerCase() || "jpg";
  return `${restaurantId}/${timestamp}-${random}.${extension}`;
};

/**
 * Generate a unique filename for review photos
 */
const generateReviewFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const extension = originalName.split(".").pop()?.toLowerCase() || "jpg";
  return `reviews/${timestamp}-${random}.${extension}`;
};

export async function POST(request: NextRequest) {
  try {
    console.log("Image upload API called");

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const restaurantId = formData.get("restaurantId") as string;
    const type = formData.get("type") as string; // 'menu' or 'review'

    if (!file) {
      console.error("No file provided");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Determine bucket and filename based on type
    let bucketName: string;
    let fileName: string;

    if (type === "review") {
      bucketName = REVIEW_BUCKET;
      fileName = generateReviewFileName(file.name);
    } else {
      // Default to menu upload
      if (!restaurantId) {
        console.error("No restaurant ID provided for menu upload");
        return NextResponse.json(
          { error: "Restaurant ID is required for menu uploads" },
          { status: 400 }
        );
      }
      bucketName = MENU_BUCKET;
      fileName = generateFileName(file.name, restaurantId);
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      console.error("Invalid file type:", file.type);
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      console.error("File too large:", file.size);
      return NextResponse.json(
        { error: "File must be smaller than 5MB" },
        { status: 400 }
      );
    }

    console.log("File validation passed:", {
      name: file.name,
      size: file.size,
      type: file.type,
      uploadType: type,
      bucket: bucketName,
    });

    console.log("Generated filename:", fileName);

    // Convert File to ArrayBuffer for Supabase
    const fileBuffer = await file.arrayBuffer();

    console.log("Uploading to Supabase Storage...");

    // Upload to Supabase Storage using service key (bypasses RLS)
    const { error: uploadError } = await supabaseServer.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload image", details: uploadError.message },
        { status: 500 }
      );
    }

    console.log("Upload successful, generating public URL...");

    // Get public URL
    const { data: urlData } = supabaseServer.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    console.log("Upload complete:", urlData.publicUrl);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: fileName,
      type: type || 'menu',
    });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
