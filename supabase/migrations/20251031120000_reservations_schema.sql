-- Create reservations table
create table if not exists public.reservations (
  id bigserial primary key,
  place_id bigint not null references public.places(id) on delete cascade,
  user_id uuid references auth.users(id),
  name text not null,
  phone text not null,
  guests integer not null default 1,
  status text default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.reservations enable row level security;

-- Allow authenticated users to insert their own reservations
do $$ begin
  create policy reservations_insert_authenticated
  on public.reservations for insert to authenticated
  with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- Allow place owners to view reservations for their places
do $$ begin
  create policy reservations_select_place_owner
  on public.reservations for select to authenticated
  using (
    exists (
      select 1 from public.places
      where places.id = reservations.place_id
      and places.user_id = auth.uid()
    )
  );
exception when duplicate_object then null; end $$;

-- Allow users to view their own reservations
do $$ begin
  create policy reservations_select_own
  on public.reservations for select to authenticated
  using (user_id = auth.uid());
exception when duplicate_object then null; end $$;

-- Allow place owners to update reservations for their places
do $$ begin
  create policy reservations_update_place_owner
  on public.reservations for update to authenticated
  using (
    exists (
      select 1 from public.places
      where places.id = reservations.place_id
      and places.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.places
      where places.id = reservations.place_id
      and places.user_id = auth.uid()
    )
  );
exception when duplicate_object then null; end $$;

-- Create index for faster queries
create index if not exists reservations_place_id_idx on public.reservations(place_id);
create index if not exists reservations_user_id_idx on public.reservations(user_id);
create index if not exists reservations_status_idx on public.reservations(status);

