// Types for Menu Explore Feature using TheMealDB API

export interface TheMealDBMeal {
  idMeal: string;
  strMeal: string;
  strMealAlternate?: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags?: string;
  strYoutube?: string;
  strIngredient1?: string;
  strIngredient2?: string;
  strIngredient3?: string;
  strIngredient4?: string;
  strIngredient5?: string;
  strIngredient6?: string;
  strIngredient7?: string;
  strIngredient8?: string;
  strIngredient9?: string;
  strIngredient10?: string;
  strIngredient11?: string;
  strIngredient12?: string;
  strIngredient13?: string;
  strIngredient14?: string;
  strIngredient15?: string;
  strIngredient16?: string;
  strIngredient17?: string;
  strIngredient18?: string;
  strIngredient19?: string;
  strIngredient20?: string;
  strMeasure1?: string;
  strMeasure2?: string;
  strMeasure3?: string;
  strMeasure4?: string;
  strMeasure5?: string;
  strMeasure6?: string;
  strMeasure7?: string;
  strMeasure8?: string;
  strMeasure9?: string;
  strMeasure10?: string;
  strMeasure11?: string;
  strMeasure12?: string;
  strMeasure13?: string;
  strMeasure14?: string;
  strMeasure15?: string;
  strMeasure16?: string;
  strMeasure17?: string;
  strMeasure18?: string;
  strMeasure19?: string;
  strMeasure20?: string;
  strSource?: string;
  strImageSource?: string;
  strCreativeCommonsConfirmed?: string;
  dateModified?: string;
}

export interface TheMealDBResponse {
  meals: TheMealDBMeal[] | null;
}

export interface TheMealDBCategory {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
}

export interface TheMealDBCategoriesResponse {
  categories: TheMealDBCategory[];
}

export interface ExploreIngredient {
  name: string;
  measurement: string;
  image_url?: string;
}

export interface ExploreMenuItem {
  // Core meal data from TheMealDB
  id: string;
  name: string;
  description: string;
  instructions: string;
  category: string;
  cuisine: string;
  image_url: string;
  video_url?: string;
  ingredients: ExploreIngredient[];
  tags: string[];
  
  // Estimated/calculated data for restaurant use
  estimated_price: number;
  estimated_calories: number;
  estimated_prep_time: string;
  popularity_score: number;
  difficulty_level: 'Easy' | 'Medium' | 'Hard';
  
  // Dietary information
  allergens: string[];
  dietary_tags: string[]; // vegan, vegetarian, gluten-free, etc.
  
  // Restaurant adaptation helpers
  restaurant_description: string; // AI-generated restaurant-style description
  suggested_menu_category: 'appetizer' | 'main' | 'dessert' | 'drink';
}

export interface ExploreSearchFilters {
  query?: string;
  category?: string;
  cuisine?: string;
  dietary_tags?: string[];
  max_calories?: number;
  max_price?: number;
  difficulty_level?: string;
  prep_time?: string;
}

export interface ExploreSearchResponse {
  items: ExploreMenuItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ExploreCategory {
  id: string;
  name: string;
  description: string;
  image_url: string;
  count?: number;
}

// Price estimation factors
export interface PriceEstimationFactors {
  base_cost: number;
  ingredient_multiplier: number;
  cuisine_multiplier: number;
  difficulty_multiplier: number;
  portion_size_multiplier: number;
}

// Mapping TheMealDB categories to our menu categories
export const CATEGORY_MAPPING: Record<string, 'appetizer' | 'main' | 'dessert' | 'drink'> = {
  'Starter': 'appetizer',
  'Side': 'appetizer',
  'Beef': 'main',
  'Chicken': 'main',
  'Lamb': 'main',
  'Pork': 'main',
  'Seafood': 'main',
  'Pasta': 'main',
  'Vegan': 'main',
  'Vegetarian': 'main',
  'Breakfast': 'main',
  'Goat': 'main',
  'Miscellaneous': 'main',
  'Dessert': 'dessert'
};

// Common allergens to detect in ingredients
export const COMMON_ALLERGENS = [
  'milk', 'dairy', 'cheese', 'butter', 'cream',
  'egg', 'eggs',
  'wheat', 'flour', 'gluten',
  'soy', 'soya',
  'nuts', 'almonds', 'walnuts', 'peanuts',
  'fish', 'salmon', 'tuna',
  'shellfish', 'shrimp', 'crab', 'lobster',
  'sesame'
];

// Difficulty estimation based on instruction length and ingredient count
export const DIFFICULTY_THRESHOLDS = {
  easy: { max_ingredients: 8, max_instructions: 300 },
  medium: { max_ingredients: 12, max_instructions: 600 },
  hard: { max_ingredients: Infinity, max_instructions: Infinity }
};
