"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp, Star, Clock, Eye } from "lucide-react";
import { EnhancedMenuPerformanceItem } from "@/types/database";

interface EnhancedMenuPerformanceProps {
  data: EnhancedMenuPerformanceItem[];
  loading?: boolean;
}

export default function EnhancedMenuPerformance({
  data,
  loading,
}: EnhancedMenuPerformanceProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Menu Performance Score
          </CardTitle>
          <CardDescription>
            Enhanced scoring based on view time, engagement quality, and click
            behavior
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg animate-pulse"
              >
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
                <div className="h-8 w-16 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const topPerformers = data.slice(0, 5);
  const averageScore =
    data.length > 0
      ? Math.round(
          data.reduce((sum, item) => sum + item.performance_score, 0) /
            data.length
        )
      : 0;

  const getEngagementColor = (level: string) => {
    switch (level) {
      case "High":
        return "text-green-600 bg-green-100";
      case "Medium":
        return "text-yellow-600 bg-yellow-100";
      case "Low":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Menu Performance Score
        </CardTitle>
        <CardDescription>
          Enhanced scoring based on view time, engagement quality, and click
          behavior
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="space-y-4">
            {/* Overall Performance Summary */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#5F7161]">
                  {averageScore}
                </p>
                <p className="text-xs text-gray-600">Average Score</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#5F7161]">
                  {
                    data.filter((item) => item.engagement_level === "High")
                      .length
                  }
                </p>
                <p className="text-xs text-gray-600">High Performers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#5F7161]">
                  {
                    data.filter((item) => item.engagement_level === "Low")
                      .length
                  }
                </p>
                <p className="text-xs text-gray-600">Need Attention</p>
              </div>
            </div>

            {/* Top Performers */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-700">
                Top Performing Items
              </h4>
              {topPerformers.map((item, index) => (
                <div
                  key={item.menu_item_id}
                  className={`p-4 rounded-lg border ${
                    index === 0
                      ? "bg-[#5F7161]/5 border-[#5F7161]/20"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-semibold">{item.name}</h5>
                        {index === 0 && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.category} • £{item.price.toFixed(2)}
                      </p>

                      {/* Metrics */}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {item.total_views} views
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {Math.round(item.average_view_time)}s avg
                        </div>
                        <div>Peak: {item.peak_hour_label}</div>
                      </div>
                    </div>

                    <div className="text-right ml-4">
                      <div
                        className={`text-2xl font-bold ${getScoreColor(
                          item.performance_score
                        )}`}
                      >
                        {item.performance_score}
                      </div>
                      <div
                        className={`text-xs px-2 py-1 rounded-full ${getEngagementColor(
                          item.engagement_level
                        )}`}
                      >
                        {item.engagement_level}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Insights & Recommendations */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-700">
                Performance Insights
              </h4>

              {/* Scoring Explanation */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Enhanced Scoring Formula
                    </p>
                    <p className="text-xs text-gray-700">
                      <strong>25%</strong> View Popularity •{" "}
                      <strong>30%</strong> Time Engagement •<strong>25%</strong>{" "}
                      Quality Engagement (3+ sec views) • <strong>20%</strong>{" "}
                      Click Interest
                    </p>
                  </div>
                </div>
              </div>

              {/* Best Performer Insight */}
              {topPerformers.length > 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Star className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        Top Performer
                      </p>
                      <p className="text-xs text-green-700">
                        <strong>{topPerformers[0].name}</strong> is your star
                        item with a {topPerformers[0].performance_score} score.
                        Customers spend an average of{" "}
                        {Math.round(topPerformers[0].average_view_time)} seconds
                        viewing it.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Low Performer Alert */}
              {data.filter((item) => item.engagement_level === "Low").length >
                0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        Needs Attention
                      </p>
                      <p className="text-xs text-red-700">
                        {
                          data.filter((item) => item.engagement_level === "Low")
                            .length
                        }{" "}
                        items have low engagement scores. Consider adding better
                        photos, updating descriptions, or adjusting pricing.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Category Performance */}
              {(() => {
                const categoryPerformance = data.reduce((acc, item) => {
                  if (!acc[item.category]) {
                    acc[item.category] = { total: 0, count: 0, avgTime: 0 };
                  }
                  acc[item.category].total += item.performance_score;
                  acc[item.category].avgTime += item.average_view_time;
                  acc[item.category].count += 1;
                  return acc;
                }, {} as Record<string, { total: number; count: number; avgTime: number }>);

                const bestCategory = Object.entries(categoryPerformance)
                  .map(([category, data]) => ({
                    category,
                    avg: Math.round(data.total / data.count),
                    avgTime: Math.round(data.avgTime / data.count),
                  }))
                  .sort((a, b) => b.avg - a.avg)[0];

                return (
                  bestCategory && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-800">
                            Category Leader
                          </p>
                          <p className="text-xs text-blue-700">
                            Your <strong>{bestCategory.category}</strong>{" "}
                            category performs best (avg score:{" "}
                            {bestCategory.avg}, avg time: {bestCategory.avgTime}
                            s). Consider expanding this section.
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                );
              })()}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No performance data yet</p>
            <p className="text-sm">
              Data will appear when customers view your menu items
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
