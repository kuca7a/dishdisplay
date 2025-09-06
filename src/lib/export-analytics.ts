import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { 
  AnalyticsOverview, 
  MenuPerformanceItem, 
  EnhancedMenuPerformanceItem,
  RecentActivity 
} from '@/types/database';

export interface ExportData {
  overview: AnalyticsOverview;
  menuPerformance: MenuPerformanceItem[];
  enhancedPerformance: EnhancedMenuPerformanceItem[];
  recentActivity: RecentActivity[];
  peakHours: { hour: number; count: number; label: string }[];
  restaurantName: string;
  dateRange: string;
  exportDate: string;
}

export class AnalyticsExportService {
  
  /**
   * Export analytics data to PDF format
   */
  async exportToPDF(data: ExportData): Promise<void> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(95, 113, 97); // Brand color #5F7161
    doc.text('Analytics Report', 20, 20);
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(data.restaurantName, 20, 35);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Report Period: ${data.dateRange}`, 20, 45);
    doc.text(`Generated: ${data.exportDate}`, 20, 52);
    
    let yPosition = 70;

    // Overview Section
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Overview', 20, yPosition);
    yPosition += 10;

    const overviewData = [
      ['Metric', 'Value', 'Change'],
      ['Total Menu Views', data.overview.totalMenuViews.toString(), `${data.overview.menuViewsChange >= 0 ? '+' : ''}${data.overview.menuViewsChange.toFixed(1)}%`],
      ['Total QR Scans', data.overview.totalQrScans.toString(), `${data.overview.qrScansChange >= 0 ? '+' : ''}${data.overview.qrScansChange.toFixed(1)}%`],
      ['Unique Visitors', data.overview.uniqueVisitors.toString(), `${data.overview.uniqueVisitorsChange >= 0 ? '+' : ''}${data.overview.uniqueVisitorsChange.toFixed(1)}%`],
      ['Avg. View Time', `${data.overview.averageViewTimeSeconds}s`, `${data.overview.viewTimeChange >= 0 ? '+' : ''}${data.overview.viewTimeChange.toFixed(1)}%`],
    ];

    autoTable(doc, {
      head: [overviewData[0]],
      body: overviewData.slice(1),
      startY: yPosition,
      theme: 'grid',
      headStyles: { fillColor: [95, 113, 97] },
      margin: { left: 20, right: 20 },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // Menu Performance Section
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(16);
    doc.text('Top Menu Items Performance', 20, yPosition);
    yPosition += 10;

    const menuData = [
      ['Item Name', 'Category', 'Views', 'Avg Time', 'Change %']
    ];

    data.menuPerformance.slice(0, 10).forEach(item => {
      menuData.push([
        item.name.length > 25 ? item.name.substring(0, 25) + '...' : item.name,
        item.category,
        item.total_views.toString(),
        `${item.average_view_time.toFixed(1)}s`,
        `${item.views_change_percentage >= 0 ? '+' : ''}${item.views_change_percentage.toFixed(1)}%`
      ]);
    });

    autoTable(doc, {
      head: [menuData[0]],
      body: menuData.slice(1),
      startY: yPosition,
      theme: 'grid',
      headStyles: { fillColor: [95, 113, 97] },
      margin: { left: 20, right: 20 },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // Enhanced Performance Section
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(16);
    doc.text('Enhanced Performance Scores', 20, yPosition);
    yPosition += 10;

    const enhancedData = [
      ['Item Name', 'Score', 'Engagement', 'Peak Hour', 'Price']
    ];

    data.enhancedPerformance.slice(0, 10).forEach(item => {
      enhancedData.push([
        item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
        item.performance_score.toString(),
        item.engagement_level,
        item.peak_hour_label,
        `£${item.price.toFixed(2)}`
      ]);
    });

    autoTable(doc, {
      head: [enhancedData[0]],
      body: enhancedData.slice(1),
      startY: yPosition,
      theme: 'grid',
      headStyles: { fillColor: [95, 113, 97] },
      margin: { left: 20, right: 20 },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // Peak Hours Section
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(16);
    doc.text('Peak Activity Hours', 20, yPosition);
    yPosition += 10;

    // Get top 10 peak hours
    const sortedPeakHours = [...data.peakHours]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const peakHoursData = [
      ['Time', 'Activity Count']
    ];

    sortedPeakHours.forEach(hour => {
      peakHoursData.push([hour.label, hour.count.toString()]);
    });

    autoTable(doc, {
      head: [peakHoursData[0]],
      body: peakHoursData.slice(1),
      startY: yPosition,
      theme: 'grid',
      headStyles: { fillColor: [95, 113, 97] },
      margin: { left: 20, right: 20 },
    });

    // Footer
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - 30, doc.internal.pageSize.height - 10);
      doc.text('Generated by DishDisplay Analytics', 20, doc.internal.pageSize.height - 10);
    }

    // Save the PDF
    doc.save(`${data.restaurantName.replace(/[^a-z0-9]/gi, '_')}_analytics_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  /**
   * Export analytics data to Excel format
   */
  async exportToExcel(data: ExportData): Promise<void> {
    const workbook = XLSX.utils.book_new();

    // Overview Sheet
    const overviewData = [
      ['Metric', 'Value', 'Change (%)'],
      ['Total Menu Views', data.overview.totalMenuViews, data.overview.menuViewsChange],
      ['Total QR Scans', data.overview.totalQrScans, data.overview.qrScansChange],
      ['Unique Visitors', data.overview.uniqueVisitors, data.overview.uniqueVisitorsChange],
      ['Average View Time (seconds)', data.overview.averageViewTimeSeconds, data.overview.viewTimeChange],
      [],
      ['Report Information'],
      ['Restaurant Name', data.restaurantName],
      ['Date Range', data.dateRange],
      ['Export Date', data.exportDate],
    ];

    const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
    
    // Set column widths
    overviewSheet['!cols'] = [
      { width: 25 },
      { width: 15 },
      { width: 15 }
    ];

    XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Overview');

    // Menu Performance Sheet
    const menuPerfData = [
      ['Item ID', 'Item Name', 'Category', 'Total Views', 'Unique Viewers', 'Average View Time (s)', 'Views Change (%)', 'Image URL']
    ];

    data.menuPerformance.forEach(item => {
      menuPerfData.push([
        item.menu_item_id,
        item.name,
        item.category,
        item.total_views.toString(),
        item.unique_viewers.toString(),
        item.average_view_time.toFixed(2),
        item.views_change_percentage.toFixed(2),
        item.image_url || ''
      ]);
    });

    const menuPerfSheet = XLSX.utils.aoa_to_sheet(menuPerfData);
    
    // Set column widths
    menuPerfSheet['!cols'] = [
      { width: 15 },
      { width: 30 },
      { width: 12 },
      { width: 12 },
      { width: 15 },
      { width: 18 },
      { width: 15 },
      { width: 40 }
    ];

    XLSX.utils.book_append_sheet(workbook, menuPerfSheet, 'Menu Performance');

    // Enhanced Performance Sheet
    const enhancedPerfData = [
      ['Item ID', 'Item Name', 'Category', 'Price (£)', 'Total Views', 'Performance Score', 'Engagement Level', 'Peak Hour', 'Peak Time Label', 'Average View Time (s)']
    ];

    data.enhancedPerformance.forEach(item => {
      enhancedPerfData.push([
        item.menu_item_id,
        item.name,
        item.category,
        item.price.toString(),
        item.total_views.toString(),
        item.performance_score.toString(),
        item.engagement_level,
        item.peak_hour.toString(),
        item.peak_hour_label,
        item.average_view_time.toFixed(2)
      ]);
    });

    const enhancedPerfSheet = XLSX.utils.aoa_to_sheet(enhancedPerfData);
    
    // Set column widths
    enhancedPerfSheet['!cols'] = [
      { width: 15 },
      { width: 30 },
      { width: 12 },
      { width: 10 },
      { width: 12 },
      { width: 15 },
      { width: 15 },
      { width: 10 },
      { width: 15 },
      { width: 18 }
    ];

    XLSX.utils.book_append_sheet(workbook, enhancedPerfSheet, 'Enhanced Performance');

    // Peak Hours Sheet
    const peakHoursData = [
      ['Hour (24h)', 'Time Label', 'Activity Count']
    ];

    data.peakHours.forEach(hour => {
      peakHoursData.push([
        hour.hour.toString(),
        hour.label,
        hour.count.toString()
      ]);
    });

    const peakHoursSheet = XLSX.utils.aoa_to_sheet(peakHoursData);
    
    // Set column widths
    peakHoursSheet['!cols'] = [
      { width: 15 },
      { width: 15 },
      { width: 15 }
    ];

    XLSX.utils.book_append_sheet(workbook, peakHoursSheet, 'Peak Hours');

    // Recent Activity Sheet (last 50 activities)
    const recentActivityData = [
      ['ID', 'Type', 'Description', 'Timestamp', 'Item Name', 'Table Number', 'Rating']
    ];

    data.recentActivity.slice(0, 50).forEach(activity => {
      recentActivityData.push([
        activity.id,
        activity.type,
        activity.description,
        activity.timestamp,
        activity.metadata?.item_name || '',
        activity.metadata?.table_number || '',
        activity.metadata?.rating?.toString() || ''
      ]);
    });

    const recentActivitySheet = XLSX.utils.aoa_to_sheet(recentActivityData);
    
    // Set column widths
    recentActivitySheet['!cols'] = [
      { width: 15 },
      { width: 15 },
      { width: 40 },
      { width: 20 },
      { width: 25 },
      { width: 12 },
      { width: 10 }
    ];

    XLSX.utils.book_append_sheet(workbook, recentActivitySheet, 'Recent Activity');

    // Generate and save the Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    saveAs(blob, `${data.restaurantName.replace(/[^a-z0-9]/gi, '_')}_analytics_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  /**
   * Prepare export data from analytics service results
   */
  prepareExportData(
    overview: AnalyticsOverview,
    menuPerformance: MenuPerformanceItem[],
    enhancedPerformance: EnhancedMenuPerformanceItem[],
    recentActivity: RecentActivity[],
    peakHours: { hour: number; count: number; label: string }[],
    restaurantName: string,
    days: number = 30
  ): ExportData {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    return {
      overview,
      menuPerformance,
      enhancedPerformance,
      recentActivity,
      peakHours,
      restaurantName,
      dateRange: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
      exportDate: new Date().toLocaleDateString()
    };
  }

  /**
   * Get formatted summary for export
   */
  getExportSummary(data: ExportData): string {
    const totalViews = data.overview.totalMenuViews;
    const totalScans = data.overview.totalQrScans;
    const avgTime = data.overview.averageViewTimeSeconds;
    const topItem = data.enhancedPerformance[0];

    return `Analytics Summary for ${data.restaurantName}:
- ${totalViews} total menu views (${data.overview.menuViewsChange >= 0 ? '+' : ''}${data.overview.menuViewsChange.toFixed(1)}%)
- ${totalScans} QR code scans (${data.overview.qrScansChange >= 0 ? '+' : ''}${data.overview.qrScansChange.toFixed(1)}%)
- ${avgTime}s average view time (${data.overview.viewTimeChange >= 0 ? '+' : ''}${data.overview.viewTimeChange.toFixed(1)}%)
- Top performing item: ${topItem ? topItem.name : 'N/A'} (${topItem ? topItem.performance_score : 0} score)
- Report period: ${data.dateRange}`;
  }
}

export const analyticsExportService = new AnalyticsExportService();
