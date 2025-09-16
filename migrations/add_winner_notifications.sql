-- Winner Notifications System
-- This adds tracking for competition winners and notifications

-- Create winner notifications table
CREATE TABLE IF NOT EXISTS winner_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    period_id UUID NOT NULL REFERENCES leaderboard_periods(id) ON DELETE CASCADE,
    winner_email TEXT NOT NULL REFERENCES diner_profiles(email) ON DELETE CASCADE,
    total_points INTEGER NOT NULL DEFAULT 0,
    competition_start_date DATE NOT NULL,
    competition_end_date DATE NOT NULL,
    notification_seen BOOLEAN DEFAULT FALSE,
    notification_shown_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one notification per winner per period
    CONSTRAINT unique_winner_notification UNIQUE (period_id, winner_email)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_winner_notifications_email ON winner_notifications(winner_email);
CREATE INDEX IF NOT EXISTS idx_winner_notifications_period ON winner_notifications(period_id);
CREATE INDEX IF NOT EXISTS idx_winner_notifications_unseen ON winner_notifications(winner_email, notification_seen);

-- Enhanced period management function that creates winner notifications
CREATE OR REPLACE FUNCTION manage_leaderboard_periods()
RETURNS VOID AS $$
DECLARE
    expired_period_id UUID;
    expired_period RECORD;
    new_period_id UUID;
    current_monday DATE;
    current_sunday DATE;
BEGIN
    -- Get expired periods that haven't been processed yet
    FOR expired_period IN 
        SELECT id, start_date, end_date
        FROM leaderboard_periods 
        WHERE status = 'active' AND end_date < CURRENT_DATE
    LOOP
        -- Create winner notifications for this expired period
        INSERT INTO winner_notifications (
            period_id,
            winner_email,
            total_points,
            competition_start_date,
            competition_end_date,
            created_at
        )
        SELECT 
            expired_period.id,
            lr.diner_email,
            lr.total_points,
            expired_period.start_date,
            expired_period.end_date,
            NOW()
        FROM leaderboard_rankings lr
        WHERE lr.leaderboard_period_id = expired_period.id 
        AND lr.is_winner = TRUE
        ON CONFLICT (period_id, winner_email) DO NOTHING;
        
        RAISE NOTICE 'Created winner notification for period: % to %', expired_period.start_date, expired_period.end_date;
    END LOOP;
    
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

-- Function to mark winner notification as seen
CREATE OR REPLACE FUNCTION mark_winner_notification_seen(
    p_winner_email TEXT,
    p_period_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE winner_notifications
    SET notification_seen = TRUE,
        notification_shown_at = NOW()
    WHERE winner_email = p_winner_email 
    AND period_id = p_period_id
    AND notification_seen = FALSE;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to get unseen winner notifications for a user
CREATE OR REPLACE FUNCTION get_unseen_winner_notifications(p_email TEXT)
RETURNS TABLE (
    period_id UUID,
    total_points INTEGER,
    competition_start_date DATE,
    competition_end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        wn.period_id,
        wn.total_points,
        wn.competition_start_date,
        wn.competition_end_date,
        wn.created_at
    FROM winner_notifications wn
    WHERE wn.winner_email = p_email 
    AND wn.notification_seen = FALSE
    ORDER BY wn.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get all winner history for a user  
CREATE OR REPLACE FUNCTION get_winner_history(p_email TEXT)
RETURNS TABLE (
    period_id UUID,
    total_points INTEGER,
    competition_start_date DATE,
    competition_end_date DATE,
    won_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        wn.period_id,
        wn.total_points,
        wn.competition_start_date,
        wn.competition_end_date,
        wn.created_at as won_at
    FROM winner_notifications wn
    WHERE wn.winner_email = p_email 
    ORDER BY wn.created_at DESC;
END;
$$ LANGUAGE plpgsql;