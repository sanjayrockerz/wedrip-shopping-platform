-- Phase 5 corrective migration: enforce payment-evidence ownership and quote freshness inside the RPC.
create or replace function public.submit_payment_claim(p_checkout_id uuid, p_payer_name text, p_payer_vpa text, p_utr text, p_note text, p_storage_key text, p_mime_type text, p_size_bytes bigint)
returns public.payment_submissions language plpgsql security definer set search_path = public, pg_temp as $$
declare v_user uuid := auth.uid(); v_checkout public.checkouts; v_submission public.payment_submissions; v_attempt integer;
begin
  if v_user is null then raise exception 'Unauthorized'; end if;
  select * into v_checkout from public.checkouts where id=p_checkout_id and customer_id=v_user for update;
  if not found or v_checkout.status not in ('READY_FOR_PAYMENT','REJECTED') then raise exception 'Checkout is not accepting payment evidence'; end if;
  if v_checkout.expires_at <= now() then raise exception 'Checkout has expired'; end if;
  if p_storage_key is null or p_storage_key not like v_user::text || '/' || p_checkout_id::text || '/%' then raise exception 'Payment evidence path is invalid'; end if;
  if p_mime_type not in ('image/jpeg','image/png','image/webp') then raise exception 'Unsupported payment evidence type'; end if;
  if p_size_bytes is null or p_size_bytes <= 0 or p_size_bytes > 10 * 1024 * 1024 then raise exception 'Payment evidence size is invalid'; end if;
  if coalesce(length(trim(p_payer_name)),0) < 1 or coalesce(length(trim(p_payer_vpa)),0) < 3 or coalesce(length(trim(p_utr)),0) < 4 then raise exception 'Payment claim details are invalid'; end if;
  select coalesce(max(attempt_no),0)+1 into v_attempt from public.payment_submissions where checkout_id=p_checkout_id;
  insert into public.payment_submissions(checkout_id,claimed_payer_name,claimed_payer_vpa,claimed_utr,note,attempt_no)
  values(p_checkout_id,left(trim(p_payer_name),160),left(trim(p_payer_vpa),160),left(trim(p_utr),120),left(nullif(trim(p_note),''),1000),v_attempt)
  returning * into v_submission;
  insert into public.payment_evidence(payment_submission_id,storage_key,mime_type,size_bytes)
  values(v_submission.id,p_storage_key,p_mime_type,p_size_bytes);
  update public.checkouts set status='PAYMENT_SUBMITTED',version=version+1,updated_at=now() where id=p_checkout_id;
  return v_submission;
end; $$;
revoke all on function public.submit_payment_claim(uuid,text,text,text,text,text,text,bigint) from public;
grant execute on function public.submit_payment_claim(uuid,text,text,text,text,text,text,bigint) to authenticated;
