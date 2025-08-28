import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { restaurantService, menuItemService } from "@/lib/database";

const BUCKET_NAME = "menu-images";

export async function POST(request: NextRequest) {
  try {
    const { restaurantId, userEmail, confirmationText } = await request.json();

    if (!restaurantId || !userEmail || !confirmationText) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("Processing account deletion for:", userEmail);

    // Get restaurant data to verify ownership and name
    const restaurant = await restaurantService.getById(restaurantId);

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    if (restaurant.owner_email !== userEmail) {
      return NextResponse.json(
        { error: "You are not authorized to delete this restaurant" },
        { status: 403 }
      );
    }

    // Validate confirmation text
    const expectedConfirmation = `DELETE ${restaurant.name}`;
    if (confirmationText !== expectedConfirmation) {
      return NextResponse.json(
        { error: "Confirmation text does not match" },
        { status: 400 }
      );
    }

    console.log("Verification passed, starting deletion process...");

    // Get all menu items for this restaurant
    const menuItems = await menuItemService.getByRestaurantId(restaurantId);
    console.log(`Found ${menuItems.length} menu items to delete`);

    // Step 2: Delete all uploaded images from Supabase Storage
    const imagesToDelete: string[] = [];

    // Collect image paths from menu items
    for (const item of menuItems) {
      if (item.image_url) {
        // Extract the file path from the full URL
        const urlParts = item.image_url.split(
          `/storage/v1/object/public/${BUCKET_NAME}/`
        );
        if (urlParts.length > 1) {
          imagesToDelete.push(urlParts[1]);
        }
      }
    }

    // Collect image paths from restaurant profile
    if (restaurant.logo_url) {
      const urlParts = restaurant.logo_url.split(
        `/storage/v1/object/public/${BUCKET_NAME}/`
      );
      if (urlParts.length > 1) {
        imagesToDelete.push(urlParts[1]);
      }
    }

    if (restaurant.cover_image_url) {
      const urlParts = restaurant.cover_image_url.split(
        `/storage/v1/object/public/${BUCKET_NAME}/`
      );
      if (urlParts.length > 1) {
        imagesToDelete.push(urlParts[1]);
      }
    }

    console.log(`Deleting ${imagesToDelete.length} images from storage`);

    // Delete images in batches
    if (imagesToDelete.length > 0) {
      try {
        const { error: storageError } = await supabaseServer.storage
          .from(BUCKET_NAME)
          .remove(imagesToDelete);

        if (storageError) {
          console.error("Storage deletion error:", storageError);
          // Continue with deletion even if some images fail
        } else {
          console.log("Successfully deleted images from storage");
        }
      } catch (storageErr) {
        console.error("Storage deletion failed:", storageErr);
        // Continue with deletion
      }
    }

    // Step 3: Delete menu items from database
    console.log("Deleting menu items from database...");
    for (const item of menuItems) {
      try {
        await menuItemService.delete(item.id);
      } catch (err) {
        console.error(`Failed to delete menu item ${item.id}:`, err);
        // Continue with other deletions
      }
    }

    // Step 4: Delete restaurant from database
    console.log("Deleting restaurant from database...");
    await restaurantService.delete(restaurantId);

    // Step 5: Anonymize any payment records (keep for compliance but remove PII)
    console.log("Anonymizing payment records...");
    try {
      const { error: paymentError } = await supabaseServer
        .from("payments")
        .update({
          email: `deleted-user-${Date.now()}@anonymized.local`,
          customer_name: "Deleted User",
          // Keep financial data for compliance
        })
        .eq("email", userEmail);

      if (paymentError) {
        console.error("Payment anonymization error:", paymentError);
        // Don't fail the deletion for this
      }
    } catch (paymentErr) {
      console.error("Payment anonymization failed:", paymentErr);
      // Continue
    }

    // Step 6: Delete from Auth0 (optional - could be done client-side or via webhook)
    // Note: This would require Auth0 Management API integration
    // For now, we'll let Auth0 handle this through their UI or leave it

    console.log("Account deletion completed successfully");

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
      deletedItems: {
        restaurant: restaurant.name,
        menuItems: menuItems.length,
        images: imagesToDelete.length,
      },
    });
  } catch (error) {
    console.error("Account deletion error:", error);

    return NextResponse.json(
      {
        error: "Failed to delete account",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
