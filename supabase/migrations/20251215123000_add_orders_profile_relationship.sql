-- Add explicit foreign key relationship for Supabase PostgREST to detect the join
-- This will allow the query: SELECT *, profiles(display_name) FROM orders

-- The orders table already has user_id referencing auth.users
-- We need to make Supabase understand the relationship to profiles table


-- Add a comment to help Supabase understand the relationship
COMMENT ON COLUMN public.orders.user_id IS '@fk profiles';

-- Alternative: If the above doesn't work, we can create a view that includes the join
CREATE OR REPLACE VIEW public.orders_with_profiles AS
SELECT 
    o.*,
    p.display_name as user_display_name
FROM public.orders o
LEFT JOIN public.profiles p ON o.user_id = p.id;

-- Grant permissions on the view
GRANT SELECT ON public.orders_with_profiles TO authenticated;

-- Enable RLS on the view (it will inherit from the underlying tables)
ALTER VIEW public.orders_with_profiles SET (security_invoker = true);
