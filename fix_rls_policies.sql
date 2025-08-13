-- Fix RLS policies for restaurants table
-- This allows the service role to bypass RLS or grants proper access

-- Option 1: Allow service role to bypass RLS (recommended for API access)
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role full access
CREATE POLICY "Service role can access all restaurants" ON restaurants
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create policy to allow authenticated users to access their own restaurants
CREATE POLICY "Users can access own restaurants" ON restaurants
  FOR ALL 
  TO authenticated
  USING (owner_email = auth.jwt() ->> 'email')
  WITH CHECK (owner_email = auth.jwt() ->> 'email');

-- Create policy to allow anonymous users to read restaurants (for public menu access)
CREATE POLICY "Anonymous users can read restaurants" ON restaurants
  FOR SELECT 
  TO anon
  USING (true);

-- Also fix menu_items table if it has RLS issues
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Create policy for menu_items - allow service role full access
CREATE POLICY "Service role can access all menu items" ON menu_items
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create policy for authenticated users to manage their own menu items
CREATE POLICY "Users can manage own menu items" ON menu_items
  FOR ALL 
  TO authenticated
  USING (restaurant_id IN (SELECT id FROM restaurants WHERE owner_email = auth.jwt() ->> 'email'))
  WITH CHECK (restaurant_id IN (SELECT id FROM restaurants WHERE owner_email = auth.jwt() ->> 'email'));

-- Allow anonymous users to read menu items (for public menu access)
CREATE POLICY "Anonymous users can read menu items" ON menu_items
  FOR SELECT 
  TO anon
  USING (true);
