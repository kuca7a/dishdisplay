/**
 * Cache Management System for DishDisplay
 *
 * Implements session storage caching with TTL (Time To Live) support
 * to reduce API calls and improve performance.
 */

import { Restaurant, MenuItem } from "@/types/database";

// Cache configuration
const CACHE_CONFIG = {
  // Cache keys
  KEYS: {
    RESTAURANT_BY_EMAIL: "restaurant_by_email",
    RESTAURANT_BY_ID: "restaurant_by_id",
    MENU_ITEMS: "menu_items",
    USER_RESTAURANT_DATA: "user_restaurant_data",
  },
  // Default TTL in milliseconds (5 minutes)
  DEFAULT_TTL: 5 * 60 * 1000,
  // TTL for different data types
  TTL: {
    RESTAURANT: 10 * 60 * 1000, // 10 minutes - restaurant data changes less frequently
    MENU_ITEMS: 5 * 60 * 1000, // 5 minutes - menu items may change more often
    USER_DATA: 15 * 60 * 1000, // 15 minutes - user profile data
  },
};

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  invalidations: number;
}

class CacheManager {
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    invalidations: 0,
  };

  private isClient(): boolean {
    return (
      typeof window !== "undefined" && typeof sessionStorage !== "undefined"
    );
  }

  /**
   * Generate a cache key with prefix
   */
  private generateKey(type: string, identifier: string): string {
    return `dishdisplay_${type}_${identifier}`;
  }

  /**
   * Check if cached data is still valid
   */
  private isValid<T>(item: CacheItem<T>): boolean {
    return Date.now() - item.timestamp < item.ttl;
  }

  /**
   * Get data from cache
   */
  get<T>(type: string, identifier: string): T | null {
    if (!this.isClient()) return null;

    try {
      const key = this.generateKey(type, identifier);
      const cached = sessionStorage.getItem(key);

      if (!cached) {
        this.stats.misses++;
        return null;
      }

      const item: CacheItem<T> = JSON.parse(cached);

      if (!this.isValid(item)) {
        // Remove expired item
        sessionStorage.removeItem(key);
        this.stats.misses++;
        return null;
      }

      this.stats.hits++;
      return item.data;
    } catch {
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Set data in cache
   */
  set<T>(type: string, identifier: string, data: T, customTTL?: number): void {
    if (!this.isClient()) return;

    try {
      const key = this.generateKey(type, identifier);
      const ttl =
        customTTL ||
        CACHE_CONFIG.TTL[type as keyof typeof CACHE_CONFIG.TTL] ||
        CACHE_CONFIG.DEFAULT_TTL;

      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      };

      sessionStorage.setItem(key, JSON.stringify(item));
      this.stats.sets++;
    } catch {
      // Silently handle cache errors
    }
  }

  /**
   * Remove specific item from cache
   */
  invalidate(type: string, identifier: string): void {
    if (!this.isClient()) return;

    try {
      const key = this.generateKey(type, identifier);
      sessionStorage.removeItem(key);
      this.stats.invalidations++;
    } catch {
      // Silently handle cache errors
    }
  }

  /**
   * Clear all cache entries for a specific type
   */
  invalidateType(type: string): void {
    if (!this.isClient()) return;

    try {
      const prefix = `dishdisplay_${type}_`;
      const keysToRemove: string[] = [];

      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => sessionStorage.removeItem(key));
      this.stats.invalidations += keysToRemove.length;
    } catch {
      // Silently handle cache errors
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    if (!this.isClient()) return;

    try {
      const keysToRemove: string[] = [];

      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith("dishdisplay_")) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => sessionStorage.removeItem(key));
      this.stats.invalidations += keysToRemove.length;
    } catch {
      // Silently handle cache errors
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats & { hitRate: number } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100,
    };
  }

  /**
   * Clean expired entries
   */
  cleanup(): void {
    if (!this.isClient()) return;

    try {
      const keysToRemove: string[] = [];

      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith("dishdisplay_")) {
          try {
            const cached = sessionStorage.getItem(key);
            if (cached) {
              const item: CacheItem<unknown> = JSON.parse(cached);
              if (!this.isValid(item)) {
                keysToRemove.push(key);
              }
            }
          } catch {
            // Invalid JSON, remove it
            keysToRemove.push(key);
          }
        }
      }

      keysToRemove.forEach((key) => sessionStorage.removeItem(key));
    } catch {
      // Silently handle cache errors
    }
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();

// Cache-aware data fetching functions
export const cachedDataService = {
  /**
   * Get restaurant by owner email with caching
   */
  async getRestaurantByOwnerEmail(
    email: string,
    forceFresh = false
  ): Promise<Restaurant | null> {
    const cacheKey = CACHE_CONFIG.KEYS.RESTAURANT_BY_EMAIL;

    if (!forceFresh) {
      const cached = cacheManager.get<Restaurant>(cacheKey, email);
      if (cached) return cached;
    }

    // Import here to avoid circular dependency
    const { restaurantService } = await import("@/lib/database");
    const restaurant = await restaurantService.getByOwnerEmail(email);

    if (restaurant) {
      cacheManager.set(
        cacheKey,
        email,
        restaurant,
        CACHE_CONFIG.TTL.RESTAURANT
      );
    }

    return restaurant;
  },

  /**
   * Get restaurant by ID with caching
   */
  async getRestaurantById(
    id: string,
    forceFresh = false
  ): Promise<Restaurant | null> {
    const cacheKey = CACHE_CONFIG.KEYS.RESTAURANT_BY_ID;

    if (!forceFresh) {
      const cached = cacheManager.get<Restaurant>(cacheKey, id);
      if (cached) return cached;
    }

    const { restaurantService } = await import("@/lib/database");
    const restaurant = await restaurantService.getById(id);

    if (restaurant) {
      cacheManager.set(cacheKey, id, restaurant, CACHE_CONFIG.TTL.RESTAURANT);
    }

    return restaurant;
  },

  /**
   * Get menu items by restaurant ID with caching
   */
  async getMenuItemsByRestaurantId(
    restaurantId: string,
    forceFresh = false
  ): Promise<MenuItem[]> {
    const cacheKey = CACHE_CONFIG.KEYS.MENU_ITEMS;

    if (!forceFresh) {
      const cached = cacheManager.get<MenuItem[]>(cacheKey, restaurantId);
      if (cached) return cached;
    }

    const { menuItemService } = await import("@/lib/database");
    const menuItems = await menuItemService.getByRestaurantId(restaurantId);

    cacheManager.set(
      cacheKey,
      restaurantId,
      menuItems,
      CACHE_CONFIG.TTL.MENU_ITEMS
    );

    return menuItems;
  },

  /**
   * Get complete user restaurant data with caching
   */
  async getUserRestaurantData(
    email: string,
    forceFresh = false
  ): Promise<{ restaurant: Restaurant | null; menuItems: MenuItem[] }> {
    const cacheKey = CACHE_CONFIG.KEYS.USER_RESTAURANT_DATA;

    if (!forceFresh) {
      const cached = cacheManager.get<{
        restaurant: Restaurant | null;
        menuItems: MenuItem[];
      }>(cacheKey, email);
      if (cached) return cached;
    }

    const restaurant = await this.getRestaurantByOwnerEmail(email, forceFresh);
    let menuItems: MenuItem[] = [];

    if (restaurant) {
      menuItems = await this.getMenuItemsByRestaurantId(
        restaurant.id,
        forceFresh
      );
    }

    const data = { restaurant, menuItems };
    cacheManager.set(cacheKey, email, data, CACHE_CONFIG.TTL.USER_DATA);

    return data;
  },

  /**
   * Invalidate restaurant-related cache when data changes
   */
  invalidateRestaurantCache(restaurantId?: string, ownerEmail?: string): void {
    if (restaurantId) {
      cacheManager.invalidate(CACHE_CONFIG.KEYS.RESTAURANT_BY_ID, restaurantId);
      cacheManager.invalidate(CACHE_CONFIG.KEYS.MENU_ITEMS, restaurantId);
    }

    if (ownerEmail) {
      cacheManager.invalidate(
        CACHE_CONFIG.KEYS.RESTAURANT_BY_EMAIL,
        ownerEmail
      );
      cacheManager.invalidate(
        CACHE_CONFIG.KEYS.USER_RESTAURANT_DATA,
        ownerEmail
      );
    }
  },

  /**
   * Invalidate menu items cache when menu changes
   */
  invalidateMenuCache(restaurantId: string, ownerEmail?: string): void {
    cacheManager.invalidate(CACHE_CONFIG.KEYS.MENU_ITEMS, restaurantId);

    if (ownerEmail) {
      cacheManager.invalidate(
        CACHE_CONFIG.KEYS.USER_RESTAURANT_DATA,
        ownerEmail
      );
    }
  },
};

// Cleanup expired entries on load
if (typeof window !== "undefined") {
  // Run cleanup when the page loads
  window.addEventListener("load", () => {
    cacheManager.cleanup();
  });

  // Run cleanup periodically (every 5 minutes)
  setInterval(() => {
    cacheManager.cleanup();
  }, 5 * 60 * 1000);
}

export { CACHE_CONFIG };
export default cacheManager;
