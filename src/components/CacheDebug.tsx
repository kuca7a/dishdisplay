/**
 * Cache Debug Component
 * 
 * Shows cache statistics for debugging and demonstration purposes.
 * This can be conditionally shown in development mode to monitor cache performance.
 */

import React from 'react';
import { useCacheStats } from '@/hooks/use-cached-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Zap, Clock, Database } from 'lucide-react';

interface CacheDebugProps {
  className?: string;
  showDetailed?: boolean;
}

export function CacheDebug({ className, showDetailed = false }: CacheDebugProps) {
  const stats = useCacheStats();

  if (process.env.NODE_ENV === 'production' && !showDetailed) {
    return null;
  }

  return (
    <Card className={`border-blue-200 bg-blue-50/50 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Database className="h-4 w-4 text-blue-600" />
          Cache Performance
          <Badge variant="secondary" className="text-xs">
            {stats.hitRate.toFixed(1)}% hit rate
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Zap className="h-3 w-3 text-green-600" />
            <span className="text-gray-600">Cache Hits:</span>
            <span className="font-medium text-green-700">{stats.hits}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-orange-600" />
            <span className="text-gray-600">Cache Misses:</span>
            <span className="font-medium text-orange-700">{stats.misses}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <BarChart3 className="h-3 w-3 text-blue-600" />
            <span className="text-gray-600">Cache Sets:</span>
            <span className="font-medium text-blue-700">{stats.sets}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Database className="h-3 w-3 text-red-600" />
            <span className="text-gray-600">Invalidations:</span>
            <span className="font-medium text-red-700">{stats.invalidations}</span>
          </div>
        </div>
        
        {showDetailed && (
          <div className="pt-2 border-t border-blue-200">
            <p className="text-xs text-gray-600">
              Cache hits save API calls and improve performance. 
              A higher hit rate indicates better caching efficiency.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Simple cache indicator for production use
 */
export function CacheIndicator() {
  const stats = useCacheStats();
  
  if (stats.hits === 0 && stats.misses === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-green-100 border border-green-300 rounded-full px-3 py-1 shadow-sm">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-700 font-medium">
            {stats.hits} cached
          </span>
        </div>
      </div>
    </div>
  );
}
