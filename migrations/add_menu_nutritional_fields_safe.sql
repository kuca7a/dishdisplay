-- Safe Migration: Add nutritional information fields to menu_items table
-- Date: 2025-08-20
-- Description: Add required fields for detailed_description, calories, allergens, and ingredients
-- This version checks for existing columns before adding them

-- Add new required columns to menu_items table (only if they don't exist)
DO $$ 
BEGIN
    -- Add detailed_description if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'menu_items' AND column_name = 'detailed_description') THEN
        ALTER TABLE menu_items ADD COLUMN detailed_description TEXT;
    END IF;
    
    -- Add calories if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'menu_items' AND column_name = 'calories') THEN
        ALTER TABLE menu_items ADD COLUMN calories INTEGER;
    END IF;
    
    -- Add allergens if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'menu_items' AND column_name = 'allergens') THEN
        ALTER TABLE menu_items ADD COLUMN allergens JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    -- Add ingredients if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'menu_items' AND column_name = 'ingredients') THEN
        ALTER TABLE menu_items ADD COLUMN ingredients TEXT;
    END IF;
END $$;

-- Update existing items with default values for any NULL fields
UPDATE menu_items 
SET 
  detailed_description = COALESCE(detailed_description, COALESCE(description, 'This delicious item is prepared with care using quality ingredients to ensure a delightful dining experience.')),
  calories = COALESCE(calories, 350),
  allergens = COALESCE(allergens, '[]'::jsonb),
  ingredients = COALESCE(ingredients, 'Quality ingredients carefully selected and prepared fresh.')
WHERE detailed_description IS NULL 
   OR calories IS NULL 
   OR allergens IS NULL 
   OR ingredients IS NULL;

-- Make the new columns NOT NULL after setting default values (only if not already set)
DO $$
BEGIN
    -- Set NOT NULL constraints if they don't exist
    BEGIN
        ALTER TABLE menu_items ALTER COLUMN detailed_description SET NOT NULL;
    EXCEPTION
        WHEN others THEN NULL; -- Ignore if constraint already exists
    END;
    
    BEGIN
        ALTER TABLE menu_items ALTER COLUMN calories SET NOT NULL;
    EXCEPTION
        WHEN others THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE menu_items ALTER COLUMN allergens SET NOT NULL;
    EXCEPTION
        WHEN others THEN NULL;
    END;
    
    BEGIN
        ALTER TABLE menu_items ALTER COLUMN ingredients SET NOT NULL;
    EXCEPTION
        WHEN others THEN NULL;
    END;
END $$;

-- Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_menu_items_allergens ON menu_items USING GIN (allergens);
CREATE INDEX IF NOT EXISTS idx_menu_items_calories ON menu_items (calories);

-- Add constraints if they don't exist
DO $$
BEGIN
    -- Add positive calories constraint
    BEGIN
        ALTER TABLE menu_items ADD CONSTRAINT chk_calories_positive CHECK (calories > 0);
    EXCEPTION
        WHEN duplicate_object THEN NULL; -- Ignore if constraint already exists
    END;
    
    -- Add non-empty detailed description constraint
    BEGIN
        ALTER TABLE menu_items ADD CONSTRAINT chk_detailed_description_not_empty CHECK (char_length(detailed_description) > 0);
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
    
    -- Add non-empty ingredients constraint
    BEGIN
        ALTER TABLE menu_items ADD CONSTRAINT chk_ingredients_not_empty CHECK (char_length(ingredients) > 0);
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
END $$;
