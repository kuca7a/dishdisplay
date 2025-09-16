-- Period Management Functions
-- This adds automatic weekly period transitions and management

-- Drop existing functions first to avoid conflicts
DROP FUNCTION IF EXISTS manage_leaderboard_periods();
DROP FUNCTION IF EXISTS get_current_leaderboard_period();
DROP FUNCTION IF EXISTS start_new_leaderboard_period(BOOLEAN);
DROP FUNCTION IF EXISTS cleanup_old_periods();

-- Function to complete expired periods and create new ones
CREATE OR REPLACE FUNCTION manage_leaderboard_periods()
RETURNS VOID AS $$
DECLARE
    expired_period_id UUID;
    new_period_id UUID;
    current_monday DATE;
    current_sunday DATE;
BEGIN
    -- Mark any expired periods as completed
    UPDATE leaderboard_periods 
    SET status = 'completed', updated_at = NOW()
    WHERE status = 'active' AND end_date < CURRENT_DATE;
    
    -- Check if we have an active period for the current date
    SELECT id INTO expired_period_id
    FROM leaderboard_periods 
    WHERE status = 'active' AND CURRENT_DATE BETWEEN start_date AND end_date;
    
    -- If no active period exists for current date, create one
    IF expired_period_id IS NULL THEN
        -- Calculate current week (Monday to Sunday)
        current_monday := CURRENT_DATE - (EXTRACT(DOW FROM CURRENT_DATE)::INTEGER - 1);
        current_sunday := current_monday + 6;
        
        -- Create new active period
        INSERT INTO leaderboard_periods (start_date, end_date, status)
        VALUES (current_monday, current_sunday, 'active')
        RETURNING id INTO new_period_id;
        
        RAISE NOTICE 'Created new leaderboard period: % to %', current_monday, current_sunday;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Enhanced function to get current period with automatic management
CREATE OR REPLACE FUNCTION get_current_leaderboard_period()
RETURNS UUID AS $$
DECLARE
    current_period_id UUID;
BEGIN
    -- First, manage periods (complete expired, create new if needed)
    PERFORM manage_leaderboard_periods();
    
    -- Get the active period
    SELECT id INTO current_period_id
    FROM leaderboard_periods 
    WHERE status = 'active' AND CURRENT_DATE BETWEEN start_date AND end_date
    LIMIT 1;
    
    RETURN current_period_id;
END;
$$ LANGUAGE plpgsql;

-- Function to force start a new weekly period (useful for testing or manual management)
CREATE OR REPLACE FUNCTION start_new_leaderboard_period(force_new BOOLEAN DEFAULT FALSE)
RETURNS UUID AS $$
DECLARE
    current_period_id UUID;
    new_period_id UUID;
    current_monday DATE;
    current_sunday DATE;
BEGIN
    IF force_new THEN
        -- Mark current active period as completed
        UPDATE leaderboard_periods 
        SET status = 'completed', updated_at = NOW()
        WHERE status = 'active';
    END IF;
    
    -- Calculate current week (Monday to Sunday)
    current_monday := CURRENT_DATE - (EXTRACT(DOW FROM CURRENT_DATE)::INTEGER - 1);
    current_sunday := current_monday + 6;
    
    -- Create new active period
    INSERT INTO leaderboard_periods (start_date, end_date, status)
    VALUES (current_monday, current_sunday, 'active')
    ON CONFLICT DO NOTHING
    RETURNING id INTO new_period_id;
    
    -- If insert failed due to conflict, get existing period
    IF new_period_id IS NULL THEN
        SELECT id INTO new_period_id
        FROM leaderboard_periods 
        WHERE start_date = current_monday AND end_date = current_sunday
        LIMIT 1;
    END IF;
    
    RETURN new_period_id;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old completed periods (keep last 4 weeks for history)
CREATE OR REPLACE FUNCTION cleanup_old_periods()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete periods older than 4 weeks, but keep at least completed ones
    WITH old_periods AS (
        SELECT id 
        FROM leaderboard_periods 
        WHERE status = 'completed' 
        AND end_date < CURRENT_DATE - INTERVAL '4 weeks'
        ORDER BY end_date DESC
        OFFSET 4  -- Keep at least 4 most recent completed periods
    )
    DELETE FROM leaderboard_periods 
    WHERE id IN (SELECT id FROM old_periods);
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Initialize: Run period management to ensure we have current period
SELECT manage_leaderboard_periods();