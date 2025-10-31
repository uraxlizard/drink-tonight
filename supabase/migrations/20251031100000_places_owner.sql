-- Add owner to places and tighten RLS for writes
alter table public.places add column if not exists user_id uuid references auth.users(id);

-- Backfill existing rows to current user when possible is not done here; left nullable to avoid issues

-- Ensure inserts default to current user when not explicitly provided
do $$ begin
  alter table public.places alter column user_id set default auth.uid();
exception when others then null; end $$;

-- Update policies: keep public select, restrict write to owner
do $$ begin
  drop policy if exists places_write_auth on public.places;
exception when undefined_object then null; end $$;

do $$ begin
  create policy places_insert_owner
  on public.places for insert to authenticated
  with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy places_update_owner
  on public.places for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy places_delete_owner
  on public.places for delete to authenticated
  using (user_id = auth.uid());
exception when duplicate_object then null; end $$;


