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

  // Track item view with timing and timeout protection
  const trackItemView = useCallback(async (itemId: string, itemName: string, startTime?: number) => {
    if (!enabled || !restaurantId || typeof window === 'undefined') return;

    const sessionId = getSessionId();
    if (!sessionId) return;

    let duration = startTime ? Math.round((Date.now() - startTime) / 1000) : null;
    
    // Cap duration at 30 minutes (1800 seconds) to prevent overnight sessions
    if (duration !== null) {
      duration = Math.min(duration, 1800);
    }

    try {
      await analyticsService.trackEvent({
        restaurant_id: restaurantId,
        event_type: 'item_view',
        session_id: sessionId,
        event_data: {
          item_id: itemId,
          item_name: itemName
        },
        duration_seconds: duration || undefined,
        page_url: window.location.href,
        referrer_url: document.referrer
      });

      // Update session tracking
      await analyticsService.trackSession(sessionId, restaurantId, window.location.href);
    } catch (error) {
      console.error('❌ Error tracking item view:', error);
    }
  }, [restaurantId, enabled, getSessionId]);

  // Track menu view with timeout protection
  const trackMenuView = useCallback(async (duration?: number) => {
    if (!enabled || !restaurantId || typeof window === 'undefined') return;

    const sessionId = getSessionId();
    if (!sessionId) return;

    // Cap duration at 30 minutes (1800 seconds) to prevent overnight sessions
    const cappedDuration = duration ? Math.min(duration, 1800) : undefined;

    try {
      await analyticsService.trackEvent({
        restaurant_id: restaurantId,
        event_type: 'menu_view',
        session_id: sessionId,
        event_data: {},
        duration_seconds: cappedDuration,
        page_url: window.location.href,
        referrer_url: document.referrer
      });

      // Update session tracking
      await analyticsService.trackSession(sessionId, restaurantId, window.location.href);
    } catch (error) {
      console.error('Error tracking menu view:', error);
    }
  }, [restaurantId, enabled, getSessionId]);

  // Track QR scan with timeout protection
  const trackQrScan = useCallback(async (tableNumber?: string, duration?: number) => {
    if (!enabled || !restaurantId || typeof window === 'undefined') return;

    const sessionId = getSessionId();
    if (!sessionId) return;

    // Cap duration at 30 minutes (1800 seconds) to prevent overnight sessions
    const cappedDuration = duration ? Math.min(duration, 1800) : undefined;

    try {
      await analyticsService.trackEvent({
        restaurant_id: restaurantId,
        event_type: 'qr_scan',
        session_id: sessionId,
        event_data: tableNumber ? { table_number: tableNumber } : {},
        duration_seconds: cappedDuration,
        page_url: window.location.href,
        referrer_url: document.referrer
      });

      // Update session tracking
      await analyticsService.trackSession(sessionId, restaurantId, window.location.href);
    } catch (error) {
      console.error('Error tracking QR scan:', error);
    }
  }, [restaurantId, enabled, getSessionId]);

  // Track visit marked
  const trackVisitMarked = useCallback(async () => {
    if (!enabled || !restaurantId || typeof window === 'undefined') return;

    const sessionId = getSessionId();
    if (!sessionId) return;

    try {
      await analyticsService.trackEvent({
        restaurant_id: restaurantId,
        event_type: 'visit_marked',
        session_id: sessionId,
        event_data: {}
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
