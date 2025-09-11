-- Supabase migration: create api_keys table
create table if not exists public.api_keys (
  id bigserial primary key,
  key text not null unique,
  plan text,
  quota integer,
  status text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists api_keys_key_idx on public.api_keys (key);
