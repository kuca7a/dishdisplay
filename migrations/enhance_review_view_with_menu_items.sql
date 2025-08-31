-- Enhance the menu_item_reviews_with_diner view to include menu item details
DROP VIEW IF EXISTS menu_item_reviews_with_diner;

CREATE OR REPLACE VIEW menu_item_reviews_with_diner AS
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
    COALESCE(dp.profile_photo_url, '') as diner_avatar,
    dp.total_points as diner_points,
    'Bronze' as diner_level,
    -- Add menu item details
    mi.name as menu_item_name,
    mi.description as menu_item_description,
    mi.price as menu_item_price,
    mi.image_url as menu_item_image_url,
    mi.category as menu_item_category
FROM menu_item_reviews mir
JOIN diner_profiles dp ON mir.diner_id = dp.id
JOIN menu_items mi ON mir.menu_item_id = mi.id
ORDER BY mir.created_at DESC;

-- Grant permissions
GRANT SELECT ON menu_item_reviews_with_diner TO authenticated, anon;
