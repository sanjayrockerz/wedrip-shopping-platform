-- Phase 2F: one atomic, idempotent human-verification operation. No client can write these tables directly.
create or replace function public.approve_payment_submission(p_submission_id uuid, p_receiving_account_ref text, p_verified_transaction_ref text, p_actual_amount_paise bigint, p_bank_credit_at timestamptz, p_reason text default null)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_admin uuid := auth.uid(); v_submission public.payment_submissions; v_checkout public.checkouts; v_order public.orders; v_item record; v_audit uuid; v_bank uuid;
begin
  if v_admin is null or not public.user_can_verify_payments() then raise exception 'Forbidden'; end if;
  select * into v_submission from public.payment_submissions where id=p_submission_id for update;
  if not found then raise exception 'Payment submission not found'; end if;
  select * into v_checkout from public.checkouts where id=v_submission.checkout_id for update;
  if v_checkout.status='VERIFIED' then select * into v_order from public.orders where checkout_id=v_checkout.id; return jsonb_build_object('order_id',v_order.id,'idempotent',true); end if;
  if v_checkout.status in ('EXPIRED','CANCELLED','REJECTED') then raise exception 'Checkout is not eligible for approval'; end if;
  if p_receiving_account_ref is null or trim(p_receiving_account_ref)='' or p_verified_transaction_ref is null or trim(p_verified_transaction_ref)='' then raise exception 'Bank account and transaction reference are required'; end if;
  if p_actual_amount_paise <> v_checkout.final_amount_paise then raise exception 'Credited amount does not exactly match checkout amount'; end if;
  if p_bank_credit_at is null then raise exception 'Bank credit time is required'; end if;
  insert into public.bank_verifications(payment_submission_id,receiving_account_ref,verified_transaction_ref,actual_credit_amount_paise,bank_credit_at,verifier_admin_id,decision,reason) values(p_submission_id,trim(p_receiving_account_ref),trim(p_verified_transaction_ref),p_actual_amount_paise,p_bank_credit_at,v_admin,'VERIFIED',p_reason) returning id into v_bank;
  update public.payment_submissions set status='VERIFIED',updated_at=now() where id=p_submission_id;
  update public.checkouts set status='VERIFIED',version=version+1,updated_at=now() where id=v_checkout.id;
  insert into public.orders(order_number,user_id,status,payment_status,subtotal_paise,discount_paise,shipping_paise,tax_paise,total_paise,shipping_address,promo_id,discount_code,checkout_id,verified_payment_reference,confirmed_at)
    values('WD-'||to_char(now(),'YYYYMMDD')||'-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)),v_checkout.customer_id,'CONFIRMED','PAID',v_checkout.subtotal_paise,v_checkout.discount_paise,0,0,v_checkout.final_amount_paise,v_checkout.delivery_address_snapshot,(v_checkout.coupon_snapshot->>'id')::uuid,v_checkout.coupon_snapshot->>'code',v_checkout.id,trim(p_verified_transaction_ref),now()) returning * into v_order;
  for v_item in select * from public.checkout_items where checkout_id=v_checkout.id loop
    insert into public.order_items(order_id,product_id,product_name,size,quantity,unit_price_paise,variant_id,variant_snapshot) values(v_order.id,v_item.product_id,v_item.product_name,v_item.selected_size,v_item.quantity,v_item.unit_price_paise,v_item.variant_id,v_item.snapshot);
    update public.product_variants set stock_quantity=stock_quantity-v_item.quantity,updated_at=now() where id=v_item.variant_id and stock_quantity >= v_item.quantity;
    if not found then raise exception 'Inventory changed before approval'; end if;
  end loop;
  if v_checkout.coupon_snapshot is not null then insert into public.promo_redemptions(promo_id,user_id,order_id) values((v_checkout.coupon_snapshot->>'id')::uuid,v_checkout.customer_id,v_order.id); end if;
  insert into public.order_status_history(order_id,new_status,actor_user_id,reason) values(v_order.id,'CONFIRMED',v_admin,'Manual bank credit verified');
  insert into public.monetary_events(order_id,checkout_id,payment_submission_id,event_type,amount_paise,trusted_actor_id,source) values(v_order.id,v_checkout.id,p_submission_id,'PAYMENT_VERIFIED',p_actual_amount_paise,v_admin,'HUMAN_BANK_REVIEW');
  v_audit := public.record_audit_event('PAYMENT_VERIFIED','payment_submission',p_submission_id,jsonb_build_object('order_id',v_order.id,'amount_paise',p_actual_amount_paise,'bank_verification_id',v_bank));
  insert into public.notification_outbox(business_event_id,recipient_user_id,channel,payload,idempotency_key) values('ORDER_CONFIRMED:'||v_order.id,v_checkout.customer_id,'IN_APP',jsonb_build_object('order_id',v_order.id),'ORDER_CONFIRMED:'||v_order.id) on conflict do nothing;
  return jsonb_build_object('order_id',v_order.id,'idempotent',false,'audit_id',v_audit);
end; $$;
revoke all on function public.approve_payment_submission(uuid,text,text,bigint,timestamptz,text) from public; grant execute on function public.approve_payment_submission(uuid,text,text,bigint,timestamptz,text) to authenticated;

create or replace function public.review_payment_submission(p_submission_id uuid, p_decision text, p_reason text)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v_admin uuid := auth.uid(); v_submission public.payment_submissions; v_checkout public.checkouts; v_event text;
begin
  if v_admin is null or not public.user_can_verify_payments() then raise exception 'Forbidden'; end if;
  if p_decision not in ('HOLD','REJECTED') or coalesce(length(trim(p_reason)),0) < 3 then raise exception 'A decision and reason are required'; end if;
  select * into v_submission from public.payment_submissions where id=p_submission_id for update;
  if not found then raise exception 'Payment submission not found'; end if;
  select * into v_checkout from public.checkouts where id=v_submission.checkout_id for update;
  if v_submission.status='VERIFIED' or v_checkout.status='VERIFIED' then raise exception 'Verified payment cannot be changed'; end if;
  update public.payment_submissions set status=p_decision, updated_at=now() where id=p_submission_id;
  update public.checkouts set status=p_decision, version=version+1, updated_at=now() where id=v_checkout.id;
  insert into public.payment_exceptions(checkout_id,payment_submission_id,reason_category,review_state,assigned_reviewer,resolution_notes) values(v_checkout.id,p_submission_id,p_reason,'OPEN',v_admin,p_reason);
  v_event := case when p_decision='HOLD' then 'PAYMENT_HELD' else 'PAYMENT_REJECTED' end;
  perform public.record_audit_event(v_event,'payment_submission',p_submission_id,jsonb_build_object('reason',left(trim(p_reason),500)));
end; $$;
revoke all on function public.review_payment_submission(uuid,text,text) from public; grant execute on function public.review_payment_submission(uuid,text,text) to authenticated;
