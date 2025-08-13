-- Comprehensive RLS diagnostic and fix script
-- Run this in Supabase SQL Editor to diagnose and fix RLS issues

-- First, let's check the current state of RLS on both tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('restaurants', 'menu_items');

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('restaurants', 'menu_items');

-- Drop ALL existing policies first (clean slate)
DROP POLICY IF EXISTS "Service role can access all restaurants" ON restaurants;
DROP POLICY IF EXISTS "Users can access own restaurants" ON restaurants;
DROP POLICY IF EXISTS "Anonymous users can read restaurants" ON restaurants;
DROP POLICY IF EXISTS "Public can read restaurants" ON restaurants;
DROP POLICY IF EXISTS "Service role can access all menu items" ON menu_items;
DROP POLICY IF EXISTS "Users can manage own menu items" ON menu_items;
DROP POLICY IF EXISTS "Anonymous users can read menu items" ON menu_items;
DROP POLICY IF EXISTS "Public can read menu items" ON menu_items;

-- Disable RLS first, then re-enable (fresh start)
ALTER TABLE restaurants DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Create the most permissive policy for service role first
CREATE POLICY "service_role_all_access" ON restaurants
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_all_access" ON menu_items
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create authenticated user policies
CREATE POLICY "authenticated_user_access" ON restaurants
  FOR ALL
  TO authenticated
  USING (owner_email = auth.jwt() ->> 'email')
  WITH CHECK (owner_email = auth.jwt() ->> 'email');

CREATE POLICY "authenticated_user_menu_access" ON menu_items
  FOR ALL
  TO authenticated
  USING (restaurant_id IN (
    SELECT id FROM restaurants WHERE owner_email = auth.jwt() ->> 'email'
  ))
  WITH CHECK (restaurant_id IN (
    SELECT id FROM restaurants WHERE owner_email = auth.jwt() ->> 'email'
  ));

-- Create public read-only policies
CREATE POLICY "public_read_restaurants" ON restaurants
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "public_read_menu_items" ON menu_items
  FOR SELECT
  TO public
  USING (true);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename IN ('restaurants', 'menu_items')
ORDER BY tablename, policyname;
