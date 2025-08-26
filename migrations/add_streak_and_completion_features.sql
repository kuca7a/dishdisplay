-- Add streak tracking fields to diner_profiles
ALTER TABLE diner_profiles 
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_visit_date DATE,
ADD COLUMN IF NOT EXISTS streak_updated_at TIMESTAMP WITH TIME ZONE;

-- Add profile completion tracking
ALTER TABLE diner_profiles 
ADD COLUMN IF NOT EXISTS profile_completion_bonus_claimed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS profile_completion_percentage INTEGER DEFAULT 0;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_diner_profiles_last_visit_date ON diner_profiles(last_visit_date);
CREATE INDEX IF NOT EXISTS idx_diner_profiles_current_streak ON diner_profiles(current_streak);

-- Update existing profiles to calculate completion percentage
UPDATE diner_profiles 
SET profile_completion_percentage = (
  CASE WHEN profile_photo_url IS NOT NULL THEN 25 ELSE 0 END +
  CASE WHEN bio IS NOT NULL AND LENGTH(bio) > 10 THEN 25 ELSE 0 END +
  CASE WHEN dietary_preferences IS NOT NULL THEN 25 ELSE 0 END +
  CASE WHEN location IS NOT NULL THEN 25 ELSE 0 END
);
