-- Complete fix for admin orders not showing
-- This script will:
-- 1. Create/update the admin user
-- 2. Ensure profile is created
-- 3. Add sample orders for testing
-- 4. Verify everything works

-- =============================================================================
-- STEP 1: Create or update admin user in auth.users
-- =============================================================================

-- Check if admin user exists
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Try to find existing admin user
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@rusha.com';
    
    IF admin_user_id IS NULL THEN
        -- User doesn't exist, create it
        -- Note: This creates the user directly in auth.users table
        -- The password hash below is for 'admin123456'
        -- Generated using: SELECT crypt('admin123456', gen_salt('bf'))
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            aud,
            role
        ) VALUES (
            gen_random_uuid(),
            '00000000-0000-0000-0000-000000000000',
            'admin@rusha.com',
            crypt('admin123456', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{}',
            'authenticated',
            'authenticated'
        )
        RETURNING id INTO admin_user_id;
        
        RAISE NOTICE 'Created admin user with ID: %', admin_user_id;
    ELSE
        -- User exists, update password
        UPDATE auth.users 
        SET 
            encrypted_password = crypt('admin123456', gen_salt('bf')),
            email_confirmed_at = NOW(),
            updated_at = NOW()
        WHERE id = admin_user_id;
        
        RAISE NOTICE 'Updated admin user with ID: %', admin_user_id;
    END IF;
    
    -- Ensure profile exists and is marked as admin
    INSERT INTO public.profiles (id, display_name, is_admin)
    VALUES (admin_user_id, 'Admin User', true)
    ON CONFLICT (id) 
    DO UPDATE SET is_admin = true, display_name = COALESCE(profiles.display_name, 'Admin User');
    
    RAISE NOTICE 'Profile created/updated for admin';
END $$;

-- =============================================================================
-- STEP 2: Verify admin user setup
-- =============================================================================

SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    p.display_name,
    p.is_admin,
    CASE 
        WHEN u.email_confirmed_at IS NULL THEN 'Email not confirmed'
        WHEN p.is_admin IS NULL THEN 'Profile missing'
        WHEN p.is_admin = false THEN 'Not admin'
        ELSE 'OK'
    END as status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'admin@rusha.com';

-- =============================================================================
-- STEP 3: Create sample orders for testing (optional)
-- =============================================================================

-- First, let's check if there are any orders
DO $$
DECLARE
    order_count INT;
    admin_id UUID;
    test_user_id UUID;
BEGIN
    SELECT COUNT(*) INTO order_count FROM public.orders;
    
    IF order_count = 0 THEN
        -- Get admin ID
        SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@rusha.com';
        
        -- Create a test user if needed
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            aud,
            role
        ) VALUES (
            gen_random_uuid(),
            '00000000-0000-0000-0000-000000000000',
            'testuser@example.com',
            crypt('password123', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{}',
            'authenticated',
            'authenticated'
        )
        ON CONFLICT (email) DO UPDATE SET updated_at = NOW()
        RETURNING id INTO test_user_id;
        
        -- Create profile for test user
        INSERT INTO public.profiles (id, display_name, is_admin)
        VALUES (test_user_id, 'Test User', false)
        ON CONFLICT (id) DO NOTHING;
        
        -- Create sample orders
        INSERT INTO public.orders (user_id, item_type, item_title, item_slug, amount, currency, status)
        VALUES
            (test_user_id, 'service', 'Web Development Service', 'web-development', 999.00, 'USD', 'paid'),
            (test_user_id, 'service', 'SEO Optimization', 'seo-optimization', 499.00, 'USD', 'pending'),
            (admin_id, 'course', 'Advanced React Course', 'advanced-react', 149.00, 'USD', 'paid');
        
        RAISE NOTICE 'Created sample orders';
    ELSE
        RAISE NOTICE 'Orders already exist (%), skipping sample data creation', order_count;
    END IF;
END $$;

-- =============================================================================
-- STEP 4: Verify everything
-- =============================================================================

-- Check orders with profiles
SELECT 
    o.id,
    o.item_type,
    o.item_title,
    o.amount,
    o.status,
    o.created_at,
    p.display_name,
    u.email
FROM public.orders o
LEFT JOIN public.profiles p ON o.user_id = p.id
LEFT JOIN auth.users u ON o.user_id = u.id
ORDER BY o.created_at DESC;

-- Summary
SELECT 
    'Total Users' as metric,
    COUNT(*)::text as value
FROM auth.users
UNION ALL
SELECT 
    'Total Profiles',
    COUNT(*)::text
FROM public.profiles
UNION ALL
SELECT 
    'Admin Users',
    COUNT(*)::text
FROM public.profiles WHERE is_admin = true
UNION ALL
SELECT 
    'Total Orders',
    COUNT(*)::text
FROM public.orders
UNION ALL
SELECT 
    'Paid Orders',
    COUNT(*)::text
FROM public.orders WHERE status = 'paid';
