#!/usr/bin/env node

/**
 * Direct geocoding script that doesn't rely on the API endpoint
 * This bypasses the need for a running dev server
 */

import { createClient } from '@supabase/supabase-js';

// Supabase config (from your .env.local)
const supabaseUrl = 'https://zzfgtqykhummyskdalrj.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6Zmd0cXlraHVtbXlza2RhbHJqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDY2MjE0MSwiZXhwIjoyMDcwMjM4MTQxfQ.td58NAm_gQFaSeajbQkeddvCoib-vVvcQTRGA_JjM8o';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Simple geocoding using OpenStreetMap Nominatim
async function geocodeAddress(address) {
  try {
    console.log(`🔍 Geocoding: ${address}`);
    
    const encodedAddress = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&q=${encodedAddress}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'DishDisplay-Restaurant-Map-Feature/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();
    
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

async function main() {
  console.log('🗺️  Starting direct restaurant geocoding...\n');

  try {
    // Get restaurants without coordinates
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('id, name, address, city, state, postal_code, country, latitude, longitude')
      .or('latitude.is.null,longitude.is.null')
      .not('address', 'is', null)
      .limit(5); // Start with 5 for testing

    if (error) {
      throw new Error(`Failed to fetch restaurants: ${error.message}`);
    }

    if (!restaurants || restaurants.length === 0) {
      console.log('ℹ️  No restaurants found that need geocoding.');
      
      // Let's check what restaurants exist
      const { data: allRestaurants } = await supabase
        .from('restaurants')
        .select('id, name, latitude, longitude')
        .limit(10);
        
      console.log('\n📊 Current restaurant status:');
      if (allRestaurants && allRestaurants.length > 0) {
        allRestaurants.forEach(r => {
          const hasCoords = r.latitude && r.longitude;
          console.log(`  ${hasCoords ? '✅' : '❌'} ${r.name} ${hasCoords ? `(${r.latitude}, ${r.longitude})` : '(no coordinates)'}`);
        });
      } else {
        console.log('  No restaurants found in database.');
      }
      return;
    }

    console.log(`Found ${restaurants.length} restaurants to geocode:\n`);

    let updated = 0;
    let errors = [];

    for (const restaurant of restaurants) {
      try {
        // Skip if already has coordinates
        if (restaurant.latitude && restaurant.longitude) {
          console.log(`⏭️  ${restaurant.name} - Already has coordinates`);
          continue;
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
          console.log(`❌ ${restaurant.name} - No address information`);
          continue;
        }

        const fullAddress = addressParts.join(', ');
        const geocodeResult = await geocodeAddress(fullAddress);

        if (!geocodeResult) {
          console.log(`❌ ${restaurant.name} - Could not geocode address`);
          errors.push(`${restaurant.name}: Could not geocode`);
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
          console.log(`❌ ${restaurant.name} - Database update failed`);
          errors.push(`${restaurant.name}: ${updateError.message}`);
          continue;
        }

        updated++;
        console.log(`✅ ${restaurant.name} - Updated: ${geocodeResult.latitude.toFixed(6)}, ${geocodeResult.longitude.toFixed(6)}`);
        
        // Rate limiting - wait 1 second between requests for Nominatim
        if (updated < restaurants.length) {
          console.log('   ⏳ Waiting 1 second (rate limiting)...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (restaurantError) {
        console.log(`❌ ${restaurant.name} - Error: ${restaurantError.message}`);
        errors.push(`${restaurant.name}: ${restaurantError.message}`);
      }
    }

    console.log('\n📊 Geocoding Results:');
    console.log(`✅ Updated: ${updated} restaurants`);
    console.log(`❌ Errors: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\n⚠️  Error Details:');
      errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (updated > 0) {
      console.log('\n🎉 Success! Your restaurants now have coordinates.');
      console.log('   Visit http://localhost:3000/discover to see them on the map!');
    }

  } catch (error) {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);