-- Fix Leaderboard Period Dates - Create Current Active Period
-- Today is Aug 26, 2025, so we need a current week period

-- 1. First, close the old period that has ended
UPDATE leaderboard_periods 
SET status = 'completed' 
WHERE status = 'active' AND end_date < CURRENT_DATE;

-- 2. Create a new active period for the current week (Aug 26 - Sep 1, 2025)
-- Monday Aug 26 to Sunday Sep 1
INSERT INTO leaderboard_periods (start_date, end_date, status)
VALUES ('2025-08-26', '2025-09-01', 'active')
ON CONFLICT DO NOTHING;

-- 3. Update the get_current_leaderboard_period function to be more robust
CREATE OR REPLACE FUNCTION get_current_leaderboard_period()
RETURNS UUID AS $$
DECLARE
    current_period_id UUID;
    current_monday DATE;
    current_sunday DATE;
BEGIN
    -- Check if there's an active period that includes today
    SELECT id INTO current_period_id
    FROM leaderboard_periods 
    WHERE status = 'active' AND CURRENT_DATE BETWEEN start_date AND end_date;
    
    IF current_period_id IS NOT NULL THEN
        RETURN current_period_id;
    END IF;
    
    -- Close any periods that have ended
    UPDATE leaderboard_periods 
    SET status = 'completed' 
    WHERE status = 'active' AND end_date < CURRENT_DATE;
    
    -- Calculate current week (Monday to Sunday)
    -- For Aug 26, 2025 (Monday), the week should be Aug 26 - Sep 1
    current_monday := CURRENT_DATE - (EXTRACT(DOW FROM CURRENT_DATE)::INTEGER - 1);
    current_sunday := current_monday + 6;
    
    -- Create new period if none exists
    INSERT INTO leaderboard_periods (start_date, end_date, status)
    VALUES (current_monday, current_sunday, 'active')
    ON CONFLICT DO NOTHING
    RETURNING id INTO current_period_id;
    
    -- If we couldn't insert (due to conflict), try to get the existing one
    IF current_period_id IS NULL THEN
        SELECT id INTO current_period_id
        FROM leaderboard_periods 
        WHERE start_date = current_monday AND end_date = current_sunday;
    END IF;
    
    RETURN current_period_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Test the function and get the current period
SELECT get_current_leaderboard_period() as current_period_id;

-- 5. Show all periods to verify
SELECT 
    id,
    start_date,
    end_date,
    status,
    CASE 
        WHEN CURRENT_DATE BETWEEN start_date AND end_date THEN 'CURRENT'
        WHEN CURRENT_DATE > end_date THEN 'PAST'
        ELSE 'FUTURE'
    END as period_status
FROM leaderboard_periods 
ORDER BY start_date DESC;
