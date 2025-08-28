import { 
  TheMealDBResponse, 
  TheMealDBCategoriesResponse, 
  TheMealDBMeal,
  ExploreMenuItem,
  ExploreIngredient,
  CATEGORY_MAPPING,
  COMMON_ALLERGENS,
  DIFFICULTY_THRESHOLDS
} from '@/types/explore';

class TheMealDBService {
  private readonly baseUrl = 'https://www.themealdb.com/api/json/v1/1';
  private readonly apiKey = '1'; // Test API key
  
  // Cache for frequently accessed data
  private cache = new Map<string, unknown>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_DURATION = 1000 * 60 * 60; // 1 hour

  private getCachedData<T>(key: string): T | null {
    const expiry = this.cacheExpiry.get(key);
    if (expiry && Date.now() > expiry) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }
    return (this.cache.get(key) as T) || null;
  }

  private setCachedData<T>(key: string, data: T): void {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION);
  }

  private async fetchFromAPI<T>(endpoint: string): Promise<T> {
    const cacheKey = endpoint;
    const cached = this.getCachedData<T>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      if (!response.ok) {
        throw new Error(`TheMealDB API error: ${response.status}`);
      }
      const data = await response.json();
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('TheMealDB API fetch error:', error);
      throw error;
    }
  }

  // Search meals by name
  async searchMealsByName(name: string): Promise<ExploreMenuItem[]> {
    if (!name.trim()) return [];
    
    const response = await this.fetchFromAPI<TheMealDBResponse>(
      `/search.php?s=${encodeURIComponent(name)}`
    );
    
    if (!response.meals) return [];
    return response.meals.map(meal => this.transformMealToExploreItem(meal));
  }

  // Get random meals
  async getRandomMeals(count: number = 6): Promise<ExploreMenuItem[]> {
    const meals: ExploreMenuItem[] = [];
    
    // TheMealDB random endpoint only returns 1 meal, so we need multiple calls
    for (let i = 0; i < count; i++) {
      try {
        const response = await this.fetchFromAPI<TheMealDBResponse>('/random.php');
        if (response.meals && response.meals[0]) {
          meals.push(this.transformMealToExploreItem(response.meals[0]));
        }
      } catch (error) {
        console.error(`Failed to fetch random meal ${i + 1}:`, error);
      }
    }
    
    return meals;
  }

  // Get meals by category
  async getMealsByCategory(category: string): Promise<ExploreMenuItem[]> {
    const response = await this.fetchFromAPI<TheMealDBResponse>(
      `/filter.php?c=${encodeURIComponent(category)}`
    );
    
    if (!response.meals) return [];
    
    // Filter endpoint returns limited data, so we need to fetch full details
    const detailedMeals = await Promise.all(
      response.meals.slice(0, 12).map(async (meal) => {
        try {
          return await this.getMealById(meal.idMeal);
        } catch (error) {
          console.error(`Failed to fetch meal details for ${meal.idMeal}:`, error);
          return null;
        }
      })
    );
    
    return detailedMeals.filter(meal => meal !== null) as ExploreMenuItem[];
  }

  // Get meals by cuisine/area
  async getMealsByCuisine(area: string): Promise<ExploreMenuItem[]> {
    const response = await this.fetchFromAPI<TheMealDBResponse>(
      `/filter.php?a=${encodeURIComponent(area)}`
    );
    
    if (!response.meals) return [];
    
    // Get detailed data for first 12 meals
    const detailedMeals = await Promise.all(
      response.meals.slice(0, 12).map(async (meal) => {
        try {
          return await this.getMealById(meal.idMeal);
        } catch (error) {
          console.error(`Failed to fetch meal details for ${meal.idMeal}:`, error);
          return null;
        }
      })
    );
    
    return detailedMeals.filter(meal => meal !== null) as ExploreMenuItem[];
  }

  // Get meal by ID
  async getMealById(id: string): Promise<ExploreMenuItem | null> {
    const response = await this.fetchFromAPI<TheMealDBResponse>(
      `/lookup.php?i=${encodeURIComponent(id)}`
    );
    
    if (!response.meals || !response.meals[0]) return null;
    return this.transformMealToExploreItem(response.meals[0]);
  }

  // Get all categories
  async getCategories(): Promise<{ name: string; description: string; image: string }[]> {
    const response = await this.fetchFromAPI<TheMealDBCategoriesResponse>('/categories.php');
    
    return response.categories.map(cat => ({
      name: cat.strCategory,
      description: cat.strCategoryDescription,
      image: cat.strCategoryThumb
    }));
  }

  // Transform TheMealDB meal to our ExploreMenuItem format
  private transformMealToExploreItem(meal: TheMealDBMeal): ExploreMenuItem {
    const ingredients = this.extractIngredients(meal);
    const tags = this.extractTags(meal.strTags);
    const allergens = this.detectAllergens(ingredients);
    const dietaryTags = this.detectDietaryTags(meal.strCategory, ingredients);
    const difficulty = this.estimateDifficulty(meal.strInstructions, ingredients.length);
    const estimatedCalories = this.estimateCalories(ingredients, meal.strCategory);
    const estimatedPrice = this.estimatePrice(ingredients, meal.strArea, difficulty);
    const estimatedPrepTime = this.estimatePrepTime(meal.strInstructions, difficulty);

    return {
      id: meal.idMeal,
      name: meal.strMeal,
      description: this.createShortDescription(meal.strInstructions),
      instructions: meal.strInstructions,
      category: meal.strCategory,
      cuisine: meal.strArea,
      image_url: meal.strMealThumb,
      video_url: meal.strYoutube || undefined,
      ingredients,
      tags,
      estimated_price: estimatedPrice,
      estimated_calories: estimatedCalories,
      estimated_prep_time: estimatedPrepTime,
      popularity_score: this.calculatePopularityScore(meal.strCategory, meal.strArea),
      difficulty_level: difficulty,
      allergens,
      dietary_tags: dietaryTags,
      restaurant_description: this.generateRestaurantDescription(meal),
      suggested_menu_category: CATEGORY_MAPPING[meal.strCategory] || 'main'
    };
  }

  private extractIngredients(meal: TheMealDBMeal): ExploreIngredient[] {
    const ingredients: ExploreIngredient[] = [];
    
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}` as keyof TheMealDBMeal] as string;
      const measure = meal[`strMeasure${i}` as keyof TheMealDBMeal] as string;
      
      if (ingredient && ingredient.trim()) {
        ingredients.push({
          name: ingredient.trim(),
          measurement: measure ? measure.trim() : '',
          image_url: `https://www.themealdb.com/images/ingredients/${ingredient.replace(/\s+/g, '%20')}-medium.png`
        });
      }
    }
    
    return ingredients;
  }

  private extractTags(tagString?: string): string[] {
    if (!tagString) return [];
    return tagString.split(',').map(tag => tag.trim()).filter(Boolean);
  }

  private detectAllergens(ingredients: ExploreIngredient[]): string[] {
    const allergens = new Set<string>();
    const ingredientText = ingredients.map(i => i.name.toLowerCase()).join(' ');
    
    COMMON_ALLERGENS.forEach(allergen => {
      if (ingredientText.includes(allergen)) {
        allergens.add(allergen);
      }
    });
    
    return Array.from(allergens);
  }

  private detectDietaryTags(category: string, ingredients: ExploreIngredient[]): string[] {
    const dietaryTags = new Set<string>();
    
    // Check category-based tags
    if (category.toLowerCase().includes('vegan')) {
      dietaryTags.add('vegan');
    }
    if (category.toLowerCase().includes('vegetarian')) {
      dietaryTags.add('vegetarian');
    }
    
    // Check ingredient-based tags
    const ingredientText = ingredients.map(i => i.name.toLowerCase()).join(' ');
    const hasAnimalProducts = /meat|beef|chicken|pork|lamb|fish|seafood|shrimp|crab|lobster|salmon|tuna/.test(ingredientText);
    const hasDairy = /milk|cheese|butter|cream|yogurt/.test(ingredientText);
    const hasEggs = /egg/.test(ingredientText);
    
    if (!hasAnimalProducts && !hasDairy && !hasEggs) {
      dietaryTags.add('vegan');
    } else if (!hasAnimalProducts) {
      dietaryTags.add('vegetarian');
    }
    
    // Check for gluten-free (basic detection)
    const hasGluten = /wheat|flour|bread|pasta|noodle/.test(ingredientText);
    if (!hasGluten) {
      dietaryTags.add('gluten-free');
    }
    
    return Array.from(dietaryTags);
  }

  private estimateDifficulty(instructions: string, ingredientCount: number): 'Easy' | 'Medium' | 'Hard' {
    const instructionLength = instructions.length;
    
    if (ingredientCount <= DIFFICULTY_THRESHOLDS.easy.max_ingredients && 
        instructionLength <= DIFFICULTY_THRESHOLDS.easy.max_instructions) {
      return 'Easy';
    } else if (ingredientCount <= DIFFICULTY_THRESHOLDS.medium.max_ingredients && 
               instructionLength <= DIFFICULTY_THRESHOLDS.medium.max_instructions) {
      return 'Medium';
    } else {
      return 'Hard';
    }
  }

  private estimateCalories(ingredients: ExploreIngredient[], category: string): number {
    // Basic calorie estimation based on ingredient count and category
    const baseCalories = 200;
    
    // Category modifiers
    const categoryMultipliers: Record<string, number> = {
      'Dessert': 1.8,
      'Beef': 1.6,
      'Pork': 1.5,
      'Chicken': 1.2,
      'Seafood': 1.1,
      'Vegetarian': 0.8,
      'Vegan': 0.7,
      'Side': 0.6
    };
    
    const multiplier = categoryMultipliers[category] || 1.0;
    const ingredientBonus = ingredients.length * 25;
    
    return Math.round(baseCalories * multiplier + ingredientBonus);
  }

  private estimatePrice(ingredients: ExploreIngredient[], cuisine: string, difficulty: 'Easy' | 'Medium' | 'Hard'): number {
    const basePrice = 8.00; // Base price in USD
    
    // Cuisine multipliers
    const cuisineMultipliers: Record<string, number> = {
      'French': 1.5,
      'Italian': 1.2,
      'Japanese': 1.4,
      'American': 1.0,
      'Mexican': 0.9,
      'Indian': 0.8,
      'Thai': 1.1,
      'Chinese': 0.9
    };
    
    // Difficulty multipliers
    const difficultyMultipliers = {
      'Easy': 0.8,
      'Medium': 1.0,
      'Hard': 1.3
    };
    
    const cuisineMultiplier = cuisineMultipliers[cuisine] || 1.0;
    const difficultyMultiplier = difficultyMultipliers[difficulty as keyof typeof difficultyMultipliers];
    const ingredientMultiplier = 1 + (ingredients.length * 0.05);
    
    return Math.round((basePrice * cuisineMultiplier * difficultyMultiplier * ingredientMultiplier) * 100) / 100;
  }

  private estimatePrepTime(instructions: string, difficulty: 'Easy' | 'Medium' | 'Hard'): string {
    const baseTimes = {
      'Easy': 15,
      'Medium': 30,
      'Hard': 60
    };
    
    const baseTime = baseTimes[difficulty as keyof typeof baseTimes];
    const instructionWords = instructions.split(' ').length;
    const timeAdjustment = Math.floor(instructionWords / 50) * 5; // 5 min per 50 words
    
    const totalTime = baseTime + timeAdjustment;
    
    if (totalTime < 60) {
      return `${totalTime} mins`;
    } else {
      const hours = Math.floor(totalTime / 60);
      const mins = totalTime % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
  }

  private calculatePopularityScore(category: string, cuisine: string): number {
    // Popular categories and cuisines get higher scores
    const popularCategories = ['Chicken', 'Pasta', 'Dessert', 'Beef'];
    const popularCuisines = ['Italian', 'American', 'Mexican', 'Chinese'];
    
    let score = 50; // Base score
    
    if (popularCategories.includes(category)) score += 20;
    if (popularCuisines.includes(cuisine)) score += 15;
    
    // Add some randomness to simulate real popularity
    score += Math.floor(Math.random() * 20);
    
    return Math.min(100, Math.max(0, score));
  }

  private createShortDescription(instructions: string): string {
    // Create a short, appetizing description from the first part of instructions
    const sentences = instructions.split(/[.!?]+/);
    const firstSentence = sentences[0]?.trim();
    
    if (!firstSentence || firstSentence.length < 20) {
      return "A delicious dish prepared with carefully selected ingredients and traditional cooking methods.";
    }
    
    // Take first sentence and make it more restaurant-friendly
    return firstSentence.charAt(0).toUpperCase() + firstSentence.slice(1) + '.';
  }

  private generateRestaurantDescription(meal: TheMealDBMeal): string {
    const ingredients = this.extractIngredients(meal);
    const keyIngredients = ingredients.slice(0, 3).map(i => i.name).join(', ');
    
    const templates = [
      `Our signature ${meal.strMeal} features ${keyIngredients}, expertly prepared in authentic ${meal.strArea} style.`,
      `A delightful ${meal.strArea} creation combining ${keyIngredients} for an unforgettable dining experience.`,
      `Traditional ${meal.strMeal} crafted with premium ${keyIngredients} and served with care.`,
      `Experience the authentic taste of ${meal.strArea} cuisine with our carefully prepared ${meal.strMeal}.`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }
}

export const mealDBService = new TheMealDBService();
