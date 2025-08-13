-- Emergency fix: Temporarily disable RLS to restore service
-- Run this first to immediately fix your site, then we can debug properly

-- Disable RLS on both tables (temporary fix)
ALTER TABLE restaurants DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items DISABLE ROW LEVEL SECURITY;

-- This will immediately restore your site functionality
-- After your site is working, we can re-enable RLS with proper policies
