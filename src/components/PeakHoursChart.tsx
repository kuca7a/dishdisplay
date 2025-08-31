"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, TrendingUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PeakHoursData {
  hour: number;
  count: number;
  label: string;
}

interface PeakHoursChartProps {
  data: PeakHoursData[];
  loading?: boolean;
  onRefresh?: () => void;
}

export default function PeakHoursChart({ data, loading, onRefresh }: PeakHoursChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Peak Activity Hours
          </CardTitle>
          <CardDescription>
            When customers scan QR codes and view your menu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-16"></div>
                <div className="flex-1 bg-gray-200 rounded-full h-4"></div>
                <div className="h-4 bg-gray-300 rounded w-8"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count), 1);
  const peakHour = data.reduce((prev, current) => 
    current.count > prev.count ? current : prev
  );

  // Get top 4 busiest hours (reduced from 5)
  const topHours = [...data]
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)
    .filter(h => h.count > 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Peak Activity Hours
            </CardTitle>
            <CardDescription>
              When customers scan QR codes and view your menu most
            </CardDescription>
          </div>
          {onRefresh && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
        </div>
      </CardHeader>
            <CardContent className="pt-4">
        {topHours.length === 0 ? (
          <div className="text-center py-6">
            <Clock className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              No peak hours data yet
            </h3>
            <p className="text-xs text-gray-500">
              Data will appear once customers start viewing your menu
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Activity bars */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700">Top Busy Hours</h4>
              {topHours.map((hour, index) => (
                <div key={hour.hour} className="flex items-center gap-3">
                  <div className="w-14 text-xs font-medium text-gray-600">
                    {hour.label}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
                    <div
                      className={`h-2 rounded-full ${
                        index === 0 
                          ? 'bg-[#5F7161]' 
                          : index === 1 
                          ? 'bg-[#5F7161]/80' 
                          : 'bg-[#5F7161]/60'
                      }`}
                      style={{
                        width: `${(hour.count / maxCount) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="w-6 text-xs font-medium text-right">
                    {hour.count}
                  </div>
                </div>
              ))}
            </div>

            {/* Compact insights */}
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <TrendingUp className="h-3 w-3 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-blue-800">
                    Peak: {peakHour.label} ({peakHour.count} views)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
