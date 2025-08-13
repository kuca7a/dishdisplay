-- Quick RLS fix - just allow service role to bypass RLS
-- Run this in your Supabase SQL Editor

-- Drop existing policies if they exist (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Service role can access all restaurants" ON restaurants;
DROP POLICY IF EXISTS "Users can access own restaurants" ON restaurants;
DROP POLICY IF EXISTS "Anonymous users can read restaurants" ON restaurants;
DROP POLICY IF EXISTS "Service role can access all menu items" ON menu_items;
DROP POLICY IF EXISTS "Users can manage own menu items" ON menu_items;
DROP POLICY IF EXISTS "Anonymous users can read menu items" ON menu_items;

-- Enable RLS on restaurants table
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role full access (this fixes your API)
CREATE POLICY "Service role can access all restaurants" ON restaurants
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to access their own restaurants
CREATE POLICY "Users can access own restaurants" ON restaurants
  FOR ALL 
  TO authenticated
  USING (owner_email = auth.jwt() ->> 'email')
  WITH CHECK (owner_email = auth.jwt() ->> 'email');

-- Allow public read access for menu display
CREATE POLICY "Public can read restaurants" ON restaurants
  FOR SELECT 
  TO public
  USING (true);

-- Enable RLS on menu_items table
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role full access
CREATE POLICY "Service role can access all menu items" ON menu_items
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to manage their menu items
CREATE POLICY "Users can manage own menu items" ON menu_items
  FOR ALL 
  TO authenticated
  USING (restaurant_id IN (SELECT id FROM restaurants WHERE owner_email = auth.jwt() ->> 'email'))
  WITH CHECK (restaurant_id IN (SELECT id FROM restaurants WHERE owner_email = auth.jwt() ->> 'email'));

-- Allow public read access for menu display
CREATE POLICY "Public can read menu items" ON menu_items
  FOR SELECT 
  TO public
  USING (true);
