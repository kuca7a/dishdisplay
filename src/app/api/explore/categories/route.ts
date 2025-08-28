import { NextResponse } from 'next/server';
import ExploreService from '@/lib/explore-service';

export async function GET() {
  try {
    const categories = await ExploreService.fetchCategories();
    
    return NextResponse.json({
      categories: [
        { id: '0', name: 'All', description: 'All available menu items', image_url: '' },
        ...categories
      ]
    });
  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
