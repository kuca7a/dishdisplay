import { getSupabaseClient } from "./supabase";
import {
  CreateAnalyticsEventData,
  AnalyticsEvent,
  AnalyticsOverview,
  MenuPerformanceItem,
  EnhancedMenuPerformanceItem,
  RecentActivity,
} from "@/types/database";

export class AnalyticsService {
  // Track an analytics event
  async trackEvent(
    data: CreateAnalyticsEventData
  ): Promise<AnalyticsEvent | null> {
    try {
      console.log('📊 Analytics Service - Tracking event:', {
        event_type: data.event_type,
        restaurant_id: data.restaurant_id,
        duration_seconds: data.duration_seconds,
        event_data: data.event_data
      });

      const supabase = getSupabaseClient();
      const { data: event, error } = await supabase
        .from("analytics_events")
        .insert([
          {
            restaurant_id: data.restaurant_id,
            event_type: data.event_type,
            session_id: data.session_id,
            event_data: data.event_data || {},
            duration_seconds: data.duration_seconds,
            referrer_url: data.referrer_url,
            page_url: data.page_url,
            user_agent:
              typeof window !== "undefined"
                ? window.navigator.userAgent
                : undefined,
            timestamp: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('❌ Analytics Service - Database error:', error);
        throw error;
      }

      console.log('✅ Analytics Service - Event saved:', event);
      return event;
    } catch (error) {
      console.error('❌ Analytics Service - Failed to track event:', error);
      return null;
    }
  }

  // Get analytics overview for a restaurant
  async getAnalyticsOverview(
    restaurantId: string,
    days: number = 30
  ): Promise<AnalyticsOverview> {
    try {
      const supabase = getSupabaseClient();
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      // Get current period events
      const { data: currentEvents, error: currentError } = await supabase
        .from("analytics_events")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .gte("timestamp", startDate.toISOString())
        .lte("timestamp", endDate.toISOString());

      if (currentError) throw currentError;

      // Get previous period events for comparison
      const prevStartDate = new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - days);
      const prevEndDate = new Date(startDate);

      const { data: prevEvents, error: prevError } = await supabase
        .from("analytics_events")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .gte("timestamp", prevStartDate.toISOString())
        .lte("timestamp", prevEndDate.toISOString());

      if (prevError) throw prevError;

      // Calculate current period metrics
      const currentMenuViews = (currentEvents || []).filter(
        (e) => e.event_type === "menu_view"
      ).length;
      const currentQrScans = (currentEvents || []).filter(
        (e) => e.event_type === "qr_scan"
      ).length;
      const currentUniqueVisitors = new Set(
        (currentEvents || []).map((e) => e.session_id)
      ).size;

      // Calculate session-based metrics
      const currentSessions = new Set(
        (currentEvents || []).map((e) => e.session_id)
      ).size;
      const eventsWithDuration = (currentEvents || []).filter(
        (e) => e.duration_seconds && e.duration_seconds > 0
      );
      const totalDurationFromEvents = eventsWithDuration.reduce(
        (sum, e) => sum + (e.duration_seconds || 0),
        0
      );

      // Calculate average view time per session based on events with duration
      // If no duration data, calculate a basic estimate based on number of interactions per session
      let currentAvgTime = 0;
      if (eventsWithDuration.length > 0) {
        currentAvgTime = Math.round(totalDurationFromEvents / currentSessions);
      } else if (currentSessions > 0) {
        // Fallback: estimate 30 seconds per menu view + 10 seconds per item view
        const menuViews = (currentEvents || []).filter(
          (e) => e.event_type === "menu_view"
        ).length;
        const itemViews = (currentEvents || []).filter(
          (e) => e.event_type === "item_view"
        ).length;
        const estimatedTime = menuViews * 30 + itemViews * 10;
        currentAvgTime = Math.round(estimatedTime / currentSessions);
      }

      // Calculate previous period metrics
      const prevMenuViews = (prevEvents || []).filter(
        (e) => e.event_type === "menu_view"
      ).length;
      const prevQrScans = (prevEvents || []).filter(
        (e) => e.event_type === "qr_scan"
      ).length;
      const prevUniqueVisitors = new Set(
        (prevEvents || []).map((e) => e.session_id)
      ).size;
      const prevSessions = new Set((prevEvents || []).map((e) => e.session_id))
        .size;

      const prevEventsWithDuration = (prevEvents || []).filter(
        (e) => e.duration_seconds && e.duration_seconds > 0
      );
      const prevTotalDurationFromEvents = prevEventsWithDuration.reduce(
        (sum, e) => sum + (e.duration_seconds || 0),
        0
      );

      let prevAvgTime = 0;
      if (prevEventsWithDuration.length > 0) {
        prevAvgTime = Math.round(prevTotalDurationFromEvents / prevSessions);
      } else if (prevSessions > 0) {
        const prevMenuViewsCount = (prevEvents || []).filter(
          (e) => e.event_type === "menu_view"
        ).length;
        const prevItemViewsCount = (prevEvents || []).filter(
          (e) => e.event_type === "item_view"
        ).length;
        const prevEstimatedTime =
          prevMenuViewsCount * 30 + prevItemViewsCount * 10;
        prevAvgTime = Math.round(prevEstimatedTime / prevSessions);
      }

      // Calculate percentage changes
      const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      const result = {
        totalMenuViews: currentMenuViews,
        totalQrScans: currentQrScans,
        averageViewTimeSeconds: currentAvgTime,
        uniqueVisitors: currentUniqueVisitors,
        menuViewsChange: calculateChange(currentMenuViews, prevMenuViews),
        qrScansChange: calculateChange(currentQrScans, prevQrScans),
        viewTimeChange: calculateChange(currentAvgTime, prevAvgTime),
        uniqueVisitorsChange: calculateChange(
          currentUniqueVisitors,
          prevUniqueVisitors
        ),
      };

      return result;
    } catch {
      return {
        totalMenuViews: 0,
        totalQrScans: 0,
        averageViewTimeSeconds: 0,
        uniqueVisitors: 0,
        menuViewsChange: 0,
        qrScansChange: 0,
        viewTimeChange: 0,
        uniqueVisitorsChange: 0,
      };
    }
  }

  // Get menu performance data
  async getMenuPerformance(
    restaurantId: string,
    days: number = 30
  ): Promise<MenuPerformanceItem[]> {
    try {
      const supabase = getSupabaseClient();
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      // Get item view events for the period
      const { data: events, error: eventsError } = await supabase
        .from("analytics_events")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .eq("event_type", "item_view")
        .gte("timestamp", startDate.toISOString())
        .lte("timestamp", endDate.toISOString());

      if (eventsError) throw eventsError;

      // Get menu items to join with analytics data
      const { data: menuItems, error: menuError } = await supabase
        .from("menu_items")
        .select("id, name, category, image_url")
        .eq("restaurant_id", restaurantId);

      if (menuError) throw menuError;

      // Aggregate analytics by menu item
      const itemMap = new Map<
        string,
        {
          total_views: number;
          unique_viewers: Set<string>;
          total_view_time: number;
        }
      >();

      (events || []).forEach((event) => {
        const itemId =
          event.event_data?.item_id || event.event_data?.menu_item_id;
        if (!itemId) return;

        if (itemMap.has(itemId)) {
          const existing = itemMap.get(itemId)!;
          existing.total_views += 1;
          existing.unique_viewers.add(event.session_id);
          existing.total_view_time += event.duration_seconds || 0;
        } else {
          itemMap.set(itemId, {
            total_views: 1,
            unique_viewers: new Set([event.session_id]),
            total_view_time: event.duration_seconds || 0,
          });
        }
      });

      // Combine with menu item details
      const performance = (menuItems || [])
        .map((item) => {
          const analytics = itemMap.get(item.id);
          if (!analytics) return null;

          return {
            menu_item_id: item.id,
            name: item.name,
            category: item.category,
            image_url: item.image_url,
            total_views: analytics.total_views,
            unique_viewers: analytics.unique_viewers.size,
            average_view_time:
              analytics.total_views > 0
                ? analytics.total_view_time / analytics.total_views
                : 0,
            views_change_percentage: 0, // TODO: Calculate change from previous period
          } as MenuPerformanceItem;
        })
        .filter((item) => item !== null) as MenuPerformanceItem[];

      const result = performance
        .sort((a, b) => b.total_views - a.total_views)
        .slice(0, 10); // Top 10 items

      return result;
    } catch {
      return [];
    }
  }

  // Get recent activity
  async getRecentActivity(
    restaurantId: string,
    limit: number = 20
  ): Promise<RecentActivity[]> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("analytics_events")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("timestamp", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((event) => ({
        id: event.id,
        type: event.event_type,
        description: this.getActivityDescription(event),
        timestamp: event.timestamp,
        metadata: event.event_data,
      }));
    } catch {
      return [];
    }
  }

  // Create or update analytics session
  async trackSession(
    sessionId: string,
    restaurantId: string,
    pageUrl?: string
  ): Promise<void> {
    try {
      const supabase = getSupabaseClient();
      const deviceType = this.getDeviceType();
      const browser = this.getBrowser();

      const { error } = await supabase.from("analytics_sessions").upsert(
        {
          session_id: sessionId,
          restaurant_id: restaurantId,
          last_seen: new Date().toISOString(),
          device_type: deviceType,
          browser: browser,
          user_agent:
            typeof window !== "undefined"
              ? window.navigator.userAgent
              : undefined,
          entry_url: pageUrl,
        },
        {
          onConflict: "session_id,restaurant_id",
        }
      );

      if (error) throw error;
    } catch {
      // Silently fail for analytics errors
    }
  }

  // Helper methods
  private getActivityDescription(event: AnalyticsEvent): string {
    switch (event.event_type) {
      case "menu_view":
        return "Menu viewed via QR code";
      case "qr_scan":
        return "QR code scanned";
      case "item_view":
        const itemName = event.event_data.item_name as string;
        return itemName ? `${itemName} viewed` : "Menu item viewed";
      case "visit_marked":
        return "Visit marked as completed";
      case "review_submitted":
        return "Review submitted";
      default:
        return "Activity recorded";
    }
  }

  private getDeviceType(): string {
    if (typeof window === "undefined") return "unknown";

    const userAgent = window.navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return "tablet";
    } else if (
      /mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(
        userAgent
      )
    ) {
      return "mobile";
    }
    return "desktop";
  }

  private getBrowser(): string {
    if (typeof window === "undefined") return "unknown";

    const userAgent = window.navigator.userAgent;
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    return "Other";
  }

  // Get peak activity hours for a restaurant
  async getPeakActivityHours(
    restaurantId: string,
    days: number = 30
  ): Promise<{ hour: number; count: number; label: string }[]> {
    try {
      const supabase = getSupabaseClient();
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const { data, error } = await supabase
        .from("analytics_events")
        .select("timestamp")
        .eq("restaurant_id", restaurantId)
        .in("event_type", ["qr_scan", "menu_view"])
        .gte("timestamp", startDate.toISOString())
        .lte("timestamp", endDate.toISOString());

      if (error) throw error;

      // Group by hour of day
      const hourlyData = new Array(24).fill(0).map((_, hour) => ({
        hour,
        count: 0,
        label: this.formatHourLabel(hour),
      }));

      (data || []).forEach((event) => {
        const hour = new Date(event.timestamp).getHours();
        hourlyData[hour].count += 1;
      });

      return hourlyData;
    } catch {
      return new Array(24).fill(0).map((_, hour) => ({
        hour,
        count: 0,
        label: this.formatHourLabel(hour),
      }));
    }
  }

  // Get enhanced menu performance with scoring
  async getEnhancedMenuPerformance(
    restaurantId: string,
    days: number = 30
  ): Promise<EnhancedMenuPerformanceItem[]> {
    try {
      const supabase = getSupabaseClient();
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      // Get item view events and detail clicks for the period
      const { data: events, error: eventsError } = await supabase
        .from("analytics_events")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .in("event_type", ["item_view", "item_detail_click"])
        .gte("timestamp", startDate.toISOString())
        .lte("timestamp", endDate.toISOString());

      if (eventsError) throw eventsError;

      // Get menu items to join with analytics data
      const { data: menuItems, error: menuError } = await supabase
        .from("menu_items")
        .select("id, name, category, image_url, price")
        .eq("restaurant_id", restaurantId);

      if (menuError) throw menuError;

      // Aggregate analytics by menu item
      const itemMap = new Map<
        string,
        {
          total_views: number;
          total_clicks: number;
          unique_viewers: Set<string>;
          total_view_time: number;
          click_sessions: Set<string>;
          peak_hour: number;
          hourly_distribution: number[];
          engagement_sessions: number;
        }
      >();

      (events || []).forEach((event) => {
        const itemId =
          event.event_data?.item_id || event.event_data?.menu_item_id;
        if (!itemId) return;

        const hour = new Date(event.timestamp).getHours();
        const isClick = event.event_type === "item_detail_click";
        const isView = event.event_type === "item_view";

        if (itemMap.has(itemId)) {
          const existing = itemMap.get(itemId)!;
          if (isView) {
            existing.total_views += 1;
            existing.unique_viewers.add(event.session_id);
            existing.total_view_time += event.duration_seconds || 0;
            existing.hourly_distribution[hour] += 1;
            // Count as engaged session if view time > 3 seconds
            if ((event.duration_seconds || 0) > 3) {
              existing.engagement_sessions += 1;
            }
          }
          if (isClick) {
            existing.total_clicks += 1;
            existing.click_sessions.add(event.session_id);
          }
        } else {
          const hourlyDist = new Array(24).fill(0);
          if (isView) hourlyDist[hour] = 1;
          
          itemMap.set(itemId, {
            total_views: isView ? 1 : 0,
            total_clicks: isClick ? 1 : 0,
            unique_viewers: isView ? new Set([event.session_id]) : new Set(),
            total_view_time: isView ? (event.duration_seconds || 0) : 0,
            click_sessions: isClick ? new Set([event.session_id]) : new Set(),
            peak_hour: hour,
            hourly_distribution: hourlyDist,
            engagement_sessions: (isView && (event.duration_seconds || 0) > 3) ? 1 : 0,
          });
        }
      });

      // Calculate overall metrics for enhanced scoring
      const allViews = Array.from(itemMap.values()).map(item => item.total_views);
      const allViewTimes = Array.from(itemMap.values()).map(item => 
        item.total_views > 0 ? item.total_view_time / item.total_views : 0
      );
      const allEngagementRates = Array.from(itemMap.values()).map(item => 
        item.total_views > 0 ? item.engagement_sessions / item.total_views : 0
      );

      const maxViews = Math.max(...allViews, 1);
      const maxAvgViewTime = Math.max(...allViewTimes, 1);
      const maxEngagementRate = Math.max(...allEngagementRates, 0.01);

      // Combine with menu item details and calculate performance scores
      const performance = (menuItems || [])
        .map((item) => {
          const analytics = itemMap.get(item.id);
          if (!analytics) {
            return {
              menu_item_id: item.id,
              name: item.name,
              category: item.category,
              image_url: item.image_url,
              price: item.price,
              total_views: 0,
              unique_viewers: 0,
              average_view_time: 0,
              views_change_percentage: 0,
              performance_score: 0,
              engagement_level: 'Low' as const,
              peak_hour: 12,
              peak_hour_label: '12:00 PM',
            };
          }

          const avgViewTime = analytics.total_views > 0 
            ? analytics.total_view_time / analytics.total_views 
            : 0;

          // Calculate engagement rate (sessions with >3 seconds view time)
          const engagementRate = analytics.total_views > 0 
            ? analytics.engagement_sessions / analytics.total_views 
            : 0;

          // Calculate click-through rate (unique clicks vs unique viewers)
          const clickThroughRate = analytics.unique_viewers.size > 0 
            ? analytics.click_sessions.size / analytics.unique_viewers.size 
            : 0;

          // Find peak hour
          const peakHourIndex = analytics.hourly_distribution
            .indexOf(Math.max(...analytics.hourly_distribution));

          // Enhanced performance score calculation (0-100)
          // Weighted scoring based on multiple engagement factors
          const viewPopularityScore = (analytics.total_views / maxViews) * 25; // 25% weight
          const timeEngagementScore = (avgViewTime / maxAvgViewTime) * 30; // 30% weight  
          const qualityEngagementScore = (engagementRate / maxEngagementRate) * 25; // 25% weight
          const clickInterestScore = Math.min(clickThroughRate * 100, 20); // 20% weight (capped at 20)
          
          const performanceScore = Math.round(
            viewPopularityScore + timeEngagementScore + qualityEngagementScore + clickInterestScore
          );

          // Determine engagement level based on multiple factors
          let engagementLevel: 'Low' | 'Medium' | 'High';
          if (performanceScore >= 70 && engagementRate > 0.3 && avgViewTime > 5) {
            engagementLevel = 'High';
          } else if (performanceScore >= 40 && (engagementRate > 0.2 || avgViewTime > 3)) {
            engagementLevel = 'Medium';
          } else {
            engagementLevel = 'Low';
          }

          return {
            menu_item_id: item.id,
            name: item.name,
            category: item.category,
            image_url: item.image_url,
            price: item.price,
            total_views: analytics.total_views,
            unique_viewers: analytics.unique_viewers.size,
            average_view_time: avgViewTime,
            views_change_percentage: 0, // TODO: Calculate change from previous period
            performance_score: performanceScore,
            engagement_level: engagementLevel,
            peak_hour: peakHourIndex,
            peak_hour_label: this.formatHourLabel(peakHourIndex),
          } as EnhancedMenuPerformanceItem;
        })
        .sort((a, b) => b.performance_score - a.performance_score);

      return performance;
    } catch {
      return [];
    }
  }

  // Helper method to format hour labels
  private formatHourLabel(hour: number): string {
    if (hour === 0) return '12:00 AM';
    if (hour === 12) return '12:00 PM';
    if (hour < 12) return `${hour}:00 AM`;
    return `${hour - 12}:00 PM`;
  }

  // Generate a session ID for tracking
  generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

export const analyticsService = new AnalyticsService();
