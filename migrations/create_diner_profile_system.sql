-- Migration: Create Diner Profile System
-- This creates all tables needed for the diner profile, visit tracking, and review system

-- 1. Diner Profiles Table
CREATE TABLE IF NOT EXISTS diner_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    profile_photo_url TEXT,
    join_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_visits INTEGER NOT NULL DEFAULT 0,
    total_points INTEGER NOT NULL DEFAULT 0,
    is_public BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Visit Tokens Table (OVT System)
CREATE TABLE IF NOT EXISTS visit_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    table_identifier TEXT, -- Optional: table number, section, etc.
    bill_identifier TEXT,  -- Optional: bill/receipt number
    token_hash TEXT UNIQUE NOT NULL, -- Hashed JWT token for security
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_redeemed BOOLEAN NOT NULL DEFAULT false,
    redeemed_by TEXT, -- diner email who redeemed it
    redeemed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Diner Visits Table
CREATE TABLE IF NOT EXISTS diner_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diner_email TEXT NOT NULL REFERENCES diner_profiles(email) ON DELETE CASCADE,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    visit_token_id UUID NOT NULL REFERENCES visit_tokens(id) ON DELETE CASCADE,
    visit_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    points_earned INTEGER NOT NULL DEFAULT 10, -- Base points for a visit
    dishes_viewed JSONB, -- Array of menu item IDs viewed
    time_spent_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one visit per token
    UNIQUE(visit_token_id)
);

-- 4. Diner Reviews Table
CREATE TABLE IF NOT EXISTS diner_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diner_email TEXT NOT NULL REFERENCES diner_profiles(email) ON DELETE CASCADE,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    visit_id UUID NOT NULL REFERENCES diner_visits(id) ON DELETE CASCADE,
    
    -- Public review fields
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT,
    photo_urls JSONB, -- Array of photo URLs
    is_public BOOLEAN NOT NULL DEFAULT true,
    
    -- Private structured feedback (restaurant dashboard only)
    service_speed_rating INTEGER CHECK (service_speed_rating >= 1 AND service_speed_rating <= 5),
    cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
    food_quality_rating INTEGER CHECK (food_quality_rating >= 1 AND food_quality_rating <= 5),
    value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
    ambiance_rating INTEGER CHECK (ambiance_rating >= 1 AND ambiance_rating <= 5),
    private_tags JSONB, -- Array of structured tags
    would_recommend BOOLEAN NOT NULL DEFAULT true,
    
    points_earned INTEGER NOT NULL DEFAULT 25, -- Points for leaving a review
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one review per visit
    UNIQUE(visit_id)
);

-- 5. Competition Entries Table
CREATE TABLE IF NOT EXISTS competition_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diner_email TEXT NOT NULL REFERENCES diner_profiles(email) ON DELETE CASCADE,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    competition_week TEXT NOT NULL, -- Format: "2025-W03"
    total_points INTEGER NOT NULL DEFAULT 0,
    rank INTEGER,
    prize_won TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one entry per diner per restaurant per week
    UNIQUE(diner_email, restaurant_id, competition_week)
);

-- 6. Diner Badges Table
CREATE TABLE IF NOT EXISTS diner_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diner_email TEXT NOT NULL REFERENCES diner_profiles(email) ON DELETE CASCADE,
    badge_type TEXT NOT NULL CHECK (badge_type IN ('first_visit', 'frequent_visitor', 'reviewer', 'photographer', 'explorer', 'champion')),
    badge_name TEXT NOT NULL,
    badge_description TEXT NOT NULL,
    icon_url TEXT,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL, -- NULL for global badges
    
    -- Prevent duplicate badges
    UNIQUE(diner_email, badge_type, restaurant_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_diner_profiles_email ON diner_profiles(email);
CREATE INDEX IF NOT EXISTS idx_visit_tokens_restaurant_id ON visit_tokens(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_visit_tokens_expires_at ON visit_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_visit_tokens_token_hash ON visit_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_diner_visits_diner_email ON diner_visits(diner_email);
CREATE INDEX IF NOT EXISTS idx_diner_visits_restaurant_id ON diner_visits(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_diner_visits_visit_date ON diner_visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_diner_reviews_diner_email ON diner_reviews(diner_email);
CREATE INDEX IF NOT EXISTS idx_diner_reviews_restaurant_id ON diner_reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_diner_reviews_is_public ON diner_reviews(is_public);
CREATE INDEX IF NOT EXISTS idx_competition_entries_week ON competition_entries(competition_week);
CREATE INDEX IF NOT EXISTS idx_competition_entries_restaurant_id ON competition_entries(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_diner_badges_diner_email ON diner_badges(diner_email);

-- Create functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_diner_profiles_updated_at BEFORE UPDATE ON diner_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_diner_visits_updated_at BEFORE UPDATE ON diner_visits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_diner_reviews_updated_at BEFORE UPDATE ON diner_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_competition_entries_updated_at BEFORE UPDATE ON competition_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update diner stats when visits/reviews are added
CREATE OR REPLACE FUNCTION update_diner_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total visits and points
    UPDATE diner_profiles 
    SET 
        total_visits = (
            SELECT COUNT(*) 
            FROM diner_visits 
            WHERE diner_email = COALESCE(NEW.diner_email, OLD.diner_email)
        ),
        total_points = (
            SELECT COALESCE(SUM(points_earned), 0) 
            FROM diner_visits 
            WHERE diner_email = COALESCE(NEW.diner_email, OLD.diner_email)
        ) + (
            SELECT COALESCE(SUM(points_earned), 0) 
            FROM diner_reviews 
            WHERE diner_email = COALESCE(NEW.diner_email, OLD.diner_email)
        )
    WHERE email = COALESCE(NEW.diner_email, OLD.diner_email);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Add triggers to update stats
CREATE TRIGGER update_diner_stats_on_visit AFTER INSERT OR UPDATE OR DELETE ON diner_visits FOR EACH ROW EXECUTE FUNCTION update_diner_stats();
CREATE TRIGGER update_diner_stats_on_review AFTER INSERT OR UPDATE OR DELETE ON diner_reviews FOR EACH ROW EXECUTE FUNCTION update_diner_stats();

-- Enable Row Level Security (RLS)
ALTER TABLE diner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE diner_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE diner_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE diner_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Diner Profiles
CREATE POLICY "Diners can view their own profile" ON diner_profiles FOR SELECT USING (auth.email() = email);
CREATE POLICY "Diners can update their own profile" ON diner_profiles FOR UPDATE USING (auth.email() = email);
CREATE POLICY "Diners can create their own profile" ON diner_profiles FOR INSERT WITH CHECK (auth.email() = email);
CREATE POLICY "Public profiles are viewable by all" ON diner_profiles FOR SELECT USING (is_public = true);

-- RLS Policies for Visit Tokens (restaurant owners can create, diners can redeem)
CREATE POLICY "Restaurant owners can manage visit tokens" ON visit_tokens FOR ALL USING (
    EXISTS (
        SELECT 1 FROM restaurants 
        WHERE restaurants.id = visit_tokens.restaurant_id 
        AND restaurants.owner_email = auth.email()
    )
);

-- RLS Policies for Diner Visits
CREATE POLICY "Diners can view their own visits" ON diner_visits FOR SELECT USING (auth.email() = diner_email);
CREATE POLICY "Diners can create their own visits" ON diner_visits FOR INSERT WITH CHECK (auth.email() = diner_email);
CREATE POLICY "Restaurant owners can view visits to their restaurant" ON diner_visits FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM restaurants 
        WHERE restaurants.id = diner_visits.restaurant_id 
        AND restaurants.owner_email = auth.email()
    )
);

-- RLS Policies for Diner Reviews
CREATE POLICY "Diners can view their own reviews" ON diner_reviews FOR SELECT USING (auth.email() = diner_email);
CREATE POLICY "Diners can manage their own reviews" ON diner_reviews FOR ALL USING (auth.email() = diner_email);
CREATE POLICY "Public reviews are viewable by all" ON diner_reviews FOR SELECT USING (is_public = true);
CREATE POLICY "Restaurant owners can view all reviews for their restaurant" ON diner_reviews FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM restaurants 
        WHERE restaurants.id = diner_reviews.restaurant_id 
        AND restaurants.owner_email = auth.email()
    )
);

-- RLS Policies for Competition Entries
CREATE POLICY "Diners can view their own competition entries" ON competition_entries FOR SELECT USING (auth.email() = diner_email);
CREATE POLICY "Competition entries are viewable for leaderboards" ON competition_entries FOR SELECT USING (true);
CREATE POLICY "System can create competition entries" ON competition_entries FOR INSERT WITH CHECK (true);

-- RLS Policies for Diner Badges
CREATE POLICY "Diners can view their own badges" ON diner_badges FOR SELECT USING (auth.email() = diner_email);
CREATE POLICY "Public badges are viewable by all" ON diner_badges FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM diner_profiles 
        WHERE diner_profiles.email = diner_badges.diner_email 
        AND diner_profiles.is_public = true
    )
);
CREATE POLICY "System can create badges" ON diner_badges FOR INSERT WITH CHECK (true);
