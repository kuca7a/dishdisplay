import { useCallback } from 'react';
import { analyticsService } from '@/lib/analytics';

interface UseAnalyticsProps {
  restaurantId?: string;
  enabled?: boolean;
}

export const useAnalytics = ({ restaurantId, enabled = true }: UseAnalyticsProps) => {
  // Generate session ID once per page load (only on client side)
  const getSessionId = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = analyticsService.generateSessionId();
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }, []);

  // Track page view
  const trackPageView = useCallback(async (eventType: 'menu_view' | 'qr_scan' | 'item_view', eventData?: Record<string, string | number | boolean | null>) => {
    if (!enabled || !restaurantId || typeof window === 'undefined') return;

    const sessionId = getSessionId();
    if (!sessionId) return;

    try {
      await analyticsService.trackEvent({
        restaurant_id: restaurantId,
        event_type: eventType,
        session_id: sessionId,
        event_data: eventData,
        page_url: window.location.href,
        referrer_url: document.referrer
      });

      // Update session tracking
      await analyticsService.trackSession(sessionId, restaurantId, window.location.href);
    } catch (error) {
      console.error('Error tracking analytics:', error);
    }
  }, [restaurantId, enabled, getSessionId]);

  // Track item view with timing
  const trackItemView = useCallback(async (itemId: string, itemName: string, startTime?: number) => {
    if (!enabled || !restaurantId) return;

    const duration = startTime ? Math.round((Date.now() - startTime) / 1000) : null;

    await trackPageView('item_view', {
      item_id: itemId,
      item_name: itemName,
      ...(duration && { duration_seconds: duration })
    });
  }, [trackPageView, enabled, restaurantId]);

  // Track menu view
  const trackMenuView = useCallback(async (duration?: number) => {
    const eventData = duration ? { duration_seconds: duration } : undefined;
    await trackPageView('menu_view', eventData);
  }, [trackPageView]);

  // Track QR scan
  const trackQrScan = useCallback(async (tableNumber?: string, duration?: number) => {
    const eventData = {
      ...(tableNumber && { table_number: tableNumber }),
      ...(duration && { duration_seconds: duration })
    };
    await trackPageView('qr_scan', Object.keys(eventData).length > 0 ? eventData : undefined);
  }, [trackPageView]);

  // Track visit marked
  const trackVisitMarked = useCallback(async () => {
    if (!enabled || !restaurantId || typeof window === 'undefined') return;

    const sessionId = getSessionId();
    if (!sessionId) return;

    try {
      await analyticsService.trackEvent({
        restaurant_id: restaurantId,
        event_type: 'visit_marked',
        session_id: sessionId
      });
    } catch (error) {
      console.error('Error tracking visit marked:', error);
    }
  }, [restaurantId, enabled, getSessionId]);

  // Track review submission
  const trackReviewSubmitted = useCallback(async (rating: number) => {
    if (!enabled || !restaurantId || typeof window === 'undefined') return;

    const sessionId = getSessionId();
    if (!sessionId) return;

    try {
      await analyticsService.trackEvent({
        restaurant_id: restaurantId,
        event_type: 'review_submitted',
        session_id: sessionId,
        event_data: { rating }
      });
    } catch (error) {
      console.error('Error tracking review submission:', error);
    }
  }, [restaurantId, enabled, getSessionId]);

  return {
    trackMenuView,
    trackQrScan,
    trackItemView,
    trackVisitMarked,
    trackReviewSubmitted,
    sessionId: typeof window !== 'undefined' ? getSessionId() : null
  };
};
