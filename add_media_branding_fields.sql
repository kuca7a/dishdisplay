-- Add media and branding fields to restaurants table
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
ADD COLUMN IF NOT EXISTS primary_color VARCHAR(7),
ADD COLUMN IF NOT EXISTS secondary_color VARCHAR(7),
ADD COLUMN IF NOT EXISTS accent_color VARCHAR(7),
ADD COLUMN IF NOT EXISTS font_family VARCHAR(50),
ADD COLUMN IF NOT EXISTS theme_style VARCHAR(20),
ADD COLUMN IF NOT EXISTS social_facebook VARCHAR(255),
ADD COLUMN IF NOT EXISTS social_instagram VARCHAR(255),
ADD COLUMN IF NOT EXISTS social_twitter VARCHAR(255),
ADD COLUMN IF NOT EXISTS social_linkedin VARCHAR(255),
ADD COLUMN IF NOT EXISTS social_tiktok VARCHAR(255);

-- Verify the changes
SELECT column_name, data_type, character_maximum_length, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'restaurants' 
AND table_schema = 'public'
ORDER BY ordinal_position;
