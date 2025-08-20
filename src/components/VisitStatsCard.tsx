'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, TrendingUp, TrendingDown, Eye } from 'lucide-react';

interface VisitStats {
  totalVisits: number;
  thisMonthVisits: number;
  percentageChange: number;
  uniqueVisitors: number;
  recentVisits: Array<{
    id: string;
    date: string;
    diner_id: string;
  }>;
}

interface VisitStatsCardProps {
  restaurantId: string;
}

export default function VisitStatsCard({ restaurantId }: VisitStatsCardProps) {
  const [stats, setStats] = useState<VisitStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVisitStats() {
      try {
        const response = await fetch(`/api/restaurant-visits?restaurant_id=${restaurantId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch visit statistics');
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Error fetching visit stats:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (restaurantId) {
      fetchVisitStats();
    }
  }, [restaurantId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Customer Visits
          </CardTitle>
          <CardDescription>Track diner engagement with your menu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Customer Visits
          </CardTitle>
          <CardDescription>Track diner engagement with your menu</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {error || 'No visit data available yet'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatPercentageChange = (change: number) => {
    const isPositive = change > 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const color = isPositive ? 'text-green-600' : 'text-red-600';
    
    return (
      <div className={`flex items-center gap-1 ${color}`}>
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">
          {Math.abs(change).toFixed(1)}%
        </span>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Customer Visits
        </CardTitle>
        <CardDescription>Track diner engagement with your menu</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Total Visits</p>
            <p className="text-2xl font-bold">{stats.totalVisits}</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Unique Visitors</p>
            <p className="text-2xl font-bold flex items-center gap-2">
              {stats.uniqueVisitors}
              <Users className="h-4 w-4 text-muted-foreground" />
            </p>
          </div>
        </div>

        {/* This Month Stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">This Month</p>
            {stats.percentageChange !== 0 && formatPercentageChange(stats.percentageChange)}
          </div>
          <p className="text-xl font-semibold">{stats.thisMonthVisits} visits</p>
          {stats.percentageChange !== 0 && (
            <p className="text-xs text-muted-foreground">
              vs. last month
            </p>
          )}
        </div>

        {/* Recent Activity */}
        {stats.recentVisits.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Recent Activity</p>
            <div className="space-y-2">
              {stats.recentVisits.slice(0, 5).map((visit, index) => (
                <div key={visit.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <span className="text-sm">Visit #{stats.totalVisits - index}</span>
                  <Badge variant="outline" className="text-xs">
                    {new Date(visit.date).toLocaleDateString()}
                  </Badge>
                </div>
              ))}
            </div>
            {stats.recentVisits.length > 5 && (
              <p className="text-xs text-muted-foreground text-center">
                +{stats.recentVisits.length - 5} more visits
              </p>
            )}
          </div>
        )}

        {stats.totalVisits === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              No visits logged yet. Share your QR code to start tracking customer engagement!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
