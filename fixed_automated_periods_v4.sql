-- Fixed Automated Leaderboard Period Management (Version 4)
-- This resolves the ambiguous column reference by using table aliases

-- 1. First, let's see what periods currently exist
SELECT 
    lp.id,
    lp.start_date,
    lp.end_date,
    lp.status,
    CASE 
        WHEN CURRENT_DATE BETWEEN lp.start_date AND lp.end_date THEN 'CURRENT'
        WHEN lp.start_date > CURRENT_DATE THEN 'FUTURE'
        ELSE 'PAST'
    END as period_status
FROM leaderboard_periods lp
ORDER BY lp.start_date DESC;

-- 2. Clean up any conflicting periods first
UPDATE leaderboard_periods 
SET status = 'completed'
WHERE leaderboard_periods.status = 'active' AND leaderboard_periods.end_date < CURRENT_DATE;

-- 3. Handle any current active periods that might conflict
DO $$
DECLARE
    current_monday DATE;
    current_sunday DATE;
    existing_active_period UUID;
BEGIN
    -- Calculate current week (Monday to Sunday)
    current_monday := CURRENT_DATE - (EXTRACT(DOW FROM CURRENT_DATE)::INTEGER - 1);
    current_sunday := current_monday + 6;
    
    -- Check if there's an active period that overlaps with our target week
    SELECT lp.id INTO existing_active_period
    FROM leaderboard_periods lp
    WHERE lp.status = 'active' 
      AND (
        (lp.start_date <= current_monday AND lp.end_date >= current_monday) OR
        (lp.start_date <= current_sunday AND lp.end_date >= current_sunday) OR
        (lp.start_date >= current_monday AND lp.end_date <= current_sunday)
      );
    
    -- If there's a conflicting active period, complete it
    IF existing_active_period IS NOT NULL THEN
        UPDATE leaderboard_periods 
        SET status = 'completed'
        WHERE id = existing_active_period;
        
        RAISE NOTICE 'Completed conflicting period: %', existing_active_period;
    END IF;
END $$;

-- 4. Create the simplified period management function
CREATE OR REPLACE FUNCTION manage_leaderboard_periods()
RETURNS TABLE(
    action_taken TEXT,
    period_id UUID,
    period_start_date DATE,
    period_end_date DATE,
    period_status TEXT
) AS $$
DECLARE
    current_period_id UUID;
    current_monday DATE;
    current_sunday DATE;
    next_monday DATE;
    next_sunday DATE;
BEGIN
    -- Calculate current week dates (Monday to Sunday)
    current_monday := CURRENT_DATE - (EXTRACT(DOW FROM CURRENT_DATE)::INTEGER - 1);
    current_sunday := current_monday + 6;
    
    -- Calculate next week dates
    next_monday := current_monday + 7;
    next_sunday := next_monday + 6;
    
    -- 1. Close any expired periods (use table alias)
    UPDATE leaderboard_periods lp
    SET status = 'completed', updated_at = NOW()
    WHERE lp.status = 'active' AND lp.end_date < CURRENT_DATE;
    
    -- 2. Close any active periods that don't match current week exactly
    UPDATE leaderboard_periods lp
    SET status = 'completed', updated_at = NOW()
    WHERE lp.status = 'active' 
      AND NOT (lp.start_date = current_monday AND lp.end_date = current_sunday);
    
    -- 3. Check if current period exists
    SELECT lp.id INTO current_period_id
    FROM leaderboard_periods lp
    WHERE lp.start_date = current_monday AND lp.end_date = current_sunday;
    
    -- 4. Create current period if it doesn't exist
    IF current_period_id IS NULL THEN
        INSERT INTO leaderboard_periods (start_date, end_date, status)
        VALUES (current_monday, current_sunday, 'active')
        RETURNING id INTO current_period_id;
        
        RETURN QUERY
        SELECT 
            'CREATED_CURRENT'::TEXT as action_taken,
            current_period_id as period_id,
            current_monday as period_start_date,
            current_sunday as period_end_date,
            'active'::TEXT as period_status;
    ELSE
        -- Update existing period to active if it's not
        UPDATE leaderboard_periods lp
        SET status = 'active', updated_at = NOW()
        WHERE lp.id = current_period_id AND lp.status != 'active';
    END IF;
    
    -- 5. Create next week's period if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM leaderboard_periods lp
        WHERE lp.start_date = next_monday AND lp.end_date = next_sunday
    ) THEN
        INSERT INTO leaderboard_periods (start_date, end_date, status)
        VALUES (next_monday, next_sunday, 'upcoming')
        RETURNING id INTO current_period_id;
        
        RETURN QUERY
        SELECT 
            'CREATED_NEXT'::TEXT as action_taken,
            current_period_id as period_id,
            next_monday as period_start_date,
            next_sunday as period_end_date,
            'upcoming'::TEXT as period_status;
    END IF;
    
    -- Return current active period info
    RETURN QUERY
    SELECT 
        'CURRENT_ACTIVE'::TEXT as action_taken,
        lp.id as period_id,
        lp.start_date as period_start_date,
        lp.end_date as period_end_date,
        lp.status as period_status
    FROM leaderboard_periods lp
    WHERE lp.status = 'active' AND CURRENT_DATE BETWEEN lp.start_date AND lp.end_date;
    
END;
$$ LANGUAGE plpgsql;

-- 5. Update get_current_leaderboard_period to use the new management function
CREATE OR REPLACE FUNCTION get_current_leaderboard_period()
RETURNS UUID AS $$
DECLARE
    current_period_id UUID;
BEGIN
    -- First, run period management to ensure periods are up to date
    PERFORM manage_leaderboard_periods();
    
    -- Get the current active period
    SELECT lp.id INTO current_period_id
    FROM leaderboard_periods lp
    WHERE lp.status = 'active' AND CURRENT_DATE BETWEEN lp.start_date AND lp.end_date
    LIMIT 1;
    
    RETURN current_period_id;
END;
$$ LANGUAGE plpgsql;

-- 6. Test the management function
SELECT * FROM manage_leaderboard_periods();

-- 7. Show final period status
SELECT 
    lp.id,
    lp.start_date,
    lp.end_date,
    lp.status,
    CASE 
        WHEN CURRENT_DATE BETWEEN lp.start_date AND lp.end_date THEN 'CURRENT WEEK'
        WHEN lp.start_date > CURRENT_DATE THEN 'FUTURE'
        ELSE 'PAST'
    END as week_status,
    lp.created_at,
    lp.updated_at
FROM leaderboard_periods lp
ORDER BY lp.start_date DESC
LIMIT 5;
