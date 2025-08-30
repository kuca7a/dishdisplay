-- Create Menu Item Review System
-- This allows authenticated diners to review individual menu items

-- Menu Item Reviews Table
CREATE TABLE IF NOT EXISTS menu_item_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign keys
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    diner_id UUID NOT NULL REFERENCES diner_profiles(id) ON DELETE CASCADE,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    
    -- Review content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent duplicate reviews from same diner for same menu item
    UNIQUE(menu_item_id, diner_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_menu_item_reviews_menu_item_id ON menu_item_reviews(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_menu_item_reviews_diner_id ON menu_item_reviews(diner_id);
CREATE INDEX IF NOT EXISTS idx_menu_item_reviews_restaurant_id ON menu_item_reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_item_reviews_rating ON menu_item_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_menu_item_reviews_created_at ON menu_item_reviews(created_at);

-- Row Level Security (RLS)
ALTER TABLE menu_item_reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read published reviews
CREATE POLICY "Anyone can read menu item reviews" ON menu_item_reviews
    FOR SELECT USING (true);

-- Policy: Only authenticated diners can create reviews
CREATE POLICY "Authenticated diners can create menu item reviews" ON menu_item_reviews
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM diner_profiles dp 
            WHERE dp.id = diner_id 
            AND dp.user_id = auth.uid()
        )
    );

-- Policy: Diners can update their own reviews
CREATE POLICY "Diners can update their own menu item reviews" ON menu_item_reviews
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM diner_profiles dp 
            WHERE dp.id = diner_id 
            AND dp.user_id = auth.uid()
        )
    );

-- Policy: Diners can delete their own reviews
CREATE POLICY "Diners can delete their own menu item reviews" ON menu_item_reviews
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM diner_profiles dp 
            WHERE dp.id = diner_id 
            AND dp.user_id = auth.uid()
        )
    );

-- Function to update menu item average rating and review count
CREATE OR REPLACE FUNCTION update_menu_item_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update menu_items table with latest stats
    UPDATE menu_items 
    SET 
        review_count = (
            SELECT COUNT(*) 
            FROM menu_item_reviews 
            WHERE menu_item_id = COALESCE(NEW.menu_item_id, OLD.menu_item_id)
        ),
        average_rating = (
            SELECT ROUND(AVG(rating)::numeric, 2) 
            FROM menu_item_reviews 
            WHERE menu_item_id = COALESCE(NEW.menu_item_id, OLD.menu_item_id)
        )
    WHERE id = COALESCE(NEW.menu_item_id, OLD.menu_item_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update menu item stats
DROP TRIGGER IF EXISTS trigger_update_menu_item_stats ON menu_item_reviews;
CREATE TRIGGER trigger_update_menu_item_stats
    AFTER INSERT OR UPDATE OR DELETE ON menu_item_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_menu_item_stats();

-- Add review fields to menu_items table if they don't exist
DO $$ 
BEGIN
    -- Add review_count column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'menu_items' AND column_name = 'review_count'
    ) THEN
        ALTER TABLE menu_items ADD COLUMN review_count INTEGER DEFAULT 0;
    END IF;
    
    -- Add average_rating column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'menu_items' AND column_name = 'average_rating'
    ) THEN
        ALTER TABLE menu_items ADD COLUMN average_rating DECIMAL(3,2) DEFAULT NULL;
    END IF;
END $$;

-- Initialize existing menu items with review stats
UPDATE menu_items 
SET 
    review_count = 0,
    average_rating = NULL 
WHERE review_count IS NULL;

-- Create view for menu item reviews with diner info
CREATE OR REPLACE VIEW menu_item_reviews_with_diner AS
SELECT 
    mir.*,
    dp.email as diner_email,
    dp.display_name as diner_name,
    dp.profile_photo_url as diner_avatar,
    dp.total_points as diner_points,
    'Bronze' as diner_level -- Simple level system for now
FROM menu_item_reviews mir
JOIN diner_profiles dp ON mir.diner_id = dp.id
ORDER BY mir.created_at DESC;

-- Grant permissions
GRANT SELECT ON menu_item_reviews_with_diner TO authenticated, anon;
