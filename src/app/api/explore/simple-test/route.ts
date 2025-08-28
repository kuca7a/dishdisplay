import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Simple test: Calling TheMealDB directly');
    
    // Test the simplest possible API call
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/filter.php?c=Chicken');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Raw TheMealDB response:', data);
    
    // Return just the first few meals for testing
    const meals = data.meals?.slice(0, 3) || [];
    
    return NextResponse.json({
      success: true,
      mealCount: data.meals?.length || 0,
      sampleMeals: meals.map((meal: { idMeal: string; strMeal: string; strMealThumb: string }) => ({
        id: meal.idMeal,
        name: meal.strMeal,
        image: meal.strMealThumb
      }))
    });
  } catch (error) {
    console.error('Simple test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
}
