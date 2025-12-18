-- Create the posts table
create table public.posts (
  id uuid not null default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text,
  published boolean default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint posts_pkey primary key (id)
);

-- Enable Row Level Security
alter table public.posts enable row level security;

-- Create a policy to allow public read access to published posts
create policy "Allow public read access to published posts"
on public.posts
for select
to public
using (published = true);

-- Create a policy to allow authenticated users (admin) to do everything
create policy "Allow full access to authenticated users"
on public.posts
for all
to authenticated
using (true)
with check (true);
