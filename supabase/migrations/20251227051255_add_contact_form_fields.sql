alter table public.contact_messages 
add column if not exists company text,
add column if not exists budget text,
add column if not exists services text[],
add column if not exists website text,
add column if not exists contact_method text;
