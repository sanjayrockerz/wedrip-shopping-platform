-- Phase 2F: trusted human bank-credit record. Uniqueness is database-enforced.
create table if not exists public.bank_verifications (
  id uuid primary key default gen_random_uuid(), payment_submission_id uuid not null unique references public.payment_submissions(id),
  receiving_account_ref text not null, verified_transaction_ref text not null, actual_credit_amount_paise bigint not null check (actual_credit_amount_paise > 0),
  bank_credit_at timestamptz not null, verifier_admin_id uuid not null references auth.users(id), verification_time timestamptz not null default now(),
  decision text not null check (decision in ('VERIFIED','HOLD','REJECTED')), reason text, audit_log_id uuid, created_at timestamptz not null default now(),
  unique(receiving_account_ref, verified_transaction_ref)
);
create table if not exists public.payment_exceptions (
  id uuid primary key default gen_random_uuid(), checkout_id uuid references public.checkouts(id) on delete cascade, payment_submission_id uuid references public.payment_submissions(id) on delete cascade,
  reason_category text not null, review_state text not null default 'OPEN' check (review_state in ('OPEN','RESOLVED')), assigned_reviewer uuid references auth.users(id), resolution_notes text, created_at timestamptz not null default now(), resolved_at timestamptz
);
alter table public.bank_verifications enable row level security; alter table public.payment_exceptions enable row level security;
create policy "Admins manage bank verifications" on public.bank_verifications for all using (public.user_is_admin()) with check (public.user_is_admin());
create policy "Admins manage payment exceptions" on public.payment_exceptions for all using (public.user_is_admin()) with check (public.user_is_admin());
revoke all on public.bank_verifications, public.payment_exceptions from anon, authenticated;
grant select on public.bank_verifications, public.payment_exceptions to authenticated;

