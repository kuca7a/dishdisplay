-- Leaderboard System Migration
-- This creates the tables needed for the weekly diner leaderboard competition

-- Create leaderboard periods table
CREATE TABLE IF NOT EXISTS leaderboard_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'upcoming')),
    winner_restaurant_id UUID REFERENCES restaurants(id), -- Restaurant that gets to offer the prize
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure no overlapping periods
    CONSTRAINT unique_active_period EXCLUDE USING gist (
        daterange(start_date, end_date, '[]') WITH &&
    ) WHERE (status = 'active')
);

-- Create diner points tracking table
CREATE TABLE IF NOT EXISTS diner_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    diner_id UUID NOT NULL REFERENCES diner_profiles(id) ON DELETE CASCADE,
    leaderboard_period_id UUID NOT NULL REFERENCES leaderboard_periods(id) ON DELETE CASCADE,
    points INTEGER NOT NULL DEFAULT 0,
    earned_from VARCHAR(20) NOT NULL CHECK (earned_from IN ('visit', 'review')),
    source_id UUID, -- ID of the visit or review that earned the points
    restaurant_id UUID REFERENCES restaurants(id), -- Which restaurant this was earned at
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate points for the same source
    CONSTRAINT unique_points_per_source UNIQUE (source_id, earned_from, diner_id, leaderboard_period_id)
);

-- Create leaderboard rankings table (computed/cached rankings)
CREATE TABLE IF NOT EXISTS leaderboard_rankings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    leaderboard_period_id UUID NOT NULL REFERENCES leaderboard_periods(id) ON DELETE CASCADE,
    diner_id UUID NOT NULL REFERENCES diner_profiles(id) ON DELETE CASCADE,
    total_points INTEGER NOT NULL DEFAULT 0,
    rank INTEGER NOT NULL,
    is_winner BOOLEAN DEFAULT FALSE,
    prize_claimed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique rankings per period
    CONSTRAINT unique_diner_per_period UNIQUE (leaderboard_period_id, diner_id),
    CONSTRAINT unique_rank_per_period UNIQUE (leaderboard_period_id, rank)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_diner_points_period ON diner_points(leaderboard_period_id);
CREATE INDEX IF NOT EXISTS idx_diner_points_diner ON diner_points(diner_id);
CREATE INDEX IF NOT EXISTS idx_diner_points_earned_at ON diner_points(earned_at);
CREATE INDEX IF NOT EXISTS idx_leaderboard_periods_status ON leaderboard_periods(status);
CREATE INDEX IF NOT EXISTS idx_leaderboard_periods_dates ON leaderboard_periods(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rankings_period ON leaderboard_rankings(leaderboard_period_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rankings_rank ON leaderboard_rankings(leaderboard_period_id, rank);

-- Create function to automatically update rankings
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
        ROW_NUMBER() OVER (ORDER BY total_points DESC, MIN(earned_at) ASC) as rank
    FROM (
        SELECT 
            diner_id,
            SUM(points) as total_points,
            MIN(earned_at) as earned_at
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

-- Create function to get current active period
CREATE OR REPLACE FUNCTION get_current_leaderboard_period()
RETURNS UUID AS $$
DECLARE
    current_period_id UUID;
    current_monday DATE;
    current_sunday DATE;
BEGIN
    -- Check if there's an active period
    SELECT id INTO current_period_id
    FROM leaderboard_periods 
    WHERE status = 'active' AND CURRENT_DATE BETWEEN start_date AND end_date;
    
    IF current_period_id IS NOT NULL THEN
        RETURN current_period_id;
    END IF;
    
    -- Calculate current week (Monday to Sunday)
    current_monday := CURRENT_DATE - (EXTRACT(DOW FROM CURRENT_DATE)::INTEGER - 1);
    current_sunday := current_monday + 6;
    
    -- Create new period if none exists
    INSERT INTO leaderboard_periods (start_date, end_date, status)
    VALUES (current_monday, current_sunday, 'active')
    RETURNING id INTO current_period_id;
    
    RETURN current_period_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to award points
CREATE OR REPLACE FUNCTION award_diner_points(
    p_diner_id UUID,
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
        diner_id, 
        leaderboard_period_id, 
        points, 
        earned_from, 
        source_id, 
        restaurant_id
    )
    VALUES (
        p_diner_id, 
        period_id, 
        p_points, 
        p_earned_from, 
        p_source_id, 
        p_restaurant_id
    )
    ON CONFLICT (source_id, earned_from, diner_id, leaderboard_period_id) DO NOTHING
    RETURNING id INTO points_id;
    
    -- Update rankings if points were awarded
    IF points_id IS NOT NULL THEN
        PERFORM update_leaderboard_rankings(period_id);
    END IF;
    
    RETURN points_id;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update rankings when points change
CREATE OR REPLACE FUNCTION trigger_update_rankings()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_leaderboard_rankings(
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.leaderboard_period_id
            ELSE NEW.leaderboard_period_id
        END
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rankings_on_points_change
    AFTER INSERT OR UPDATE OR DELETE ON diner_points
    FOR EACH ROW EXECUTE FUNCTION trigger_update_rankings();

-- Enable RLS (Row Level Security)
ALTER TABLE leaderboard_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE diner_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_rankings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow read access to all authenticated users, write access for service role)
CREATE POLICY "Allow read access to leaderboard periods" ON leaderboard_periods
    FOR SELECT USING (true);

CREATE POLICY "Allow read access to diner points" ON diner_points
    FOR SELECT USING (true);

CREATE POLICY "Allow read access to leaderboard rankings" ON leaderboard_rankings
    FOR SELECT USING (true);

-- Service role policies for write operations
CREATE POLICY "Service role full access to leaderboard periods" ON leaderboard_periods
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to diner points" ON diner_points
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to leaderboard rankings" ON leaderboard_rankings
    FOR ALL USING (auth.role() = 'service_role');
