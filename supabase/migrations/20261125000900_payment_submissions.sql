-- Phase 2D: untrusted customer claims and private evidence metadata.
create table if not exists public.payment_submissions (
  id uuid primary key default gen_random_uuid(), checkout_id uuid not null references public.checkouts(id) on delete cascade,
  claimed_payer_name text not null, claimed_payer_vpa text not null, claimed_utr text not null,
  note text, status text not null default 'SUBMITTED' check (status in ('SUBMITTED','UNDER_REVIEW','HOLD','REJECTED','VERIFIED','REPLACED')),
  attempt_no integer not null default 1 check (attempt_no > 0), submitted_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(checkout_id, attempt_no)
);
create table if not exists public.payment_evidence (
  id uuid primary key default gen_random_uuid(), payment_submission_id uuid not null unique references public.payment_submissions(id) on delete cascade,
  storage_bucket text not null default 'payment-evidence', storage_key text not null unique, mime_type text not null, size_bytes bigint not null check (size_bytes > 0),
  created_at timestamptz not null default now()
);
create index if not exists payment_submissions_status_idx on public.payment_submissions(status, submitted_at);
alter table public.payment_submissions enable row level security; alter table public.payment_evidence enable row level security;
drop policy if exists "Customers read own payment submissions" on public.payment_submissions; create policy "Customers read own payment submissions" on public.payment_submissions for select using (exists(select 1 from public.checkouts c where c.id = checkout_id and c.customer_id = auth.uid()));
drop policy if exists "Admins read payment submissions" on public.payment_submissions; create policy "Admins read payment submissions" on public.payment_submissions for select using (public.user_is_admin());
drop policy if exists "Admins read payment evidence metadata" on public.payment_evidence; create policy "Admins read payment evidence metadata" on public.payment_evidence for select using (public.user_is_admin());
revoke all on public.payment_submissions, public.payment_evidence from anon, authenticated; grant select on public.payment_submissions, public.payment_evidence to authenticated;
insert into storage.buckets(id, name, public) values ('payment-evidence', 'payment-evidence', false) on conflict (id) do nothing;
drop policy if exists "Customers upload own payment evidence" on storage.objects;
create policy "Customers upload own payment evidence" on storage.objects for insert to authenticated with check (bucket_id = 'payment-evidence' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Admins read payment evidence" on storage.objects;
create policy "Admins read payment evidence" on storage.objects for select to authenticated using (bucket_id = 'payment-evidence' and public.user_is_admin());

create or replace function public.submit_payment_claim(p_checkout_id uuid, p_payer_name text, p_payer_vpa text, p_utr text, p_note text, p_storage_key text, p_mime_type text, p_size_bytes bigint)
returns public.payment_submissions language plpgsql security definer set search_path = public, pg_temp as $$
declare v_user uuid := auth.uid(); v_checkout public.checkouts; v_submission public.payment_submissions; v_attempt integer;
begin
  if v_user is null then raise exception 'Unauthorized'; end if;
  select * into v_checkout from public.checkouts where id=p_checkout_id and customer_id=v_user for update;
  if not found or v_checkout.status not in ('READY_FOR_PAYMENT','REJECTED') then raise exception 'Checkout is not accepting payment evidence'; end if;
  select coalesce(max(attempt_no),0)+1 into v_attempt from public.payment_submissions where checkout_id=p_checkout_id;
  insert into public.payment_submissions(checkout_id,claimed_payer_name,claimed_payer_vpa,claimed_utr,note,attempt_no) values(p_checkout_id,left(trim(p_payer_name),160),left(trim(p_payer_vpa),160),left(trim(p_utr),120),left(nullif(trim(p_note),''),1000),v_attempt) returning * into v_submission;
  insert into public.payment_evidence(payment_submission_id,storage_key,mime_type,size_bytes) values(v_submission.id,p_storage_key,p_mime_type,p_size_bytes);
  update public.checkouts set status='PAYMENT_SUBMITTED',version=version+1,updated_at=now() where id=p_checkout_id;
  return v_submission;
end; $$;
revoke all on function public.submit_payment_claim(uuid,text,text,text,text,text,text,bigint) from public; grant execute on function public.submit_payment_claim(uuid,text,text,text,text,text,text,bigint) to authenticated;

