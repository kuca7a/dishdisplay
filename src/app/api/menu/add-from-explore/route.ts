import { NextRequest, NextResponse } from "next/server";
import { getServerSupabaseClient } from "@/lib/supabase-server";
import { transformExploreToMenuItem } from "@/lib/menu-integration-service";
import { ExploreMenuItem } from "@/types/explore";

export async function POST(request: NextRequest) {
  try {
    const { restaurantId, exploreItem } = await request.json() as {
      restaurantId: string;
      exploreItem: ExploreMenuItem;
    };

    if (!restaurantId || !exploreItem) {
      return NextResponse.json(
        { message: "Restaurant ID and explore item are required" },
        { status: 400 }
      );
    }

    const supabase = getServerSupabaseClient();

    // Verify the restaurant exists
    const { data: restaurant, error: restaurantError } = await supabase
      .from("restaurants")
      .select("id, owner_email")
      .eq("id", restaurantId)
      .single();

    if (restaurantError || !restaurant) {
      return NextResponse.json(
        { message: "Restaurant not found" },
        { status: 404 }
      );
    }

    // Check if item with same name already exists in this restaurant's menu
    const { data: existingItem } = await supabase
      .from("menu_items")
      .select("id")
      .eq("restaurant_id", restaurantId)
      .eq("name", exploreItem.name)
      .single();

    if (existingItem) {
      return NextResponse.json(
        { message: "A menu item with this name already exists in your menu" },
        { status: 409 }
      );
    }

    // Transform explore item to menu item
    const menuItemData = transformExploreToMenuItem(exploreItem, restaurantId);

    // Insert the new menu item
    const { data: newMenuItem, error: insertError } = await supabase
      .from("menu_items")
      .insert(menuItemData)
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting menu item:", insertError);
      return NextResponse.json(
        { message: "Failed to add item to menu", error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(newMenuItem, { status: 201 });
  } catch (error) {
    console.error("Error in add-from-explore API:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}