-- Simple diagnostic test - run this to see what's happening
-- This will tell us if the issue is with the database connection or environment variables

-- First, check what tables actually exist in your database
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if restaurants table has any data
SELECT COUNT(*) as restaurant_count FROM restaurants;

-- Check if the specific email exists
SELECT id, name, owner_email 
FROM restaurants 
WHERE owner_email = 'hdcatalyst@gmail.com';

-- Check for any NULL or problematic data
SELECT id, name, owner_email, created_at
FROM restaurants 
WHERE owner_email IS NULL OR owner_email = '';

-- Show all restaurants (limited to first 5)
SELECT id, name, owner_email, created_at
FROM restaurants 
LIMIT 5;
