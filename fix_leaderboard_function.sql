-- Fix for the GROUP BY error in update_leaderboard_rankings function

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
        ROW_NUMBER() OVER (ORDER BY total_points DESC, earned_at ASC) as rank
    FROM (
        SELECT 
            diner_email,
            SUM(points) as total_points,
            MIN(earned_at) as earned_at
        FROM diner_points 
        WHERE leaderboard_period_id = period_id
          AND diner_email IS NOT NULL
        GROUP BY diner_email
    ) ranked_diners;
    
    -- Mark the winner (rank 1)
    UPDATE leaderboard_rankings 
    SET is_winner = TRUE 
    WHERE leaderboard_period_id = period_id AND rank = 1;
END;
$$ LANGUAGE plpgsql;
