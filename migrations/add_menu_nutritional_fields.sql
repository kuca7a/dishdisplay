-- Migration: Add nutritional information fields to menu_items table
-- Date: 2025-08-20
-- Description: Add required fields for detailed_description, calories, allergens, and ingredients

-- Add new required columns to menu_items table
ALTER TABLE menu_items 
ADD COLUMN detailed_description TEXT,
ADD COLUMN calories INTEGER,
ADD COLUMN allergens JSONB DEFAULT '[]'::jsonb,
ADD COLUMN ingredients TEXT;

-- Update existing items with default values (you may want to customize these)
UPDATE menu_items 
SET 
  detailed_description = COALESCE(description, 'This delicious item is prepared with care using quality ingredients to ensure a delightful dining experience.'),
  calories = 350, -- Default calories, should be updated by restaurant owners
  allergens = '[]'::jsonb, -- Empty array for allergens
  ingredients = 'Quality ingredients carefully selected and prepared fresh.'
WHERE detailed_description IS NULL;

-- Make the new columns NOT NULL after setting default values
ALTER TABLE menu_items 
ALTER COLUMN detailed_description SET NOT NULL,
ALTER COLUMN calories SET NOT NULL,
ALTER COLUMN allergens SET NOT NULL,
ALTER COLUMN ingredients SET NOT NULL;

-- Add some helpful indexes
CREATE INDEX idx_menu_items_allergens ON menu_items USING GIN (allergens);
CREATE INDEX idx_menu_items_calories ON menu_items (calories);

-- Add constraints to ensure data integrity
ALTER TABLE menu_items 
ADD CONSTRAINT chk_calories_positive CHECK (calories > 0),
ADD CONSTRAINT chk_detailed_description_not_empty CHECK (char_length(detailed_description) > 0),
ADD CONSTRAINT chk_ingredients_not_empty CHECK (char_length(ingredients) > 0);
