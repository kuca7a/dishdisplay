import { getSupabaseClient } from "./supabase";

export interface MonthlyAnalytics {
  month: string; // Format: "2025-08"
  year: number;
  monthName: string; // Format: "August 2025"
  totalVisits: number;
  totalReviews: number;
  averageRating: number;
  totalEvents: number;
  peakHour: number;
  peakHourViews: number;
  uniqueVisitors: number;
  menuViews: number;
  qrScans: number;
  itemViews: number;
}

export interface ComparisonData {
  months: MonthlyAnalytics[];
  metrics: {
    totalVisits: { values: number[]; labels: string[] };
    totalReviews: { values: number[]; labels: string[] };
    averageRating: { values: number[]; labels: string[] };
    menuViews: { values: number[]; labels: string[] };
    uniqueVisitors: { values: number[]; labels: string[] };
  };
}

export class AnalyticsComparisonService {
  
  private formatMonthName(dateStr: string): string {
    const date = new Date(dateStr + '-01');
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  private getPeakHour(hourCounts: { [hour: number]: number }): { hour: number; views: number } {
    let peakHour = 0;
    let maxViews = 0;
    
    Object.entries(hourCounts).forEach(([hour, views]) => {
      if (views > maxViews) {
        maxViews = views;
        peakHour = parseInt(hour);
      }
    });
    
    return { hour: peakHour, views: maxViews };
  }

  async getMonthlyAnalytics(
    restaurantId: string,
    month: string // Format: "2025-08"
  ): Promise<MonthlyAnalytics> {
    try {
      const supabase = getSupabaseClient();
      const [year, monthNum] = month.split('-');
      const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59);

      // Get all analytics events for the month
      const { data: events, error: eventsError } = await supabase
        .from("analytics_events")
        .select("event_type, timestamp, session_id")
        .eq("restaurant_id", restaurantId)
        .gte("timestamp", startDate.toISOString())
        .lte("timestamp", endDate.toISOString());

      if (eventsError) throw eventsError;

      // Get visits for the month
      const { data: visits, error: visitsError } = await supabase
        .from("restaurant_visits")
        .select("diner_id")
        .eq("restaurant_id", restaurantId)
        .gte("date", startDate.toISOString())
        .lte("date", endDate.toISOString());

      if (visitsError) throw visitsError;

      // Get reviews for the month
      const { data: reviews, error: reviewsError } = await supabase
        .from("menu_item_reviews_with_diner")
        .select("rating")
        .eq("restaurant_id", restaurantId)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      if (reviewsError) throw reviewsError;

      // Process the data
      const totalEvents = events?.length || 0;
      const totalVisits = visits?.length || 0;
      const totalReviews = reviews?.length || 0;
      const uniqueVisitors = new Set(visits?.map(v => v.diner_id) || []).size;

      // Calculate average rating
      const averageRating = totalReviews > 0 
        ? reviews!.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
        : 0;

      // Count event types
      const eventTypeCounts = {
        menu_view: 0,
        qr_scan: 0,
        item_view: 0
      };

      const hourCounts: { [hour: number]: number } = {};

      events?.forEach(event => {
        if (event.event_type in eventTypeCounts) {
          eventTypeCounts[event.event_type as keyof typeof eventTypeCounts]++;
        }
        
        const hour = new Date(event.timestamp).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });

      const peakHourData = this.getPeakHour(hourCounts);

      return {
        month,
        year: parseInt(year),
        monthName: this.formatMonthName(month),
        totalVisits,
        totalReviews,
        averageRating: Math.round(averageRating * 100) / 100,
        totalEvents,
        peakHour: peakHourData.hour,
        peakHourViews: peakHourData.views,
        uniqueVisitors,
        menuViews: eventTypeCounts.menu_view,
        qrScans: eventTypeCounts.qr_scan,
        itemViews: eventTypeCounts.item_view
      };

    } catch (error) {
      console.error(`Error fetching analytics for ${month}:`, error);
      return {
        month,
        year: parseInt(month.split('-')[0]),
        monthName: this.formatMonthName(month),
        totalVisits: 0,
        totalReviews: 0,
        averageRating: 0,
        totalEvents: 0,
        peakHour: 0,
        peakHourViews: 0,
        uniqueVisitors: 0,
        menuViews: 0,
        qrScans: 0,
        itemViews: 0
      };
    }
  }

  async compareMonths(
    restaurantId: string,
    months: string[] // Array of month strings like ["2025-07", "2025-08"]
  ): Promise<ComparisonData> {
    try {
      const monthlyData = await Promise.all(
        months.map(month => this.getMonthlyAnalytics(restaurantId, month))
      );

      // Prepare comparison metrics
      const metrics = {
        totalVisits: {
          values: monthlyData.map(m => m.totalVisits),
          labels: monthlyData.map(m => m.monthName)
        },
        totalReviews: {
          values: monthlyData.map(m => m.totalReviews),
          labels: monthlyData.map(m => m.monthName)
        },
        averageRating: {
          values: monthlyData.map(m => m.averageRating),
          labels: monthlyData.map(m => m.monthName)
        },
        menuViews: {
          values: monthlyData.map(m => m.menuViews),
          labels: monthlyData.map(m => m.monthName)
        },
        uniqueVisitors: {
          values: monthlyData.map(m => m.uniqueVisitors),
          labels: monthlyData.map(m => m.monthName)
        }
      };

      return {
        months: monthlyData,
        metrics
      };

    } catch (error) {
      console.error('Error comparing months:', error);
      throw error;
    }
  }

  // Get available months with data
  async getAvailableMonths(restaurantId: string): Promise<string[]> {
    try {
      const supabase = getSupabaseClient();
      
      const { data: events, error } = await supabase
        .from("analytics_events")
        .select("timestamp")
        .eq("restaurant_id", restaurantId)
        .order("timestamp", { ascending: false });

      if (error) throw error;

      const months = new Set<string>();
      events?.forEach(event => {
        const date = new Date(event.timestamp);
        const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        months.add(monthStr);
      });

      return Array.from(months).sort().reverse(); // Most recent first

    } catch (error) {
      console.error('Error fetching available months:', error);
      return [];
    }
  }
}

export const analyticsComparisonService = new AnalyticsComparisonService();
