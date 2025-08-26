-- Fix Diner Profile and Leaderboard Schema Issues
-- This migration addresses the schema mismatches and missing columns

-- 1. Add missing display_name column to diner_profiles
ALTER TABLE diner_profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- 2. Update any existing profiles without display_name (use email prefix)
UPDATE diner_profiles 
SET display_name = SPLIT_PART(email, '@', 1)
WHERE display_name IS NULL OR display_name = '';

-- 3. Make display_name NOT NULL after setting defaults
ALTER TABLE diner_profiles 
ALTER COLUMN display_name SET NOT NULL;

-- 4. Update total_visits field for existing profile (if any)
UPDATE diner_profiles 
SET total_visits = 1 
WHERE total_visits = 0 AND email = 'hdcatalyst@gmail.com';

-- 5. Update total_points field based on activities (if any exist)
UPDATE diner_profiles 
SET total_points = 35  -- Example: 10 points for visit + 25 points for review
WHERE email = 'hdcatalyst@gmail.com' AND total_points = 0;

-- 6. Fix the leaderboard system to work with the existing diner_profiles structure
-- Drop the existing foreign key constraint in diner_points
ALTER TABLE diner_points 
DROP CONSTRAINT IF EXISTS diner_points_diner_id_fkey;

-- Add a new column for diner_email (to match the existing system)
ALTER TABLE diner_points 
ADD COLUMN IF NOT EXISTS diner_email TEXT;

-- Update the foreign key to reference email instead of id
ALTER TABLE diner_points 
ADD CONSTRAINT diner_points_diner_email_fkey 
FOREIGN KEY (diner_email) REFERENCES diner_profiles(email) ON DELETE CASCADE;

-- Do the same for leaderboard_rankings
ALTER TABLE leaderboard_rankings 
DROP CONSTRAINT IF EXISTS leaderboard_rankings_diner_id_fkey;

ALTER TABLE leaderboard_rankings 
ADD COLUMN IF NOT EXISTS diner_email TEXT;

ALTER TABLE leaderboard_rankings 
ADD CONSTRAINT leaderboard_rankings_diner_email_fkey 
FOREIGN KEY (diner_email) REFERENCES diner_profiles(email) ON DELETE CASCADE;

-- Update unique constraints to use email instead of diner_id
ALTER TABLE diner_points 
DROP CONSTRAINT IF EXISTS unique_points_per_source;

ALTER TABLE diner_points 
ADD CONSTRAINT unique_points_per_source 
UNIQUE (source_id, earned_from, diner_email, leaderboard_period_id);

ALTER TABLE leaderboard_rankings 
DROP CONSTRAINT IF EXISTS unique_diner_per_period;

ALTER TABLE leaderboard_rankings 
ADD CONSTRAINT unique_diner_per_period 
UNIQUE (leaderboard_period_id, diner_email);

-- 7. Update the leaderboard functions to use email instead of UUID
CREATE OR REPLACE FUNCTION update_leaderboard_rankings(period_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Clear existing rankings for this period
    DELETE FROM leaderboard_rankings WHERE leaderboard_period_id = period_id;
    
    -- Calculate and insert new rankings
    INSERT INTO leaderboard_rankings (leaderboard_period_id, diner_email, total_points, rank)
    SELECT 
        period_id,
        diner_email,
        total_points,
        ROW_NUMBER() OVER (ORDER BY total_points DESC, MIN(earned_at) ASC) as rank
    FROM (
        SELECT 
            diner_email,
            SUM(points) as total_points,
            MIN(earned_at) as earned_at
        FROM diner_points 
        WHERE leaderboard_period_id = period_id
        GROUP BY diner_email
    ) ranked_diners;
    
    -- Mark the winner (rank 1)
    UPDATE leaderboard_rankings 
    SET is_winner = TRUE 
    WHERE leaderboard_period_id = period_id AND rank = 1;
END;
$$ LANGUAGE plpgsql;

-- 8. Update the award points function to use email
CREATE OR REPLACE FUNCTION award_diner_points(
    p_diner_email TEXT,
    p_points INTEGER,
    p_earned_from VARCHAR(20),
    p_source_id UUID,
    p_restaurant_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    period_id UUID;
    points_id UUID;
BEGIN
    -- Get current active period
    period_id := get_current_leaderboard_period();
    
    -- Insert points (will fail if duplicate due to unique constraint)
    INSERT INTO diner_points (
        diner_email, 
        leaderboard_period_id, 
        points, 
        earned_from, 
        source_id, 
        restaurant_id
    )
    VALUES (
        p_diner_email, 
        period_id, 
        p_points, 
        p_earned_from, 
        p_source_id, 
        p_restaurant_id
    )
    ON CONFLICT (source_id, earned_from, diner_email, leaderboard_period_id) DO NOTHING
    RETURNING id INTO points_id;
    
    -- Update rankings if points were awarded
    IF points_id IS NOT NULL THEN
        PERFORM update_leaderboard_rankings(period_id);
    END IF;
    
    RETURN points_id;
END;
$$ LANGUAGE plpgsql;

-- 9. Add some sample points for testing (if profile exists)
DO $$
DECLARE
    current_period_id UUID;
    diner_exists BOOLEAN;
BEGIN
    -- Check if the diner profile exists
    SELECT EXISTS(SELECT 1 FROM diner_profiles WHERE email = 'hdcatalyst@gmail.com') INTO diner_exists;
    
    IF diner_exists THEN
        -- Get or create current period
        current_period_id := get_current_leaderboard_period();
        
        -- Award some sample points
        PERFORM award_diner_points(
            'hdcatalyst@gmail.com',
            10,
            'visit',
            gen_random_uuid(),
            NULL
        );
        
        PERFORM award_diner_points(
            'hdcatalyst@gmail.com',
            25,
            'review',
            gen_random_uuid(),
            NULL
        );
    END IF;
END $$;

-- 10. Update indexes to use the new email-based structure
DROP INDEX IF EXISTS idx_diner_points_diner;
CREATE INDEX IF NOT EXISTS idx_diner_points_diner_email ON diner_points(diner_email);

-- 11. Update RLS policies to work with email-based structure
DROP POLICY IF EXISTS "Authenticated users can create diner points" ON diner_points;
CREATE POLICY "Authenticated users can create diner points" ON diner_points
    FOR INSERT WITH CHECK (auth.email() = diner_email OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Authenticated users can read diner points" ON diner_points;
CREATE POLICY "Authenticated users can read diner points" ON diner_points
    FOR SELECT USING (auth.email() = diner_email OR auth.role() = 'service_role' OR true);

DROP POLICY IF EXISTS "Authenticated users can read leaderboard rankings" ON leaderboard_rankings;
CREATE POLICY "Authenticated users can read leaderboard rankings" ON leaderboard_rankings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create leaderboard rankings" ON leaderboard_rankings;
CREATE POLICY "Authenticated users can create leaderboard rankings" ON leaderboard_rankings
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Authenticated users can update leaderboard rankings" ON leaderboard_rankings;
CREATE POLICY "Authenticated users can update leaderboard rankings" ON leaderboard_rankings
    FOR UPDATE USING (auth.role() = 'service_role');
