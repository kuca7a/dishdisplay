import { NextRequest, NextResponse } from 'next/server';
import ExploreService from '@/lib/explore-service';
import { ExploreSearchFilters } from '@/types/explore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const filters: ExploreSearchFilters = {
      query: searchParams.get('search') || searchParams.get('query') || undefined,
      category: searchParams.get('category') || undefined,
      cuisine: searchParams.get('cuisine') || undefined,
      dietary_tags: searchParams.get('dietary') ? searchParams.get('dietary')!.split(',') : undefined,
      max_calories: searchParams.get('maxCalories') ? parseInt(searchParams.get('maxCalories')!) : undefined,
      max_price: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
      difficulty_level: searchParams.get('difficulty') || undefined,
      prep_time: searchParams.get('prepTime') || undefined
    };
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    
    // Fetch meals using the service
    const result = await ExploreService.fetchMeals(filters, page, limit);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in explore API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch explore items' },
      { status: 500 }
    );
  }
}
