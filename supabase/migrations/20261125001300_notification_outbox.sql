-- Phase 2F: durable event foundation; delivery is intentionally not activated here.
create table if not exists public.notification_outbox (
  id uuid primary key default gen_random_uuid(), business_event_id text not null unique, recipient_user_id uuid references auth.users(id), channel text not null check (channel in ('EMAIL','WHATSAPP','IN_APP')),
  payload jsonb not null default '{}', status text not null default 'PENDING' check (status in ('PENDING','SENT','FAILED','CANCELLED')), idempotency_key text not null unique, attempts integer not null default 0, created_at timestamptz not null default now(), sent_at timestamptz, last_error text
);
alter table public.notification_outbox enable row level security;
create policy "Admins manage notification outbox" on public.notification_outbox for all using (public.user_is_admin()) with check (public.user_is_admin());
create policy "Customers read own notification outbox" on public.notification_outbox for select using (recipient_user_id = auth.uid());
revoke all on public.notification_outbox from anon, authenticated; grant select on public.notification_outbox to authenticated;

