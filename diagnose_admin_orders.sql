-- Comprehensive check for admin orders issue
-- Run this in Supabase SQL Editor to diagnose the problem

-- 1. Check if admin user exists and has proper flags
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    p.display_name,
    p.is_admin
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'admin@NextNepal.com';

-- 2. Check all users with is_admin flag
SELECT 
    u.id,
    u.email,
    p.display_name,
    p.is_admin
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.is_admin = true;

-- 3. Check if there are ANY orders
SELECT COUNT(*) as total_orders FROM orders;

-- 4. Check orders with profile data (same query as admin page)
SELECT 
    o.*,
    p.display_name,
    p.email
FROM orders o
LEFT JOIN profiles p ON o.user_id = p.id
ORDER BY o.created_at DESC
LIMIT 10;

-- 5. Check profiles table
SELECT COUNT(*) as total_profiles FROM profiles;
SELECT id, display_name, is_admin, created_at FROM profiles LIMIT 10;

-- 6. Check if current policies allow admin to read orders
-- This will test RLS policies
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims.sub TO (SELECT id FROM auth.users WHERE email = 'admin@NextNepal.com');
SELECT COUNT(*) as orders_visible_to_admin FROM orders;
