import { 
  TheMealDBMeal, 
  TheMealDBResponse, 
  TheMealDBCategoriesResponse, 
  TheMealDBCategory,
  ExploreMenuItem, 
  ExploreSearchResponse, 
  ExploreSearchFilters, 
  ExploreIngredient,
  ExploreCategory,
  CATEGORY_MAPPING,
  DIFFICULTY_THRESHOLDS
} from '@/types/explore';

const MEALDB_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

export class ExploreService {
  
  // Transform TheMealDB meal to our ExploreMenuItem format
  private static transformMealToExploreItem(meal: TheMealDBMeal): ExploreMenuItem {
    // Extract ingredients and measurements
    const ingredients: ExploreIngredient[] = [];
    
    // Check if this meal has ingredient data (from search/lookup endpoints)
    if (meal.strIngredient1) {
      for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}` as keyof TheMealDBMeal] as string;
        const measurement = meal[`strMeasure${i}` as keyof TheMealDBMeal] as string;
        
        if (ingredient && ingredient.trim()) {
          ingredients.push({
            name: ingredient.trim(),
            measurement: measurement?.trim() || '',
            image_url: `https://www.themealdb.com/images/ingredients/${ingredient.trim().replace(/\s+/g, '%20')}-Small.png`
          });
        }
      }
    } else {
      // No ingredient data from category endpoints, create placeholder based on category
      const categoryIngredients: Record<string, string[]> = {
        'Chicken': ['Chicken breast', 'Onion', 'Garlic'],
        'Beef': ['Beef', 'Onion', 'Carrots'],
        'Seafood': ['Fish', 'Lemon', 'Herbs'],
        'Vegetarian': ['Vegetables', 'Herbs', 'Spices'],
        'Pasta': ['Pasta', 'Tomatoes', 'Herbs'],
        'Dessert': ['Sugar', 'Flour', 'Butter']
      };
      
      const defaultIngredients = categoryIngredients[meal.strCategory || 'Chicken'] || ['Fresh ingredients', 'Seasonings', 'Herbs'];
      defaultIngredients.forEach(ingredient => {
        ingredients.push({
          name: ingredient,
          measurement: '',
          image_url: `https://www.themealdb.com/images/ingredients/${ingredient.replace(/\s+/g, '%20')}-Small.png`
        });
      });
    }

    // Extract tags
    const tags = meal.strTags ? meal.strTags.split(',').map((tag: string) => tag.trim()) : [];
    
    // Estimate calories based on ingredients count and category
    const estimatedCalories = this.estimateCalories(meal.strCategory || 'Main', ingredients.length);
    
    // Estimate price based on ingredients and category
    const estimatedPrice = this.estimatePrice(meal.strCategory || 'Main', ingredients.length);
    
    // Estimate prep time
    const estimatedPrepTime = this.estimatePrepTime(meal.strCategory || 'Main', ingredients.length);
    
    // Calculate popularity score (placeholder algorithm)
    const popularityScore = Math.floor(Math.random() * 100) + 1;
    
    // Determine difficulty level
    const difficultyLevel = this.getDifficultyLevel(meal.strInstructions, ingredients.length);
    
    // Determine dietary tags
    const dietaryTags = this.getDietaryTags(meal.strCategory || 'Main', ingredients);

    // Generate restaurant-style description
    const restaurantDescription = this.generateRestaurantDescription(meal.strMeal, meal.strCategory, ingredients);

    // Map to suggested menu category
    const suggestedMenuCategory = CATEGORY_MAPPING[meal.strCategory || 'Main'] || 'main';

    return {
      id: meal.idMeal,
      name: meal.strMeal,
      description: meal.strInstructions ? meal.strInstructions.substring(0, 200) + '...' : 'Delicious recipe from our curated collection.',
      instructions: meal.strInstructions || 'Recipe instructions will be available when you view the full details.',
      category: meal.strCategory || 'Specialty',
      cuisine: meal.strArea || 'International',
      image_url: meal.strMealThumb,
      video_url: meal.strYoutube,
      ingredients,
      tags,
      estimated_price: estimatedPrice,
      estimated_calories: estimatedCalories,
      estimated_prep_time: estimatedPrepTime,
      popularity_score: popularityScore,
      difficulty_level: difficultyLevel,
      allergens: [], // TODO: Implement allergen detection
      dietary_tags: dietaryTags,
      restaurant_description: restaurantDescription,
      suggested_menu_category: suggestedMenuCategory
    };
  }

  // Estimate calories based on category and ingredients
  private static estimateCalories(category: string, ingredientCount: number): number {
    const baseCalories: Record<string, number> = {
      'Dessert': 450,
      'Breakfast': 300,
      'Starter': 200,
      'Side': 150,
      'Main': 400,
      'Beef': 500,
      'Chicken': 350,
      'Seafood': 300,
      'Vegetarian': 250,
      'Vegan': 200,
      'Pasta': 400
    };
    
    const base = baseCalories[category] || 350;
    const ingredientMultiplier = Math.max(0.5, ingredientCount / 10);
    return Math.round(base * ingredientMultiplier);
  }

  // Estimate price based on category and ingredients
  private static estimatePrice(category: string, ingredientCount: number): number {
    const basePrices: Record<string, number> = {
      'Dessert': 8,
      'Breakfast': 12,
      'Starter': 9,
      'Side': 6,
      'Main': 18,
      'Beef': 22,
      'Chicken': 16,
      'Seafood': 24,
      'Vegetarian': 14,
      'Vegan': 13,
      'Pasta': 15
    };
    
    const base = basePrices[category] || 15;
    const ingredientMultiplier = Math.max(0.7, ingredientCount / 8);
    return Math.round(base * ingredientMultiplier * 100) / 100; // Round to 2 decimal places
  }

  // Estimate prep time
  private static estimatePrepTime(category: string, ingredientCount: number): string {
    const baseTimes: Record<string, number> = {
      'Dessert': 45,
      'Breakfast': 15,
      'Starter': 20,
      'Side': 15,
      'Main': 30,
      'Beef': 40,
      'Chicken': 30,
      'Seafood': 25,
      'Vegetarian': 25,
      'Vegan': 25,
      'Pasta': 25
    };
    
    const base = baseTimes[category] || 25;
    const ingredientTime = ingredientCount * 2;
    const total = base + ingredientTime;
    
    return `${total} min`;
  }

  // Determine difficulty level
  private static getDifficultyLevel(instructions: string | undefined, ingredientCount: number): 'Easy' | 'Medium' | 'Hard' {
    const instructionLength = instructions?.length || 0;
    
    if (ingredientCount <= DIFFICULTY_THRESHOLDS.easy.max_ingredients && 
        instructionLength <= DIFFICULTY_THRESHOLDS.easy.max_instructions) {
      return 'Easy';
    } else if (ingredientCount <= DIFFICULTY_THRESHOLDS.medium.max_ingredients && 
               instructionLength <= DIFFICULTY_THRESHOLDS.medium.max_instructions) {
      return 'Medium';
    }
    return 'Hard';
  }

  // Generate restaurant-style description
  private static generateRestaurantDescription(name: string, category: string | undefined, ingredients: ExploreIngredient[]): string {
    const mainIngredients = ingredients.slice(0, 3).map(ing => ing.name).join(', ');
    const safeCategory = category || 'specialty';
    const descriptions = [
      `Our signature ${name.toLowerCase()} features ${mainIngredients}, expertly prepared to perfection.`,
      `A delicious ${safeCategory.toLowerCase()} dish showcasing ${mainIngredients} with authentic flavors.`,
      `Indulge in our ${name.toLowerCase()}, a carefully crafted ${safeCategory.toLowerCase()} made with ${mainIngredients}.`,
      `Experience the perfect blend of ${mainIngredients} in this exceptional ${safeCategory.toLowerCase()} creation.`
    ];
    
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  // Determine dietary tags
  private static getDietaryTags(category: string | undefined, ingredients: ExploreIngredient[]): string[] {
    const dietaryTags: string[] = [];
    
    if (category === 'Vegan') dietaryTags.push('Vegan', 'Plant-Based');
    if (category === 'Vegetarian') dietaryTags.push('Vegetarian');
    if (category === 'Seafood') dietaryTags.push('Pescatarian');
    
    // Check for common allergens in ingredients
    const ingredientNames = ingredients.map(ing => ing.name.toLowerCase());
    
    if (!ingredientNames.some(name => 
      name.includes('dairy') || name.includes('milk') || name.includes('cheese') || 
      name.includes('butter') || name.includes('cream')
    )) {
      dietaryTags.push('Dairy-Free');
    }
    
    if (!ingredientNames.some(name => 
      name.includes('gluten') || name.includes('flour') || name.includes('wheat') || 
      name.includes('bread')
    )) {
      dietaryTags.push('Gluten-Free');
    }
    
    return [...new Set(dietaryTags)]; // Remove duplicates
  }

  // Fetch meals from multiple endpoints to get variety
  static async fetchMeals(filters: ExploreSearchFilters = {}, page = 1, limit = 12): Promise<ExploreSearchResponse> {
    try {
      let apiUrl: string;
      let isRandomMode = false;
      
      // If there's a search query, use search endpoint
      if (filters.query) {
        apiUrl = `${MEALDB_BASE_URL}/search.php?s=${encodeURIComponent(filters.query)}`;
      } 
      // If there's a category filter, use category endpoint
      else if (filters.category && filters.category !== 'All') {
        apiUrl = `${MEALDB_BASE_URL}/filter.php?c=${encodeURIComponent(filters.category)}`;
      }
      // Default: get random meals from multiple categories
      else {
        isRandomMode = true;
        // We'll handle this differently below
      }
      
      let allMeals: TheMealDBMeal[] = [];
      
      if (isRandomMode) {
        // Get random meals from multiple popular categories
        const popularCategories = ['Chicken', 'Beef', 'Seafood', 'Vegetarian', 'Pasta', 'Dessert'];
        
        const promises = popularCategories.map(async (category) => {
          const url = `${MEALDB_BASE_URL}/filter.php?c=${category}`;
          try {
            const response = await fetch(url);
            if (!response.ok) {
              return null;
            }
            const data = await response.json();
            return data;
          } catch {
            return null;
          }
        });
        
        const responses = await Promise.all(promises);
        
        // Combine all meals from different categories
        responses.forEach((response: TheMealDBResponse | null, index: number) => {
          const category = popularCategories[index];
          if (response && response.meals) {
            // Add category information to each meal since the API doesn't include it
            const mealsWithCategory = response.meals.map(meal => ({
              ...meal,
              strCategory: category, // Add missing category
              strArea: 'International', // Default cuisine since it's not available from category endpoint
              strInstructions: '', // Will be handled with fallback
              strTags: undefined // Will be handled with fallback
            }));
            allMeals = allMeals.concat(mealsWithCategory);
          }
        });
        
        // Remove duplicates and shuffle for randomness
        const uniqueMeals = allMeals.filter((meal, index, self) => 
          index === self.findIndex(m => m.idMeal === meal.idMeal)
        );
        
        // Shuffle the array for random results
        for (let i = uniqueMeals.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [uniqueMeals[i], uniqueMeals[j]] = [uniqueMeals[j], uniqueMeals[i]];
        }
        
        allMeals = uniqueMeals;
      } else {
        // Single API call for search or category filter
        const response = await fetch(apiUrl!);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.meals) {
          return {
            items: [],
            total: 0,
            page,
            limit,
            hasMore: false
          };
        }
        
        allMeals = data.meals;
      }
      
      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedMeals = allMeals.slice(startIndex, endIndex);
      
      // Convert to our format
      const exploreItems = paginatedMeals.map((meal: TheMealDBMeal) => {
        return this.transformMealToExploreItem(meal);
      });
      
      const result = {
        items: exploreItems,
        total: allMeals.length,
        page,
        limit,
        hasMore: endIndex < allMeals.length
      };
      
      return result;
      
    } catch (error) {
      console.error('Error fetching meals:', error);
      return {
        items: [],
        total: 0,
        page,
        limit,
        hasMore: false
      };
    }
  }

  // Fetch categories
  static async fetchCategories(): Promise<ExploreCategory[]> {
    try {
      const response = await fetch(`${MEALDB_BASE_URL}/categories.php`);
      const data: TheMealDBCategoriesResponse = await response.json();
      
      return data.categories.map((category: TheMealDBCategory) => ({
        id: category.idCategory,
        name: category.strCategory,
        description: category.strCategoryDescription.substring(0, 100) + '...',
        image_url: category.strCategoryThumb
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // Fetch meal by ID with full details
  static async fetchMealById(id: string): Promise<ExploreMenuItem | null> {
    try {
      const response = await fetch(`${MEALDB_BASE_URL}/lookup.php?i=${id}`);
      const data: TheMealDBResponse = await response.json();
      
      if (data.meals && data.meals.length > 0) {
        return this.transformMealToExploreItem(data.meals[0]);
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching meal by ID:', error);
      return null;
    }
  }
}

export default ExploreService;
