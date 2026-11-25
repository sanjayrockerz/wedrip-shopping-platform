-- Phase 2F/2G: immutable linkage to the existing order model.
alter table public.orders add column if not exists checkout_id uuid references public.checkouts(id);
alter table public.orders add column if not exists verified_payment_reference text;
alter table public.orders add column if not exists confirmed_at timestamptz;
create unique index if not exists orders_checkout_unique_idx on public.orders(checkout_id) where checkout_id is not null;
create table if not exists public.monetary_events (
  id uuid primary key default gen_random_uuid(), order_id uuid references public.orders(id) on delete cascade, checkout_id uuid references public.checkouts(id) on delete cascade,
  payment_submission_id uuid references public.payment_submissions(id), event_type text not null check (event_type in ('PAYMENT_VERIFIED','PAYMENT_REJECTED','PAYMENT_HELD')),
  amount_paise bigint not null check (amount_paise >= 0), currency text not null default 'INR', trusted_actor_id uuid references auth.users(id), source text not null, created_at timestamptz not null default now()
);
alter table public.monetary_events enable row level security;
create policy "Admins manage monetary events" on public.monetary_events for all using (public.user_is_admin()) with check (public.user_is_admin());
revoke all on public.monetary_events from anon, authenticated; grant select on public.monetary_events to authenticated;

