-- Fix the update_leaderboard_rankings function
-- The original had a SQL syntax error in the GROUP BY clause

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
