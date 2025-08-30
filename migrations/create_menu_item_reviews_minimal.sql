-- MINIMAL Menu Item Review System Migration
-- This version creates only the essential components

-- Drop existing problematic objects first
DROP VIEW IF EXISTS menu_item_reviews_with_diner;
DROP TABLE IF EXISTS menu_item_reviews CASCADE;

-- Menu Item Reviews Table (MINIMAL)
CREATE TABLE menu_item_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    diner_id UUID NOT NULL REFERENCES diner_profiles(id) ON DELETE CASCADE,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(menu_item_id, diner_id)
);

-- Essential indexes
CREATE INDEX idx_menu_item_reviews_menu_item_id ON menu_item_reviews(menu_item_id);
CREATE INDEX idx_menu_item_reviews_diner_id ON menu_item_reviews(diner_id);
CREATE INDEX idx_menu_item_reviews_restaurant_id ON menu_item_reviews(restaurant_id);

-- Disable RLS for testing
ALTER TABLE menu_item_reviews DISABLE ROW LEVEL SECURITY;

-- Grant full access for testing
GRANT ALL ON menu_item_reviews TO authenticated, anon, postgres;

-- Add review count column to menu_items if missing
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT NULL;

-- Create MINIMAL view using only guaranteed columns
CREATE VIEW menu_item_reviews_with_diner AS
SELECT 
    mir.id,
    mir.menu_item_id,
    mir.diner_id,
    mir.restaurant_id,
    mir.rating,
    mir.review_text,
    mir.created_at,
    mir.updated_at,
    dp.email as diner_email,
    dp.display_name as diner_name,
    NULL::text as diner_avatar,  -- Set to NULL for now
    COALESCE(dp.total_points, 0) as diner_points,
    'Bronze' as diner_level
FROM menu_item_reviews mir
JOIN diner_profiles dp ON mir.diner_id = dp.id
ORDER BY mir.created_at DESC;

-- Grant access to view
GRANT SELECT ON menu_item_reviews_with_diner TO authenticated, anon, postgres;
