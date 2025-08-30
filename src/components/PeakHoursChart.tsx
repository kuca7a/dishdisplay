"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, TrendingUp } from "lucide-react";

interface PeakHoursData {
  hour: number;
  count: number;
  label: string;
}

interface PeakHoursChartProps {
  data: PeakHoursData[];
  loading?: boolean;
}

export default function PeakHoursChart({ data, loading }: PeakHoursChartProps) {
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

  // Get top 5 busiest hours
  const topHours = [...data]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .filter(h => h.count > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Peak Activity Hours
        </CardTitle>
        <CardDescription>
          When customers scan QR codes and view your menu most
        </CardDescription>
      </CardHeader>
      <CardContent>
        {topHours.length > 0 ? (
          <div className="space-y-4">
            {/* Peak hour highlight */}
            <div className="p-4 bg-[#5F7161]/5 border border-[#5F7161]/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[#5F7161]">Peak Hour</p>
                  <p className="text-2xl font-bold">{peakHour.label}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Views</p>
                  <p className="text-xl font-semibold">{peakHour.count}</p>
                </div>
              </div>
            </div>

            {/* Hourly breakdown */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-700">Top Busy Hours</h4>
              {topHours.map((hour, index) => (
                <div key={hour.hour} className="flex items-center gap-4">
                  <div className="w-16 text-sm font-medium text-gray-600">
                    {hour.label}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
                    <div
                      className={`h-3 rounded-full ${
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
                  <div className="w-8 text-sm font-medium text-right">
                    {hour.count}
                  </div>
                </div>
              ))}
            </div>

            {/* Insights */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Optimization Tip
                  </p>
                  <p className="text-xs text-blue-700">
                    {peakHour.count > 0 && (
                      <>
                        Your busiest time is {peakHour.label}. Consider promoting 
                        special offers during slower hours ({
                          data
                            .filter(h => h.count > 0)
                            .sort((a, b) => a.count - b.count)
                            .slice(0, 2)
                            .map(h => h.label)
                            .join(', ')
                        }) to balance demand.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No activity data yet</p>
            <p className="text-sm">Data will appear when customers scan your QR codes</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
