/**
 * React hooks for cached data fetching
 * 
 * These hooks provide a simple interface for components to use cached data
 * while automatically handling loading states and cache invalidation.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Restaurant, MenuItem } from '@/types/database';
import { cachedDataService, cacheManager } from '@/lib/cache';

interface UseRestaurantDataResult {
  restaurant: Restaurant | null;
  menuItems: MenuItem[];
  loading: boolean;
  error: string | null;
  refetch: (forceFresh?: boolean) => Promise<void>;
  invalidateCache: () => void;
}

interface UseRestaurantResult {
  restaurant: Restaurant | null;
  loading: boolean;
  error: string | null;
  refetch: (forceFresh?: boolean) => Promise<void>;
  invalidateCache: () => void;
}

interface UseMenuItemsResult {
  menuItems: MenuItem[];
  loading: boolean;
  error: string | null;
  refetch: (forceFresh?: boolean) => Promise<void>;
  invalidateCache: () => void;
}

/**
 * Hook for fetching user's restaurant data (restaurant + menu items)
 */
export function useRestaurantData(): UseRestaurantDataResult {
  const { user, isAuthenticated } = useAuth0();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (forceFresh = false) => {
    if (!isAuthenticated || !user?.email) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { restaurant: restaurantData, menuItems: menuItemsData } = 
        await cachedDataService.getUserRestaurantData(user.email, forceFresh);
      
      setRestaurant(restaurantData);
      setMenuItems(menuItemsData);
    } catch (err) {
      console.error('Error fetching restaurant data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load restaurant data');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.email]);

  const invalidateCache = useCallback(() => {
    if (user?.email) {
      cachedDataService.invalidateRestaurantCache(restaurant?.id, user.email);
    }
  }, [user?.email, restaurant?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    restaurant,
    menuItems,
    loading,
    error,
    refetch: fetchData,
    invalidateCache
  };
}

/**
 * Hook for fetching restaurant by owner email
 */
export function useRestaurantByEmail(email?: string): UseRestaurantResult {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (forceFresh = false) => {
    if (!email) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const restaurantData = await cachedDataService.getRestaurantByOwnerEmail(email, forceFresh);
      setRestaurant(restaurantData);
    } catch (err) {
      console.error('Error fetching restaurant:', err);
      setError(err instanceof Error ? err.message : 'Failed to load restaurant');
    } finally {
      setLoading(false);
    }
  }, [email]);

  const invalidateCache = useCallback(() => {
    if (email) {
      cachedDataService.invalidateRestaurantCache(restaurant?.id, email);
    }
  }, [email, restaurant?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    restaurant,
    loading,
    error,
    refetch: fetchData,
    invalidateCache
  };
}

/**
 * Hook for fetching restaurant by ID
 */
export function useRestaurantById(id?: string): UseRestaurantResult {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (forceFresh = false) => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const restaurantData = await cachedDataService.getRestaurantById(id, forceFresh);
      setRestaurant(restaurantData);
    } catch (err) {
      console.error('Error fetching restaurant:', err);
      setError(err instanceof Error ? err.message : 'Failed to load restaurant');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const invalidateCache = useCallback(() => {
    if (id) {
      cachedDataService.invalidateRestaurantCache(id);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    restaurant,
    loading,
    error,
    refetch: fetchData,
    invalidateCache
  };
}

/**
 * Hook for fetching menu items by restaurant ID
 */
export function useMenuItems(restaurantId?: string): UseMenuItemsResult {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (forceFresh = false) => {
    if (!restaurantId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const menuItemsData = await cachedDataService.getMenuItemsByRestaurantId(restaurantId, forceFresh);
      setMenuItems(menuItemsData);
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setError(err instanceof Error ? err.message : 'Failed to load menu items');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  const invalidateCache = useCallback(() => {
    if (restaurantId) {
      cachedDataService.invalidateMenuCache(restaurantId);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    menuItems,
    loading,
    error,
    refetch: fetchData,
    invalidateCache
  };
}

/**
 * Hook for cache statistics (useful for debugging)
 */
export function useCacheStats() {
  const [stats, setStats] = useState(cacheManager.getStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(cacheManager.getStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return stats;
}

/**
 * Hook for cache management actions
 */
export function useCacheManager() {
  return {
    clear: () => cacheManager.clear(),
    cleanup: () => cacheManager.cleanup(),
    getStats: () => cacheManager.getStats(),
    invalidateType: (type: string) => cacheManager.invalidateType(type),
  };
}
