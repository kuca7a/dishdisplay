import { getSupabaseClient } from "./supabase";
import {
  CreateAnalyticsEventData,
  AnalyticsEvent,
  AnalyticsOverview,
  MenuPerformanceItem,
  RecentActivity,
} from "@/types/database";

export class AnalyticsService {
  // Track an analytics event
  async trackEvent(
    data: CreateAnalyticsEventData
  ): Promise<AnalyticsEvent | null> {
    try {
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

      if (error) throw error;
      return event;
    } catch {
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

  // Generate a session ID for tracking
  generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

export const analyticsService = new AnalyticsService();
