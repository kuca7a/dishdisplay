# Caching Implementation

## Overview

The DishDisplay app now includes a comprehensive caching system that significantly reduces API calls and bandwidth usage by storing frequently accessed data in session storage with intelligent TTL (Time To Live) management.

## Benefits

### Performance Improvements
- **Reduced API Calls**: Data is cached on first load and reused for subsequent requests
- **Faster Loading**: Cached data loads instantly without network requests
- **Better User Experience**: Reduced loading times and smoother navigation
- **Bandwidth Savings**: Fewer HTTP requests reduce bandwidth consumption

### Cost Savings
- **Supabase API Costs**: Reduced database queries lower your Supabase usage
- **Server Load**: Less strain on your backend infrastructure
- **CDN Costs**: Fewer requests to external services

## Implementation Details

### Cache Architecture

#### 1. Cache Manager (`src/lib/cache.ts`)
- **Session Storage**: Uses browser session storage for temporary caching
- **TTL Support**: Automatic expiration of cached data
- **Smart Invalidation**: Targeted cache clearing when data changes
- **Statistics Tracking**: Monitor cache hit rates and performance

#### 2. Cached Data Service
- **Restaurant Data**: Caches restaurant information by owner email and ID
- **Menu Items**: Caches menu items by restaurant ID
- **User Data**: Combines restaurant and menu data for dashboard views

#### 3. React Hooks (`src/hooks/use-cached-data.ts`)
- **useRestaurantData**: Complete restaurant + menu data with caching
- **useRestaurantById**: Individual restaurant data with caching
- **useMenuItems**: Menu items with caching
- **useCacheStats**: Performance monitoring

### Cache Configuration

```typescript
const CACHE_CONFIG = {
  TTL: {
    RESTAURANT: 10 * 60 * 1000, // 10 minutes
    MENU_ITEMS: 5 * 60 * 1000,  // 5 minutes
    USER_DATA: 15 * 60 * 1000,  // 15 minutes
  }
}
```

### Cache Invalidation Strategy

The system automatically invalidates cache when:
- Restaurant data is updated
- Menu items are added, updated, or deleted
- Restaurant is created or deleted
- User performs data mutations

## Usage Examples

### Before (Without Caching)
```typescript
// Every component load triggers API calls
useEffect(() => {
  const loadData = async () => {
    const restaurant = await restaurantService.getByOwnerEmail(email);
    const menuItems = await menuItemService.getByRestaurantId(restaurant.id);
    // ... set state
  };
  loadData();
}, []);
```

### After (With Caching)
```typescript
// Automatic caching with the hook
const { restaurant, menuItems, loading, refetch, invalidateCache } = useRestaurantData();

// Manual cache control
const handleUpdate = async () => {
  await updateData();
  invalidateCache(); // Clear cache
  await refetch(true); // Force fresh data
};
```

## Cache Statistics

The system tracks:
- **Cache Hits**: Successful cache retrievals
- **Cache Misses**: Times data wasn't cached
- **Hit Rate**: Percentage of successful cache hits
- **Cache Sets**: Number of items stored
- **Invalidations**: Cache clearings

## Development Tools

### Cache Debug Component
A debug component shows real-time cache statistics:

```typescript
import { CacheDebug } from '@/components/CacheDebug';

// Shows detailed cache stats in development
<CacheDebug showDetailed={true} />
```

### Cache Statistics Hook
Monitor cache performance programmatically:

```typescript
const stats = useCacheStats();
console.log(`Hit rate: ${stats.hitRate}%`);
```

## Performance Impact

### Expected Improvements
- **70-90% reduction** in API calls for repeat page visits
- **50-80% faster** loading times for cached data
- **Significant bandwidth savings** especially for image-heavy menu data

### Cache Hit Rate Targets
- **Development**: 60-70% (frequent data changes during development)
- **Production**: 80-90% (more stable data patterns)

## Configuration

### Cache TTL Customization
Adjust cache durations based on your needs:

```typescript
// Longer TTL for stable data
RESTAURANT: 30 * 60 * 1000, // 30 minutes

// Shorter TTL for frequently changing data
MENU_ITEMS: 2 * 60 * 1000,  // 2 minutes
```

### Environment-Specific Behavior
- **Development**: Cache debug components visible
- **Production**: Silent operation with optional cache indicators

## Migration Guide

### Existing Components
Replace direct service calls with cached hooks:

```typescript
// Old approach
const [restaurant, setRestaurant] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  restaurantService.getByOwnerEmail(email).then(setRestaurant);
}, []);

// New approach with caching
const { restaurant, loading } = useRestaurantData();
```

### Cache Invalidation
Add cache invalidation to mutation operations:

```typescript
const handleUpdate = async (data) => {
  await restaurantService.update(id, data);
  // Invalidate related cache
  cachedDataService.invalidateRestaurantCache(id, email);
};
```

## Best Practices

1. **Use hooks for data fetching**: Prefer cached hooks over direct service calls
2. **Invalidate on mutations**: Always clear cache when data changes
3. **Monitor performance**: Use cache statistics to optimize TTL values
4. **Handle edge cases**: Implement fallbacks for cache failures
5. **Test cache behavior**: Verify cache invalidation works correctly

## Troubleshooting

### Common Issues
- **Stale data**: Check cache invalidation in mutation operations
- **Memory usage**: Monitor session storage size in browser dev tools
- **Cache misses**: Verify TTL configuration for your use case

### Debug Commands
```typescript
// Clear all cache
cacheManager.clear();

// View cache stats
console.log(cacheManager.getStats());

// Cleanup expired entries
cacheManager.cleanup();
```

This caching implementation provides a solid foundation for improved performance while maintaining data consistency and user experience.
