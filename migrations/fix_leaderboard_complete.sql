-- Complete Leaderboard Fix
-- This fixes the ranking function and creates a simple manual trigger

-- 1. Fix the update_leaderboard_rankings function
CREATE OR REPLACE FUNCTION update_leaderboard_rankings(period_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Clear existing rankings for this period
    DELETE FROM leaderboard_rankings WHERE leaderboard_period_id = period_id;
    
    -- Calculate and insert new rankings
    INSERT INTO leaderboard_rankings (leaderboard_period_id, diner_id, total_points, rank)
    SELECT 
        period_id,
        diner_id,
        total_points,
        ROW_NUMBER() OVER (ORDER BY total_points DESC, min_earned_at ASC) as rank
    FROM (
        SELECT 
            diner_id,
            SUM(points) as total_points,
            MIN(earned_at) as min_earned_at
        FROM diner_points 
        WHERE leaderboard_period_id = period_id
        GROUP BY diner_id
    ) ranked_diners;
    
    -- Mark the winner (rank 1)
    UPDATE leaderboard_rankings 
    SET is_winner = TRUE 
    WHERE leaderboard_period_id = period_id AND rank = 1;
END;
$$ LANGUAGE plpgsql;

-- 2. Create a simpler manual ranking update function
CREATE OR REPLACE FUNCTION refresh_current_leaderboard()
RETURNS VOID AS $$
DECLARE
    current_period_id UUID;
BEGIN
    -- Get current active period
    SELECT id INTO current_period_id
    FROM leaderboard_periods 
    WHERE status = 'active' AND CURRENT_DATE BETWEEN start_date AND end_date
    LIMIT 1;
    
    -- Update rankings if period exists
    IF current_period_id IS NOT NULL THEN
        PERFORM update_leaderboard_rankings(current_period_id);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 3. Run the refresh to populate current rankings
SELECT refresh_current_leaderboard();
