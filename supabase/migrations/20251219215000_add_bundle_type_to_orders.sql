-- Migration: update orders item_type constraint
-- Timestamp: 20251219215000

-- Drop existing check constraint if possible (name might vary, so we handle it generically or assume name)
-- Note: Supabase/Postgres default constraint name usually follows table_column_check format

-- First, let's try to drop the constraint by name if we know it. 
-- Based on previous migration it was inline, so name is auto-generated or explicitly named if updated.
-- We will try to replace the check constraint.

DO $$
DECLARE 
    con_name text;
BEGIN
    SELECT conname INTO con_name
    FROM pg_constraint 
    WHERE conrelid = 'public.orders'::regclass 
    AND contype = 'c' 
    AND pg_get_constraintdef(oid) LIKE '%item_type%';
    
    IF con_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.orders DROP CONSTRAINT ' || con_name;
    END IF;
END $$;

-- Add new constraint
ALTER TABLE public.orders
    ADD CONSTRAINT orders_item_type_check 
    CHECK (item_type IN ('service', 'course', 'hosting', 'project', 'bundle'));
