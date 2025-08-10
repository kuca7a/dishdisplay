-- Add location and hours fields to restaurants table
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(50),
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS country VARCHAR(50),
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8),
ADD COLUMN IF NOT EXISTS monday_hours VARCHAR(50),
ADD COLUMN IF NOT EXISTS tuesday_hours VARCHAR(50),
ADD COLUMN IF NOT EXISTS wednesday_hours VARCHAR(50),
ADD COLUMN IF NOT EXISTS thursday_hours VARCHAR(50),
ADD COLUMN IF NOT EXISTS friday_hours VARCHAR(50),
ADD COLUMN IF NOT EXISTS saturday_hours VARCHAR(50),
ADD COLUMN IF NOT EXISTS sunday_hours VARCHAR(50),
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50);

-- Verify the changes
SELECT column_name, data_type, character_maximum_length, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'restaurants' 
AND table_schema = 'public'
ORDER BY ordinal_position;
