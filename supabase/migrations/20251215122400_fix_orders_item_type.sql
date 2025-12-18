-- Update orders table to allow 'project' item type
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_item_type_check;

ALTER TABLE public.orders 
ADD CONSTRAINT orders_item_type_check 
CHECK (item_type IN ('service', 'course', 'project'));
