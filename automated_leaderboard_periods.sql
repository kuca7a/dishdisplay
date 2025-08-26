-- Automated Leaderboard Period Management
-- This creates a system that automatically manages weekly periods

-- 1. Create a comprehensive period management function
CREATE OR REPLACE FUNCTION manage_leaderboard_periods()
RETURNS TABLE(
    action_taken TEXT,
    period_id UUID,
    start_date DATE,
    end_date DATE,
    status TEXT
) AS $$
DECLARE
    current_period_id UUID;
    current_monday DATE;
    current_sunday DATE;
    next_monday DATE;
    next_sunday DATE;
    closed_periods INTEGER;
    created_periods INTEGER := 0;
BEGIN
    -- Calculate current week dates (Monday to Sunday)
    current_monday := CURRENT_DATE - (EXTRACT(DOW FROM CURRENT_DATE)::INTEGER - 1);
    current_sunday := current_monday + 6;
    
    -- Calculate next week dates
    next_monday := current_monday + 7;
    next_sunday := next_monday + 6;
    
    -- 1. Close any expired periods
    UPDATE leaderboard_periods 
    SET status = 'completed', updated_at = NOW()
    WHERE status = 'active' AND end_date < current_monday;
    
    GET DIAGNOSTICS closed_periods = ROW_COUNT;
    
    -- Return info about closed periods
    IF closed_periods > 0 THEN
        RETURN QUERY
        SELECT 
            'CLOSED_EXPIRED'::TEXT as action_taken,
            id as period_id,
            start_date,
            end_date,
            status
        FROM leaderboard_periods 
        WHERE status = 'completed' AND end_date < current_monday
        ORDER BY end_date DESC;
    END IF;
    
    -- 2. Check if current period exists
    SELECT id INTO current_period_id
    FROM leaderboard_periods 
    WHERE start_date = current_monday AND end_date = current_sunday;
    
    -- 3. Create current period if it doesn't exist
    IF current_period_id IS NULL THEN
        INSERT INTO leaderboard_periods (start_date, end_date, status)
        VALUES (current_monday, current_sunday, 'active')
        RETURNING id INTO current_period_id;
        
        created_periods := created_periods + 1;
        
        RETURN QUERY
        SELECT 
            'CREATED_CURRENT'::TEXT as action_taken,
            current_period_id as period_id,
            current_monday as start_date,
            current_sunday as end_date,
            'active'::TEXT as status;
    END IF;
    
    -- 4. Create next week's period if it doesn't exist (for preparation)
    IF NOT EXISTS (
        SELECT 1 FROM leaderboard_periods 
        WHERE start_date = next_monday AND end_date = next_sunday
    ) THEN
        INSERT INTO leaderboard_periods (start_date, end_date, status)
        VALUES (next_monday, next_sunday, 'upcoming')
        RETURNING id INTO current_period_id;
        
        created_periods := created_periods + 1;
        
        RETURN QUERY
        SELECT 
            'CREATED_NEXT'::TEXT as action_taken,
            current_period_id as period_id,
            next_monday as start_date,
            next_sunday as end_date,
            'upcoming'::TEXT as status;
    END IF;
    
    -- 5. Activate upcoming periods that should be active now
    UPDATE leaderboard_periods 
    SET status = 'active', updated_at = NOW()
    WHERE status = 'upcoming' AND start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE;
    
    -- Return current active period info
    RETURN QUERY
    SELECT 
        'CURRENT_ACTIVE'::TEXT as action_taken,
        id as period_id,
        start_date,
        end_date,
        status
    FROM leaderboard_periods 
    WHERE status = 'active' AND CURRENT_DATE BETWEEN start_date AND end_date;
    
END;
$$ LANGUAGE plpgsql;

-- 2. Update get_current_leaderboard_period to use the new management function
CREATE OR REPLACE FUNCTION get_current_leaderboard_period()
RETURNS UUID AS $$
DECLARE
    current_period_id UUID;
BEGIN
    -- First, run period management to ensure periods are up to date
    PERFORM manage_leaderboard_periods();
    
    -- Get the current active period
    SELECT id INTO current_period_id
    FROM leaderboard_periods 
    WHERE status = 'active' AND CURRENT_DATE BETWEEN start_date AND end_date
    LIMIT 1;
    
    RETURN current_period_id;
END;
$$ LANGUAGE plpgsql;

-- 3. Create a trigger function that runs period management on any leaderboard activity
CREATE OR REPLACE FUNCTION ensure_current_period()
RETURNS TRIGGER AS $$
BEGIN
    -- Automatically manage periods when any leaderboard activity happens
    PERFORM manage_leaderboard_periods();
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 4. Add triggers to automatically manage periods
DROP TRIGGER IF EXISTS auto_manage_periods_on_points ON diner_points;
CREATE TRIGGER auto_manage_periods_on_points
    BEFORE INSERT ON diner_points
    FOR EACH STATEMENT EXECUTE FUNCTION ensure_current_period();

-- 5. Test the management function
SELECT * FROM manage_leaderboard_periods();

-- 6. Show current period status
SELECT 
    id,
    start_date,
    end_date,
    status,
    CASE 
        WHEN CURRENT_DATE BETWEEN start_date AND end_date THEN 'CURRENT WEEK'
        WHEN start_date > CURRENT_DATE THEN 'FUTURE'
        ELSE 'PAST'
    END as week_status,
    created_at,
    updated_at
FROM leaderboard_periods 
ORDER BY start_date DESC
LIMIT 5;
