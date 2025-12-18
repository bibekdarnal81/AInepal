-- Fix admin orders access - drop in correct order
-- First drop policies, then drop function, then recreate

-- Drop policies first (they depend on the function)
DROP POLICY IF EXISTS "Users can view own orders and admins can view all" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Enable read access for users and admins" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.orders;
DROP POLICY IF EXISTS "Enable update for admins" ON public.orders;

-- Now drop the function
DROP FUNCTION IF EXISTS public.is_admin();

-- Create new policies without the function (using direct EXISTS check)
CREATE POLICY "Users and admins can read orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Allow users to insert their own orders
CREATE POLICY "Users can create orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Allow admins to update any order
CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );
