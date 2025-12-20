-- Quick Setup Script for Admin Orders
-- Run this in Supabase SQL Editor to set up admin user and test orers

-- ============================================
-- PART 1: Create or Update Admin User
-- ============================================

-- Option 1: Make yourself (currently logged in user) an admin
UPDATE profiles 
SET is_admin = true 
WHERE id = auth.uid();

-- Option 2: Create a specific admin user (uncomment to use)
-- First, you need to sign up with admin@NextNepal.com at /admin/login
-- Then run these:
/*
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'admin@NextNepal.com';

UPDATE profiles 
SET is_admin = true 
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@NextNepal.com');
*/

-- ============================================
-- PART 2: Fix Foreign Key Relationship
-- ============================================

-- Drop existing constraint if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'orders_user_id_fkey' 
        AND table_name = 'orders'
    ) THEN
        ALTER TABLE orders DROP CONSTRAINT orders_user_id_fkey;
    END IF;
END $$;

-- Add the foreign key constraint with proper naming for PostgREST
ALTER TABLE orders 
ADD CONSTRAINT orders_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

-- ============================================
-- PART 3: Create Test Orders (Optional)
-- ============================================

-- Create test orders for the current user (you)
INSERT INTO orders (user_id, item_type, item_id, item_title, item_slug, amount, currency, status, payment_method)
VALUES 
    (auth.uid(), 'service', gen_random_uuid(), 'Web Development Service', 'web-development', 299.99, 'USD', 'paid', 'stripe'),
    (auth.uid(), 'service', gen_random_uuid(), 'SEO Optimization', 'seo-optimization', 149.99, 'USD', 'pending', 'stripe'),
    (auth.uid(), 'course', gen_random_uuid(), 'Advanced React Course', 'advanced-react', 99.99, 'USD', 'paid', 'stripe'),
    (auth.uid(), 'course', gen_random_uuid(), 'Next.js Masterclass', 'nextjs-masterclass', 199.99, 'USD', 'cancelled', 'stripe');

-- ============================================
-- PART 4: Verify Setup
-- ============================================

-- Check if you're now an admin
SELECT 
    u.email,
    p.is_admin,
    p.display_name
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.id = auth.uid();

-- Check orders with user info
SELECT 
    o.id,
    o.item_title,
    o.amount,
    o.status,
    o.created_at,
    p.display_name as customer_name,
    u.email as customer_email
FROM orders o
LEFT JOIN profiles p ON o.user_id = p.id
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY o.created_at DESC
LIMIT 10;

-- ============================================
-- SUCCESS!
-- ============================================
-- If the above queries ran successfully, you should now:
-- 1. Be an admin user
-- 2. Have proper foreign keys set up
-- 3. Have test orders to view
-- 
-- Now go to: http://localhost:3000/admin/orders
