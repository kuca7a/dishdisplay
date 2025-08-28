// Simple test to check if the API is working
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Test API called');
    
    // Test direct TheMealDB call
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/filter.php?c=Chicken');
    const data = await response.json();
    
    console.log('TheMealDB response:', data?.meals?.length || 0, 'meals');
    
    return NextResponse.json({
      status: 'working',
      mealCount: data?.meals?.length || 0,
      firstMeal: data?.meals?.[0] || null
    });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
