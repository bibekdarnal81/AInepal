-- Fix RLS policies to allow admins to view all orders
-- The current policy only allows users to see their own orders
-- We need to add a policy for admins to see ALL orders

-- First, create a helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the SELECT policy on orders to include admin access
DROP POLICY IF EXISTS "Users can view own orders and admins can view all" ON public.orders;

CREATE POLICY "Users can view own orders and admins can view all"
  ON public.orders FOR SELECT
  USING (
    auth.uid() = user_id 
    OR 
    is_admin()
  );

-- Also update the UPDATE policy for admins
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;

CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Grant execute permission on the helper function
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
