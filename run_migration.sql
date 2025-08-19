-- Create diner profiles table
CREATE TABLE IF NOT EXISTS public.diner_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth0_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  favorite_cuisines TEXT[],
  dietary_restrictions TEXT[],
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  total_visits INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create diner visits table
CREATE TABLE IF NOT EXISTS public.diner_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diner_id UUID REFERENCES diner_profiles(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  visit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create diner reviews table
CREATE TABLE IF NOT EXISTS public.diner_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diner_id UUID REFERENCES diner_profiles(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  visit_id UUID REFERENCES diner_visits(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  photos TEXT[],
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create diner badges table
CREATE TABLE IF NOT EXISTS public.diner_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diner_id UUID REFERENCES diner_profiles(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(diner_id, badge_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_diner_profiles_auth0_id ON diner_profiles(auth0_id);
CREATE INDEX IF NOT EXISTS idx_diner_visits_diner_id ON diner_visits(diner_id);
CREATE INDEX IF NOT EXISTS idx_diner_visits_restaurant_id ON diner_visits(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_diner_reviews_diner_id ON diner_reviews(diner_id);
CREATE INDEX IF NOT EXISTS idx_diner_reviews_restaurant_id ON diner_reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_diner_badges_diner_id ON diner_badges(diner_id);

-- Enable RLS
ALTER TABLE diner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE diner_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE diner_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE diner_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for diner_profiles
CREATE POLICY "Diners can view own profile" ON diner_profiles
  FOR SELECT USING (auth.uid()::text = auth0_id);

CREATE POLICY "Diners can update own profile" ON diner_profiles
  FOR UPDATE USING (auth.uid()::text = auth0_id);

CREATE POLICY "Diners can insert own profile" ON diner_profiles
  FOR INSERT WITH CHECK (auth.uid()::text = auth0_id);

-- RLS Policies for diner_visits
CREATE POLICY "Diners can view own visits" ON diner_visits
  FOR SELECT USING (diner_id IN (SELECT id FROM diner_profiles WHERE auth0_id = auth.uid()::text));

CREATE POLICY "Diners can insert own visits" ON diner_visits
  FOR INSERT WITH CHECK (diner_id IN (SELECT id FROM diner_profiles WHERE auth0_id = auth.uid()::text));

CREATE POLICY "Diners can update own visits" ON diner_visits
  FOR UPDATE USING (diner_id IN (SELECT id FROM diner_profiles WHERE auth0_id = auth.uid()::text));

-- RLS Policies for diner_reviews
CREATE POLICY "Anyone can view reviews" ON diner_reviews FOR SELECT TO public;

CREATE POLICY "Diners can insert own reviews" ON diner_reviews
  FOR INSERT WITH CHECK (diner_id IN (SELECT id FROM diner_profiles WHERE auth0_id = auth.uid()::text));

CREATE POLICY "Diners can update own reviews" ON diner_reviews
  FOR UPDATE USING (diner_id IN (SELECT id FROM diner_profiles WHERE auth0_id = auth.uid()::text));

-- RLS Policies for diner_badges
CREATE POLICY "Diners can view own badges" ON diner_badges
  FOR SELECT USING (diner_id IN (SELECT id FROM diner_profiles WHERE auth0_id = auth.uid()::text));

CREATE POLICY "System can insert badges" ON diner_badges
  FOR INSERT WITH CHECK (true);

-- Create trigger function for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_diner_profiles_updated_at BEFORE UPDATE ON diner_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_diner_visits_updated_at BEFORE UPDATE ON diner_visits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_diner_reviews_updated_at BEFORE UPDATE ON diner_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
