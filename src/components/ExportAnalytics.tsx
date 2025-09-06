"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  FileText, 
  Sheet, 
  CalendarDays,
  TrendingUp,
  BarChart3,
  Clock,
  Users
} from "lucide-react";
import { analyticsService } from "@/lib/analytics";
import { analyticsExportService } from "@/lib/export-analytics";
import { ThreeDotsLoader } from "@/components/ui/three-dots-loader";
import { toast } from "sonner";

interface ExportAnalyticsProps {
  restaurantId: string;
  restaurantName: string;
}

export default function ExportAnalytics({ restaurantId, restaurantName }: ExportAnalyticsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');
  const [dateRange, setDateRange] = useState<string>('30');
  const [lastExport, setLastExport] = useState<{ format: string; date: string } | null>(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const days = parseInt(dateRange);

      // Fetch all analytics data
      const [overview, menuPerformance, enhancedPerformance, recentActivity, peakHours] = await Promise.all([
        analyticsService.getAnalyticsOverview(restaurantId, days),
        analyticsService.getMenuPerformance(restaurantId, days),
        analyticsService.getEnhancedMenuPerformance(restaurantId, days),
        analyticsService.getRecentActivity(restaurantId, 100),
        analyticsService.getPeakActivityHours(restaurantId, days)
      ]);

      // Prepare export data
      const exportData = analyticsExportService.prepareExportData(
        overview,
        menuPerformance,
        enhancedPerformance,
        recentActivity,
        peakHours,
        restaurantName,
        days
      );

      // Export based on selected format
      if (exportFormat === 'pdf') {
        await analyticsExportService.exportToPDF(exportData);
        toast.success('PDF report generated successfully!');
      } else {
        await analyticsExportService.exportToExcel(exportData);
        toast.success('Excel report generated successfully!');
      }

      // Update last export info
      setLastExport({
        format: exportFormat.toUpperCase(),
        date: new Date().toLocaleString()
      });

    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to generate report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const getDateRangeLabel = (days: string) => {
    switch (days) {
      case '7': return 'Last 7 days';
      case '30': return 'Last 30 days';
      case '90': return 'Last 3 months';
      case '365': return 'Last year';
      default: return 'Last 30 days';
    }
  };

  const formatOptions = [
    {
      value: 'pdf',
      label: 'PDF Report',
      description: 'Formatted document with charts and tables',
      icon: FileText,
      color: 'text-red-600'
    },
    {
      value: 'excel',
      label: 'Excel Spreadsheet', 
      description: 'Raw data in spreadsheet format for analysis',
      icon: Sheet,
      color: 'text-green-600'
    }
  ];

  const timeRanges = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 3 months' },
    { value: '365', label: 'Last year' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Analytics
        </CardTitle>
        <CardDescription>
          Download your analytics data in PDF or Excel format for further analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export Format Selection */}
        <div className="space-y-3">
          <Label htmlFor="format">Export Format</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {formatOptions.map((format) => (
              <Card 
                key={format.value}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  exportFormat === format.value 
                    ? 'ring-2 ring-[#5F7161] bg-[#5F7161]/5' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setExportFormat(format.value as 'pdf' | 'excel')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <format.icon className={`h-8 w-8 ${format.color}`} />
                    <div className="flex-1">
                      <h4 className="font-medium">{format.label}</h4>
                      <p className="text-sm text-gray-600">{format.description}</p>
                    </div>
                    {exportFormat === format.value && (
                      <Badge variant="default" className="bg-[#5F7161]">
                        Selected
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Date Range Selection */}
        <div className="space-y-3">
          <Label htmlFor="dateRange">Date Range</Label>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger>
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    {range.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Export Preview */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Export Preview
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span>Performance metrics</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              <span>Visitor analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span>Peak hours data</span>
            </div>
            <div className="flex items-center gap-2">
              <Sheet className="h-4 w-4 text-purple-600" />
              <span>Menu performance</span>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <strong>Period:</strong> {getDateRangeLabel(dateRange)} • <strong>Format:</strong> {exportFormat.toUpperCase()}
          </div>
        </div>

        {/* Export Button */}
        <Button 
          onClick={handleExport}
          disabled={isExporting}
          className="w-full bg-[#5F7161] hover:bg-[#4C5B4F]"
          size="lg"
        >
          {isExporting ? (
            <>
              <ThreeDotsLoader size="sm" color="white" className="mr-2" />
              Generating {exportFormat.toUpperCase()} Report...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export {exportFormat.toUpperCase()} Report
            </>
          )}
        </Button>

        {/* Last Export Info */}
        {lastExport && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-800">
              <Download className="h-4 w-4" />
              <span className="font-medium">Last Export:</span>
              <Badge variant="outline" className="text-green-700 border-green-300">
                {lastExport.format}
              </Badge>
              <span className="text-sm">{lastExport.date}</span>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h5 className="font-medium text-blue-800 mb-1">Export Information:</h5>
          <ul className="space-y-1 text-blue-700">
            <li>• <strong>PDF:</strong> Professional report with formatted tables and summaries</li>
            <li>• <strong>Excel:</strong> Raw data across multiple sheets for custom analysis</li>
            <li>• All exports include overview, menu performance, peak hours, and recent activity</li>
            <li>• Files are automatically named with restaurant name and export date</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
