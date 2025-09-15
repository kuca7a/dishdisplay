/**
 * Geocoding Utility Script
 * 
 * This script can be run to geocode restaurants that don't have coordinates yet.
 * It uses the free OpenStreetMap Nominatim API with proper rate limiting.
 * 
 * Usage:
 * 1. Run this script from the project root: node scripts/geocode-restaurants.js
 * 2. Or trigger via API: POST /api/geocode
 * 
 * The script will:
 * - Find restaurants that have addresses but no lat/lng coordinates
 * - Geocode them using OpenStreetMap Nominatim API (free, but rate-limited)
 * - Update the database with the coordinates
 */

const BATCH_SIZE = 10; // Process 10 restaurants at a time to respect rate limits

async function geocodeRestaurants() {
  try {
    console.log('🗺️  Starting restaurant geocoding...');
    
    const response = await fetch('http://localhost:3000/api/geocode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        limit: BATCH_SIZE
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('✅ Geocoding completed!');
    console.log(`📊 Results: ${result.updated}/${result.processed} restaurants updated`);
    
    if (result.errors && result.errors.length > 0) {
      console.log('\n❌ Errors:');
      result.errors.forEach(error => console.log(`   - ${error}`));
    }

    console.log('\n📍 Geocoded restaurants are now discoverable on the map!');

  } catch (error) {
    console.error('❌ Geocoding failed:', error);
    process.exit(1);
  }
}

// Run the script if called directly
if (require.main === module) {
  geocodeRestaurants();
}

module.exports = { geocodeRestaurants };