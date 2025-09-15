import { getServerSupabaseClient } from "@/lib/supabase-server";

// Simple geocoding service using a free API (OpenStreetMap Nominatim)
// This is free but has rate limits - for production, consider Google Geocoding API

interface GeocodeResult {
  latitude: number;
  longitude: number;
  display_name: string;
}

interface GeocodeResponse {
  lat: string;
  lon: string;
  display_name: string;
}

interface Restaurant {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
}

export class GeocodingService {
  private static readonly NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';
  
  // Rate limiting - simple implementation
  private static lastRequest = 0;
  private static readonly MIN_INTERVAL = 1000; // 1 second between requests for Nominatim

  static async geocodeAddress(address: string): Promise<GeocodeResult | null> {
    try {
      // Respect rate limiting
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequest;
      if (timeSinceLastRequest < this.MIN_INTERVAL) {
        await new Promise(resolve => setTimeout(resolve, this.MIN_INTERVAL - timeSinceLastRequest));
      }
      this.lastRequest = Date.now();

      const encodedAddress = encodeURIComponent(address);
      const url = `${this.NOMINATIM_BASE_URL}?format=json&addressdetails=1&limit=1&q=${encodedAddress}`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'DishDisplay-Restaurant-Map-Feature/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const data: GeocodeResponse[] = await response.json();
      
      if (data.length === 0) {
        return null;
      }

      const result = data[0];
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        display_name: result.display_name
      };

    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  static async geocodeRestaurants(limit: number = 10): Promise<{
    processed: number;
    updated: number;
    errors: string[];
  }> {
    const supabase = getServerSupabaseClient();
    const errors: string[] = [];
    let processed = 0;
    let updated = 0;

    try {
      // Get restaurants that don't have coordinates but have address information
      const { data: restaurants, error: fetchError } = await supabase
        .from('restaurants')
        .select('id, name, address, city, state, postal_code, country')
        .is('latitude', null)
        .is('longitude', null)
        .not('address', 'is', null)
        .limit(limit);

      if (fetchError) {
        throw new Error(`Failed to fetch restaurants: ${fetchError.message}`);
      }

      if (!restaurants || restaurants.length === 0) {
        return { processed: 0, updated: 0, errors: ['No restaurants found that need geocoding'] };
      }

      console.log(`Found ${restaurants.length} restaurants to geocode`);

      for (const restaurant of restaurants as Restaurant[]) {
        processed++;
        
        try {
          // Build address string
          const addressParts = [
            restaurant.address,
            restaurant.city,
            restaurant.state,
            restaurant.postal_code,
            restaurant.country
          ].filter(Boolean);

          if (addressParts.length === 0) {
            errors.push(`Restaurant ${restaurant.name} (${restaurant.id}): No address information`);
            continue;
          }

          const fullAddress = addressParts.join(', ');
          console.log(`Geocoding: ${restaurant.name} - ${fullAddress}`);

          const geocodeResult = await this.geocodeAddress(fullAddress);

          if (!geocodeResult) {
            errors.push(`Restaurant ${restaurant.name} (${restaurant.id}): Could not geocode address: ${fullAddress}`);
            continue;
          }

          // Update restaurant with coordinates
          const { error: updateError } = await supabase
            .from('restaurants')
            .update({
              latitude: geocodeResult.latitude,
              longitude: geocodeResult.longitude
            })
            .eq('id', restaurant.id);

          if (updateError) {
            errors.push(`Restaurant ${restaurant.name} (${restaurant.id}): Database update failed: ${updateError.message}`);
            continue;
          }

          updated++;
          console.log(`✓ Updated ${restaurant.name}: ${geocodeResult.latitude}, ${geocodeResult.longitude}`);

        } catch (restaurantError) {
          const errorMsg = `Restaurant ${restaurant.name} (${restaurant.id}): ${restaurantError instanceof Error ? restaurantError.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      return { processed, updated, errors };

    } catch (error) {
      const errorMsg = `Geocoding service error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      errors.push(errorMsg);
      return { processed, updated, errors };
    }
  }

  static async geocodeRestaurantById(restaurantId: string): Promise<{
    success: boolean;
    coordinates?: { latitude: number; longitude: number };
    error?: string;
  }> {
    const supabase = getServerSupabaseClient();

    try {
      // Get the restaurant
      const { data: restaurant, error: fetchError } = await supabase
        .from('restaurants')
        .select('id, name, address, city, state, postal_code, country')
        .eq('id', restaurantId)
        .single();

      if (fetchError || !restaurant) {
        return { success: false, error: 'Restaurant not found' };
      }

      // Build address string
      const addressParts = [
        restaurant.address,
        restaurant.city,
        restaurant.state,
        restaurant.postal_code,
        restaurant.country
      ].filter(Boolean);

      if (addressParts.length === 0) {
        return { success: false, error: 'No address information available' };
      }

      const fullAddress = addressParts.join(', ');
      const geocodeResult = await this.geocodeAddress(fullAddress);

      if (!geocodeResult) {
        return { success: false, error: 'Could not geocode the address' };
      }

      // Update restaurant with coordinates
      const { error: updateError } = await supabase
        .from('restaurants')
        .update({
          latitude: geocodeResult.latitude,
          longitude: geocodeResult.longitude
        })
        .eq('id', restaurantId);

      if (updateError) {
        return { success: false, error: `Database update failed: ${updateError.message}` };
      }

      return { 
        success: true, 
        coordinates: { 
          latitude: geocodeResult.latitude, 
          longitude: geocodeResult.longitude 
        }
      };

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

export default GeocodingService;