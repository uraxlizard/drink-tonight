-- Add 'completed' status to reservations check constraint
alter table public.reservations drop constraint if exists reservations_status_check;

alter table public.reservations add constraint reservations_status_check 
  check (status in ('pending', 'confirmed', 'cancelled', 'completed'));

