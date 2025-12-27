-- Drop incorrect strict policies
DROP POLICY IF EXISTS "Admins can view all service orders" ON service_orders;
DROP POLICY IF EXISTS "Admins can view all project orders" ON project_orders;
DROP POLICY IF EXISTS "Admins can view all domain orders" ON domain_orders;

-- Create correct policies based on is_admin flag
CREATE POLICY "Admins can view all service orders" ON service_orders
FOR SELECT USING (
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
);

CREATE POLICY "Admins can view all project orders" ON project_orders
FOR SELECT USING (
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
);

CREATE POLICY "Admins can view all domain orders" ON domain_orders
FOR SELECT USING (
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
);

-- Ensure Hosting Orders is also visible
DROP POLICY IF EXISTS "Admins can view all hosting orders" ON hosting_orders;
CREATE POLICY "Admins can view all hosting orders" ON hosting_orders
FOR SELECT USING (
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
);

NOTIFY pgrst, 'reload config';
