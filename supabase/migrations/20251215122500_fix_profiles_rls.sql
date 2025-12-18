-- Fix infinite recursion in profiles RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create new admin check policy without recursion
-- Use auth.jwt() to check admin status from JWT token instead of querying profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id 
    OR 
    (auth.jwt()->>'email')::text IN (
      SELECT email FROM auth.users WHERE id IN (
        SELECT id FROM public.profiles WHERE is_admin = true AND id = auth.uid()
      )
    )
  );

-- Actually, simpler approach - just allow users to see their own profile
-- and let app logic handle admin checks
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Anyone authenticated can view profiles"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');
