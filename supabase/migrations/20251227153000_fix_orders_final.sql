-- 1. Fix RLS Policies for ALL tables to ensure Admins can see them
-- Service Orders
DROP POLICY IF EXISTS "Admins can view all service orders" ON service_orders;
CREATE POLICY "Admins can view all service orders" ON service_orders
FOR SELECT USING ( (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true );

-- Project Orders
DROP POLICY IF EXISTS "Admins can view all project orders" ON project_orders;
CREATE POLICY "Admins can view all project orders" ON project_orders
FOR SELECT USING ( (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true );

-- Domain Orders
DROP POLICY IF EXISTS "Admins can view all domain orders" ON domain_orders;
CREATE POLICY "Admins can view all domain orders" ON domain_orders
FOR SELECT USING ( (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true );

-- Bundle Orders
DROP POLICY IF EXISTS "Admins can view all bundle orders" ON bundle_orders;
CREATE POLICY "Admins can view all bundle orders" ON bundle_orders
FOR SELECT USING ( (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true );

-- Hosting Orders (Just in case)
DROP POLICY IF EXISTS "Admins can view all hosting orders" ON hosting_orders;
CREATE POLICY "Admins can view all hosting orders" ON hosting_orders
FOR SELECT USING ( (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true );


-- 2. Add Foreign Keys to 'profiles' table to allow joins in Admin Panel
-- We use DO blocks to avoid errors if constraint already exists

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_service_orders_profiles') THEN
    ALTER TABLE service_orders ADD CONSTRAINT fk_service_orders_profiles FOREIGN KEY (user_id) REFERENCES profiles(id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_project_orders_profiles') THEN
    ALTER TABLE project_orders ADD CONSTRAINT fk_project_orders_profiles FOREIGN KEY (user_id) REFERENCES profiles(id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_domain_orders_profiles') THEN
    ALTER TABLE domain_orders ADD CONSTRAINT fk_domain_orders_profiles FOREIGN KEY (user_id) REFERENCES profiles(id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_bundle_orders_profiles') THEN
    ALTER TABLE bundle_orders ADD CONSTRAINT fk_bundle_orders_profiles FOREIGN KEY (user_id) REFERENCES profiles(id);
  END IF;
END $$;

-- Refresh schema cache
NOTIFY pgrst, 'reload config';
