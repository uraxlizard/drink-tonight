-- Create places table and basic RLS/policies
create table if not exists public.places (
  id bigserial primary key,
  name text not null,
  category text,
  rating numeric,
  distance text,
  image text,
  youtube_id text,
  video text,
  tonight jsonb,
  description text,
  features text[],
  working_hours text,
  vip boolean default false,
  adult_only boolean default false,
  created_at timestamptz default now()
);

alter table public.places enable row level security;

do $$ begin
  create policy places_select_anon on public.places for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy places_write_auth on public.places for all to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;


