import { NextRequest, NextResponse } from "next/server";
import { menuItemReviewService } from "@/lib/menu-item-reviews";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const updates = await request.json();

    // Validate rating if provided
    if (updates.rating !== undefined && (updates.rating < 1 || updates.rating > 5)) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const updatedReview = await menuItemReviewService.updateReview(id, updates);
    
    if (!updatedReview) {
      return NextResponse.json(
        { error: "Review not found or failed to update" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error("Error updating menu item review:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    const success = await menuItemReviewService.deleteReview(id);
    
    if (!success) {
      return NextResponse.json(
        { error: "Review not found or failed to delete" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting menu item review:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
