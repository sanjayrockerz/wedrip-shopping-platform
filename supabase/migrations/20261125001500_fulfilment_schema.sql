-- Phase 3A/3B/3G. Extends the Phase 2 outbox; does not create a parallel queue.
alter table public.orders add column if not exists lifecycle_version integer not null default 1 check (lifecycle_version > 0);
alter table public.orders add column if not exists delivered_at timestamptz;
alter table public.orders add column if not exists delivered_by uuid references auth.users(id);
alter table public.orders add column if not exists cancelled_at timestamptz;
alter table public.orders add column if not exists cancelled_by uuid references auth.users(id);
alter table public.orders add column if not exists cancellation_reason text;
create table if not exists public.order_shipper_assignments (
  id uuid primary key default gen_random_uuid(), order_id uuid not null unique references public.orders(id) on delete cascade,
  shipper_id uuid not null references public.shippers(id), shipper_name text not null, shipper_email text, shipper_whatsapp text,
  assigned_by uuid not null references auth.users(id), assigned_at timestamptz not null default now(), version integer not null default 1 check (version > 0)
);
create table if not exists public.order_cancellation_records (
  id uuid primary key default gen_random_uuid(), order_id uuid not null unique references public.orders(id) on delete cascade,
  actor_id uuid not null references auth.users(id), reason text not null check (char_length(trim(reason)) between 3 and 1000), created_at timestamptz not null default now(), finance_review_required boolean not null default true
);
alter table public.notification_outbox add column if not exists order_id uuid references public.orders(id) on delete cascade;
alter table public.notification_outbox add column if not exists event_type text;
update public.notification_outbox
set event_type = coalesce(nullif(split_part(business_event_id, ':', 1), ''), 'IN_APP')
where event_type is null;
alter table public.notification_outbox alter column event_type set not null;
alter table public.notification_outbox add column if not exists recipient_scope text;
alter table public.notification_outbox add column if not exists provider_message_id text;
alter table public.notification_outbox add column if not exists attempt_count integer not null default 0;
alter table public.notification_outbox add column if not exists last_attempt_at timestamptz;
alter table public.notification_outbox add column if not exists next_attempt_at timestamptz;
alter table public.notification_outbox add column if not exists locked_at timestamptz;
alter table public.notification_outbox add column if not exists locked_by text;
alter table public.notification_outbox add column if not exists failure_reason text;
alter table public.notification_outbox drop constraint if exists notification_outbox_status_check;
alter table public.notification_outbox add constraint notification_outbox_status_check check (status in ('PENDING','PROCESSING','SENT','FAILED','RETRYING','TERMINALLY_FAILED','CANCELLED'));
create index if not exists notification_outbox_ready_idx on public.notification_outbox(status, next_attempt_at, created_at);
create index if not exists notification_outbox_order_idx on public.notification_outbox(order_id, event_type);
alter table public.order_shipper_assignments enable row level security; alter table public.order_cancellation_records enable row level security;
create policy "Admins manage order shipper assignments" on public.order_shipper_assignments for all using (public.user_is_admin()) with check (public.user_is_admin());
create policy "Admins manage cancellation records" on public.order_cancellation_records for all using (public.user_is_admin()) with check (public.user_is_admin());
revoke all on public.order_shipper_assignments, public.order_cancellation_records from anon, authenticated;
grant select on public.order_shipper_assignments, public.order_cancellation_records to authenticated;
revoke all on public.notification_outbox from anon, authenticated; grant select, update on public.notification_outbox to authenticated;

create or replace function public.fulfilment_admin() returns boolean language sql stable security definer set search_path = public, pg_temp as $$ select exists(select 1 from public.admin_users where user_id=auth.uid() and role in ('SUPER_ADMIN','ADMIN','ORDER_MANAGER')); $$;
revoke all on function public.fulfilment_admin() from public; grant execute on function public.fulfilment_admin() to authenticated;

