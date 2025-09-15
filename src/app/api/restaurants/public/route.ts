import { NextRequest, NextResponse } from "next/server";
import { getServerSupabaseClient } from "@/lib/supabase-server";
import { apiRateLimit } from "@/lib/rate-limit";

// Type for restaurant data from database
interface RestaurantData {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
  phone: string | null;
  website: string | null;
  business_type: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  primary_color: string | null;
  monday_hours: string | null;
  tuesday_hours: string | null;
  wednesday_hours: string | null;
  thursday_hours: string | null;
  friday_hours: string | null;
  saturday_hours: string | null;
  sunday_hours: string | null;
  timezone: string | null;
}

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await apiRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    console.log("API: Getting public restaurants with location data");

    const supabase = getServerSupabaseClient();

    // Get all restaurants that have location data (latitude and longitude)
    const { data: restaurants, error } = await supabase
      .from("restaurants")
      .select(`
        id,
        name,
        description,
        address,
        city,
        state,
        postal_code,
        country,
        latitude,
        longitude,
        phone,
        website,
        business_type,
        logo_url,
        cover_image_url,
        primary_color,
        monday_hours,
        tuesday_hours,
        wednesday_hours,
        thursday_hours,
        friday_hours,
        saturday_hours,
        sunday_hours,
        timezone
      `)
      .not("latitude", "is", null)
      .not("longitude", "is", null)
      .order("name") as { data: RestaurantData[] | null, error: Error | null };

    if (error) {
      console.error("API: Error fetching public restaurants:", error);
      return NextResponse.json(
        {
          error: "Failed to fetch restaurants",
          details: error.message,
        },
        { status: 500 }
      );
    }

    if (!restaurants) {
      return NextResponse.json({
        restaurants: [],
        total: 0,
        timestamp: new Date().toISOString()
      });
    }

    // Transform the data to include computed fields and menu summary
    const transformedRestaurants = await Promise.all(restaurants.map(async (restaurant) => {
      // Get a few popular menu items for the restaurant
      const { data: menuItems } = await supabase
        .from("menu_items")
        .select("name, price, category")
        .eq("restaurant_id", restaurant.id)
        .limit(3)
        .order("price", { ascending: true }); // Get cheaper items first for better appeal

      return {
        ...restaurant,
        // Create full address string
        full_address: [
          restaurant.address,
          restaurant.city,
          restaurant.state,
          restaurant.postal_code,
          restaurant.country
        ].filter(Boolean).join(", "),
        
        // Create menu URL
        menu_url: `/menu/${restaurant.id}`,
        
        // Determine if currently open (simplified - could be enhanced)
        is_open: getCurrentOpenStatus(restaurant),
        
        // Create Google Maps URL for directions
        maps_url: createGoogleMapsUrl(
          restaurant.latitude as number, 
          restaurant.longitude as number, 
          restaurant.name
        ),
        
        // Add menu summary
        menu_preview: menuItems?.slice(0, 3).map(item => ({
          name: item.name,
          price: item.price,
          category: item.category || 'main'
        })) || []
      };
    }));

    console.log(`API: Found ${transformedRestaurants.length} restaurants with location data`);

    return NextResponse.json({
      restaurants: transformedRestaurants,
      total: transformedRestaurants.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("API: Server error in public restaurants:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Helper function to determine if restaurant is currently open
function getCurrentOpenStatus(restaurant: RestaurantData): boolean {
  // This is a simplified version - in production you'd want proper timezone handling
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayHours = restaurant[`${dayNames[dayOfWeek]}_hours` as keyof RestaurantData];
  
  if (!todayHours || typeof todayHours === 'string' && todayHours.toLowerCase().includes('closed')) {
    return false;
  }
  
  // For now, just return true if they have hours - could be enhanced with actual time checking
  return true;
}

// Helper function to create Google Maps URL
function createGoogleMapsUrl(latitude: number, longitude: number, name: string): string {
  const query = encodeURIComponent(`${name}, ${latitude}, ${longitude}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}