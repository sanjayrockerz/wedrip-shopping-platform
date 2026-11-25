-- Phase 1 / Shipper directory and single-default integrity.
-- Depends on 20261125000300_admin_permissions.sql.

create table if not exists public.shippers (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 120),
  company text,
  email text check (email is null or char_length(trim(email)) <= 254),
  whatsapp_number text check (whatsapp_number is null or char_length(trim(whatsapp_number)) <= 32),
  contact_status text not null default 'UNVERIFIED'
    check (contact_status in ('UNVERIFIED', 'PENDING_TEST', 'VERIFIED', 'FAILED')),
  is_active boolean not null default true,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.shippers enable row level security;
drop policy if exists "Admins manage shippers" on public.shippers;
create policy "Admins manage shippers" on public.shippers
  for all using (public.user_can_manage_settings())
  with check (public.user_can_manage_settings());

create or replace function public.set_default_shipper()
returns trigger language plpgsql security invoker as $$
begin
  if new.is_default then
    update public.shippers set is_default = false, updated_at = now()
    where id <> new.id;
  end if;
  return new;
end;
$$;
drop trigger if exists shippers_one_default on public.shippers;
create trigger shippers_one_default before insert or update of is_default on public.shippers
for each row execute function public.set_default_shipper();
