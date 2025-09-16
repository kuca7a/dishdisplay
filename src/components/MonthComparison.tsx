"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Users,
  MessageSquare,
  Star,
  Eye,
  X
} from "lucide-react";
import { analyticsComparisonService, ComparisonData } from "@/lib/analytics-comparison";
import { ThreeDotsLoader } from "@/components/ui/three-dots-loader";

interface MonthComparisonProps {
  restaurantId: string;
}

export default function MonthComparison({ restaurantId }: MonthComparisonProps) {
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const months = await analyticsComparisonService.getAvailableMonths(restaurantId);
        setAvailableMonths(months);
        
        // Auto-select last 2 months if available
        if (months.length >= 2) {
          const lastTwoMonths = months.slice(0, 2);
          setSelectedMonths(lastTwoMonths);
          // Don't call loadComparison here to avoid dependency issues
          const data = await analyticsComparisonService.compareMonths(restaurantId, lastTwoMonths);
          setComparisonData(data);
        }
        setInitialLoad(false);
      } catch (error) {
        console.error('Error loading available months:', error);
        setInitialLoad(false);
      }
    };
    
    loadData();
  }, [restaurantId]);

  const loadComparison = useCallback(async (months: string[] = selectedMonths) => {
    if (months.length < 2) return;
    
    setLoading(true);
    try {
      const data = await analyticsComparisonService.compareMonths(restaurantId, months);
      setComparisonData(data);
    } catch (error) {
      console.error('Error loading comparison:', error);
    } finally {
      setLoading(false);
    }
  }, [restaurantId, selectedMonths]);

  const addMonth = (month: string) => {
    if (!selectedMonths.includes(month) && selectedMonths.length < 6) {
      const newSelection = [...selectedMonths, month];
      setSelectedMonths(newSelection);
      loadComparison(newSelection);
    }
  };

  const removeMonth = (month: string) => {
    const newSelection = selectedMonths.filter(m => m !== month);
    setSelectedMonths(newSelection);
    if (newSelection.length >= 2) {
      loadComparison(newSelection);
    } else {
      setComparisonData(null);
    }
  };

  const formatMonthName = (month: string): string => {
    const date = new Date(month + '-01');
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const calculateChange = (current: number, previous: number): { percentage: number; isPositive: boolean } => {
    if (previous === 0) return { percentage: current > 0 ? 100 : 0, isPositive: current > 0 };
    const percentage = ((current - previous) / previous) * 100;
    return { percentage: Math.abs(percentage), isPositive: percentage >= 0 };
  };

  const MetricCard = ({ 
    title, 
    icon: Icon, 
    values, 
    labels, 
    format = 'number'
  }: {
    title: string;
    icon: React.ElementType;
    values: number[];
    labels: string[];
    format?: 'number' | 'rating' | 'percentage';
  }) => {
    const formatValue = (value: number) => {
      switch (format) {
        case 'rating':
          return value.toFixed(1);
        case 'percentage':
          return `${value.toFixed(1)}%`;
        default:
          return value.toString();
      }
    };

    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Icon className="h-4 w-4" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {values.map((value, index) => {
              const change = index > 0 ? calculateChange(value, values[index - 1]) : null;
              return (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{labels[index]}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{formatValue(value)}</span>
                    {change && (
                      <div className={`flex items-center gap-1 text-xs ${
                        change.isPositive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {change.isPositive ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {change.percentage.toFixed(0)}%
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (initialLoad) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Month Comparison
          </CardTitle>
          <CardDescription>Loading available months...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (availableMonths.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Month Comparison
          </CardTitle>
          <CardDescription>
            You need at least 2 months of data to compare. Keep using your menu to build analytics history!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Month Comparison
        </CardTitle>
        <CardDescription>
          Compare analytics across different months to track your progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Month Selection */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">Selected months:</span>
            {selectedMonths.map((month) => (
              <Badge key={month} variant="outline" className="flex items-center gap-1">
                {formatMonthName(month)}
                <button
                  onClick={() => removeMonth(month)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>

          {selectedMonths.length < 6 && (
            <div className="flex items-center gap-2">
              <Select onValueChange={addMonth}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Add month to compare" />
                </SelectTrigger>
                <SelectContent>
                  {availableMonths
                    .filter(month => !selectedMonths.includes(month))
                    .map((month) => (
                      <SelectItem key={month} value={month}>
                        {formatMonthName(month)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {selectedMonths.length < 2 && (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Select at least 2 months to compare</p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-8">
            <ThreeDotsLoader size="md" />
            <p className="mt-2 text-gray-500">Loading...</p>
          </div>
        )}

        {comparisonData && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
              title="Total Visits"
              icon={Users}
              values={comparisonData.metrics.totalVisits.values}
              labels={comparisonData.metrics.totalVisits.labels}
            />
            <MetricCard
              title="Reviews"
              icon={MessageSquare}
              values={comparisonData.metrics.totalReviews.values}
              labels={comparisonData.metrics.totalReviews.labels}
            />
            <MetricCard
              title="Average Rating"
              icon={Star}
              values={comparisonData.metrics.averageRating.values}
              labels={comparisonData.metrics.averageRating.labels}
              format="rating"
            />
            <MetricCard
              title="Menu Views"
              icon={Eye}
              values={comparisonData.metrics.menuViews.values}
              labels={comparisonData.metrics.menuViews.labels}
            />
            <MetricCard
              title="Unique Visitors"
              icon={Users}
              values={comparisonData.metrics.uniqueVisitors.values}
              labels={comparisonData.metrics.uniqueVisitors.labels}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
