import { NextRequest, NextResponse } from "next/server";
import GeocodingService from "@/lib/geocoding-service";
import { apiRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await apiRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { restaurantId, limit } = await request.json();

    let result;

    if (restaurantId) {
      // Geocode a specific restaurant
      console.log(`Geocoding specific restaurant: ${restaurantId}`);
      result = await GeocodingService.geocodeRestaurantById(restaurantId);
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }

      return NextResponse.json({
        message: "Restaurant geocoded successfully",
        coordinates: result.coordinates
      });

    } else {
      // Batch geocode restaurants
      const batchLimit = limit && limit <= 50 ? limit : 10; // Max 50 to prevent timeout
      console.log(`Starting batch geocoding of up to ${batchLimit} restaurants`);
      
      result = await GeocodingService.geocodeRestaurants(batchLimit);
      
      return NextResponse.json({
        message: `Geocoding completed: ${result.updated}/${result.processed} restaurants updated`,
        processed: result.processed,
        updated: result.updated,
        errors: result.errors
      });
    }

  } catch (error) {
    console.error("Geocoding API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check how many restaurants need geocoding
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await apiRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");

    if (restaurantId) {
      // Check specific restaurant
      const result = await GeocodingService.geocodeRestaurantById(restaurantId);
      return NextResponse.json({
        needsGeocoding: !result.success,
        error: result.error
      });
    }

    // For now, just return a placeholder response
    // In a real implementation, you'd query the database to count restaurants without coordinates
    return NextResponse.json({
      message: "Use POST to start geocoding process",
      available: true
    });

  } catch (error) {
    console.error("Geocoding status API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}