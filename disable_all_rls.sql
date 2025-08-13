-- DISABLE ALL RLS (Row Level Security) - Emergency Fix
-- This will restore full functionality to your site immediately
-- Run this in your Supabase SQL Editor

-- Disable RLS on all tables that might have it enabled
-- Core application tables
ALTER TABLE restaurants DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items DISABLE ROW LEVEL SECURITY;

-- Other potential tables (run these if they exist)
ALTER TABLE images DISABLE ROW LEVEL SECURITY;

-- Alternative: Find ALL tables with RLS enabled and disable them
-- This query will show you all tables with RLS currently enabled:
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE rowsecurity = true 
AND schemaname = 'public';

-- Drop ALL existing policies (clean slate)
-- For restaurants table
DROP POLICY IF EXISTS "Service role can access all restaurants" ON restaurants;
DROP POLICY IF EXISTS "Users can access own restaurants" ON restaurants;
DROP POLICY IF EXISTS "Anonymous users can read restaurants" ON restaurants;
DROP POLICY IF EXISTS "Public can read restaurants" ON restaurants;
DROP POLICY IF EXISTS "service_role_all_access" ON restaurants;
DROP POLICY IF EXISTS "authenticated_user_access" ON restaurants;
DROP POLICY IF EXISTS "public_read_restaurants" ON restaurants;

-- For menu_items table
DROP POLICY IF EXISTS "Service role can access all menu items" ON menu_items;
DROP POLICY IF EXISTS "Users can manage own menu items" ON menu_items;
DROP POLICY IF EXISTS "Anonymous users can read menu items" ON menu_items;
DROP POLICY IF EXISTS "Public can read menu items" ON menu_items;
DROP POLICY IF EXISTS "service_role_all_access" ON menu_items;
DROP POLICY IF EXISTS "authenticated_user_menu_access" ON menu_items;
DROP POLICY IF EXISTS "public_read_menu_items" ON menu_items;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('restaurants', 'menu_items')
AND schemaname = 'public';
