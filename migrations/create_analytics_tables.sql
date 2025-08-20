-- Migration: Create analytics tables for restaurant insights
-- Date: 2025-08-20
-- Description: Create tables to track menu views, QR scans, and other analytics

-- Analytics Events Table - tracks all user interactions
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'menu_view', 'qr_scan', 'item_view', 'visit_marked', 'review_submitted', etc.
    session_id VARCHAR(255), -- To track unique sessions
    user_agent TEXT, -- Browser/device info
    ip_address INET, -- User IP (for unique visitor counting)
    
    -- Event specific data (stored as JSONB for flexibility)
    event_data JSONB DEFAULT '{}'::jsonb, -- item_id, table_number, rating, etc.
    
    -- Timing data
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    duration_seconds INTEGER, -- For tracking how long they stayed on page/item
    
    -- Location data (optional)
    referrer_url TEXT,
    page_url TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Menu Item Analytics - aggregated view counts per item
CREATE TABLE IF NOT EXISTS menu_item_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    
    -- Daily aggregated data
    date DATE NOT NULL,
    view_count INTEGER DEFAULT 0,
    unique_viewers INTEGER DEFAULT 0, -- Based on unique session_ids
    total_view_time_seconds INTEGER DEFAULT 0,
    average_view_time_seconds DECIMAL(10,2) DEFAULT 0,
    
    -- Engagement metrics
    clicks_to_details INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure one record per item per day
    UNIQUE(restaurant_id, menu_item_id, date)
);

-- Restaurant Analytics - daily aggregated data per restaurant
CREATE TABLE IF NOT EXISTS restaurant_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    
    -- Daily aggregated data
    date DATE NOT NULL,
    
    -- QR Code & Menu metrics
    qr_scans INTEGER DEFAULT 0,
    menu_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0, -- Based on unique session_ids
    total_session_time_seconds INTEGER DEFAULT 0,
    average_session_time_seconds DECIMAL(10,2) DEFAULT 0,
    
    -- Item interaction metrics
    item_detail_views INTEGER DEFAULT 0,
    
    -- Visit & Review metrics (from existing diner system)
    visits_marked INTEGER DEFAULT 0,
    reviews_submitted INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure one record per restaurant per day
    UNIQUE(restaurant_id, date)
);

-- Session Tracking - to identify unique visitors and session duration
CREATE TABLE IF NOT EXISTS analytics_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    
    -- Session info
    first_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    page_views INTEGER DEFAULT 1,
    
    -- Device/Browser info
    user_agent TEXT,
    ip_address INET,
    device_type VARCHAR(50), -- 'mobile', 'tablet', 'desktop'
    browser VARCHAR(100),
    
    -- Entry point
    entry_url TEXT,
    referrer_url TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(session_id, restaurant_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_restaurant_timestamp ON analytics_events(restaurant_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);

CREATE INDEX IF NOT EXISTS idx_menu_item_analytics_restaurant_date ON menu_item_analytics(restaurant_id, date);
CREATE INDEX IF NOT EXISTS idx_menu_item_analytics_item_date ON menu_item_analytics(menu_item_id, date);

CREATE INDEX IF NOT EXISTS idx_restaurant_analytics_restaurant_date ON restaurant_analytics(restaurant_id, date);
CREATE INDEX IF NOT EXISTS idx_restaurant_analytics_date ON restaurant_analytics(date);

CREATE INDEX IF NOT EXISTS idx_analytics_sessions_restaurant ON analytics_sessions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_session_id ON analytics_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_last_seen ON analytics_sessions(last_seen);

-- Create a function to update analytics aggregations (can be called daily via cron)
CREATE OR REPLACE FUNCTION update_daily_analytics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
BEGIN
    -- Update restaurant analytics for the target date
    INSERT INTO restaurant_analytics (
        restaurant_id, 
        date, 
        qr_scans, 
        menu_views, 
        unique_visitors,
        total_session_time_seconds,
        item_detail_views,
        visits_marked,
        reviews_submitted,
        average_rating
    )
    SELECT 
        e.restaurant_id,
        target_date,
        COUNT(CASE WHEN e.event_type = 'qr_scan' THEN 1 END) as qr_scans,
        COUNT(CASE WHEN e.event_type = 'menu_view' THEN 1 END) as menu_views,
        COUNT(DISTINCT e.session_id) as unique_visitors,
        COALESCE(SUM(e.duration_seconds), 0) as total_session_time_seconds,
        COUNT(CASE WHEN e.event_type = 'item_view' THEN 1 END) as item_detail_views,
        COUNT(CASE WHEN e.event_type = 'visit_marked' THEN 1 END) as visits_marked,
        COUNT(CASE WHEN e.event_type = 'review_submitted' THEN 1 END) as reviews_submitted,
        (
            SELECT AVG(rating) 
            FROM diner_reviews dr 
            WHERE dr.restaurant_id = e.restaurant_id 
            AND DATE(dr.created_at) = target_date
        ) as average_rating
    FROM analytics_events e
    WHERE DATE(e.timestamp) = target_date
    GROUP BY e.restaurant_id
    ON CONFLICT (restaurant_id, date) 
    DO UPDATE SET
        qr_scans = EXCLUDED.qr_scans,
        menu_views = EXCLUDED.menu_views,
        unique_visitors = EXCLUDED.unique_visitors,
        total_session_time_seconds = EXCLUDED.total_session_time_seconds,
        item_detail_views = EXCLUDED.item_detail_views,
        visits_marked = EXCLUDED.visits_marked,
        reviews_submitted = EXCLUDED.reviews_submitted,
        average_rating = EXCLUDED.average_rating,
        updated_at = NOW();

    -- Update menu item analytics for the target date
    INSERT INTO menu_item_analytics (
        restaurant_id,
        menu_item_id,
        date,
        view_count,
        unique_viewers,
        total_view_time_seconds,
        clicks_to_details
    )
    SELECT 
        e.restaurant_id,
        (e.event_data->>'item_id')::UUID as menu_item_id,
        target_date,
        COUNT(*) as view_count,
        COUNT(DISTINCT e.session_id) as unique_viewers,
        COALESCE(SUM(e.duration_seconds), 0) as total_view_time_seconds,
        COUNT(CASE WHEN e.event_type = 'item_detail_click' THEN 1 END) as clicks_to_details
    FROM analytics_events e
    WHERE DATE(e.timestamp) = target_date
    AND e.event_type IN ('item_view', 'item_detail_click')
    AND e.event_data->>'item_id' IS NOT NULL
    GROUP BY e.restaurant_id, (e.event_data->>'item_id')::UUID
    ON CONFLICT (restaurant_id, menu_item_id, date)
    DO UPDATE SET
        view_count = EXCLUDED.view_count,
        unique_viewers = EXCLUDED.unique_viewers,
        total_view_time_seconds = EXCLUDED.total_view_time_seconds,
        clicks_to_details = EXCLUDED.clicks_to_details,
        average_view_time_seconds = CASE 
            WHEN EXCLUDED.view_count > 0 
            THEN EXCLUDED.total_view_time_seconds::DECIMAL / EXCLUDED.view_count 
            ELSE 0 
        END,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
