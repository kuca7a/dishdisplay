import { NextRequest, NextResponse } from "next/server";
import { menuItemReviewService } from "@/lib/menu-item-reviews";
import { CreateMenuItemReviewData } from "@/types/database";

export async function POST(request: NextRequest) {
  try {
    const reviewData: CreateMenuItemReviewData = await request.json();
    
    // Validate required fields
    if (!reviewData.menu_item_id || !reviewData.restaurant_id || !reviewData.diner_id || !reviewData.rating) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate rating range
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const review = await menuItemReviewService.createReview(reviewData);
    
    if (!review) {
      return NextResponse.json(
        { error: "Failed to create review" },
        { status: 500 }
      );
    }

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Error creating menu item review:", error);
    
    if (error instanceof Error && error.message.includes("duplicate")) {
      return NextResponse.json(
        { error: "You have already reviewed this item" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const menuItemId = searchParams.get("menu_item_id");
    const restaurantId = searchParams.get("restaurant_id");
    const dinerId = searchParams.get("diner_id");

    if (menuItemId) {
      // Get reviews for a specific menu item
      const reviews = await menuItemReviewService.getMenuItemReviews(menuItemId);
      return NextResponse.json(reviews);
    }

    if (restaurantId) {
      // Get recent reviews for a restaurant
      const limit = parseInt(searchParams.get("limit") || "10");
      const reviews = await menuItemReviewService.getRestaurantRecentReviews(restaurantId, limit);
      return NextResponse.json(reviews);
    }

    if (dinerId && menuItemId) {
      // Get a specific diner's review for a menu item
      const review = await menuItemReviewService.getDinerReviewForMenuItem(dinerId, menuItemId);
      return NextResponse.json(review);
    }

    return NextResponse.json(
      { error: "Missing required query parameters" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error fetching menu item reviews:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
