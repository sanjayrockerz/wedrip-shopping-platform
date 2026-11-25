-- Phase 3 lifecycle operations: locked, versioned, server-authorized transitions.
create or replace function public.assign_order_shipper(p_order_id uuid, p_shipper_id uuid, p_expected_version integer)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_actor uuid:=auth.uid(); v_order public.orders; v_shipper public.shippers; v_assignment public.order_shipper_assignments; v_has_assignment boolean:=false;
begin
  if v_actor is null or not public.fulfilment_admin() then raise exception 'Forbidden'; end if;
  select * into v_order from public.orders where id=p_order_id for update;
  if not found or v_order.payment_status <> 'PAID' or v_order.verified_payment_reference is null or v_order.status in ('CANCELLED','DELIVERED') then raise exception 'Order is not eligible for fulfilment'; end if;
  if p_expected_version is not null and v_order.lifecycle_version <> p_expected_version then raise exception 'Order changed; refresh and retry'; end if;
  select * into v_shipper from public.shippers where id=p_shipper_id for update;
  if not found or not v_shipper.is_active or v_shipper.contact_status <> 'VERIFIED' then raise exception 'Shipper is not active and verified'; end if;
  insert into public.order_shipper_assignments(order_id,shipper_id,shipper_name,shipper_email,shipper_whatsapp,assigned_by) values(p_order_id,p_shipper_id,v_shipper.name,v_shipper.email,v_shipper.whatsapp_number,v_actor)
    on conflict(order_id) do update set shipper_id=excluded.shipper_id,shipper_name=excluded.shipper_name,shipper_email=excluded.shipper_email,shipper_whatsapp=excluded.shipper_whatsapp,assigned_by=excluded.assigned_by,assigned_at=now(),version=order_shipper_assignments.version+1 returning * into v_assignment;
  update public.orders set lifecycle_version=lifecycle_version+1,updated_at=now() where id=p_order_id;
  perform public.record_audit_event('SHIPPER_ASSIGNED','order',p_order_id,jsonb_build_object('shipper_id',p_shipper_id,'assignment_id',v_assignment.id));
  return jsonb_build_object('assignment',to_jsonb(v_assignment));
end; $$;
revoke all on function public.assign_order_shipper(uuid,uuid,integer) from public; grant execute on function public.assign_order_shipper(uuid,uuid,integer) to authenticated;

create or replace function public.transition_order_fulfilment(p_order_id uuid, p_next_status text, p_expected_version integer, p_reason text default null)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_actor uuid:=auth.uid(); v_order public.orders; v_assignment public.order_shipper_assignments; v_prev text; v_event text; v_finance boolean:=true; v_has_assignment boolean:=false;
begin
  if v_actor is null or not public.fulfilment_admin() then raise exception 'Forbidden'; end if;
  if p_next_status not in ('PROCESSING','DELIVERED','CANCELLED') then raise exception 'Unsupported fulfilment state'; end if;
  if p_next_status='CANCELLED' and coalesce(length(trim(p_reason)),0)<3 then raise exception 'Cancellation reason is required'; end if;
  select * into v_order from public.orders where id=p_order_id for update;
  if not found then raise exception 'Order not found'; end if;
  if p_expected_version is not null and v_order.lifecycle_version <> p_expected_version then raise exception 'Order changed; refresh and retry'; end if;
  v_prev:=v_order.status;
  if p_next_status='PROCESSING' and (v_order.status not in ('CONFIRMED','PROCESSING') or v_order.payment_status<>'PAID' or v_order.verified_payment_reference is null) then raise exception 'Only verified orders may be processed'; end if;
  if p_next_status='DELIVERED' and v_order.status not in ('CONFIRMED','PROCESSING') then raise exception 'Order is not deliverable'; end if;
  if p_next_status='CANCELLED' and v_order.status in ('DELIVERED','CANCELLED') then raise exception 'Order cannot be cancelled from its current state'; end if;
  select * into v_assignment from public.order_shipper_assignments where order_id=p_order_id;
  v_has_assignment := found;
  if p_next_status='PROCESSING' and not v_has_assignment then raise exception 'Assign a verified shipper first'; end if;
  update public.orders set status=p_next_status,lifecycle_version=lifecycle_version+1,updated_at=now(),delivered_at=case when p_next_status='DELIVERED' then now() else delivered_at end,delivered_by=case when p_next_status='DELIVERED' then v_actor else delivered_by end,cancelled_at=case when p_next_status='CANCELLED' then now() else cancelled_at end,cancelled_by=case when p_next_status='CANCELLED' then v_actor else cancelled_by end,cancellation_reason=case when p_next_status='CANCELLED' then trim(p_reason) else cancellation_reason end where id=p_order_id;
  insert into public.order_status_history(order_id,previous_status,new_status,actor_user_id,reason) values(p_order_id,v_prev,p_next_status,v_actor,p_reason);
  if p_next_status='CANCELLED' then
    insert into public.order_cancellation_records(order_id,actor_id,reason,finance_review_required) values(p_order_id,v_actor,trim(p_reason),v_order.payment_status='PAID') on conflict(order_id) do nothing;
    update public.notification_outbox set status='CANCELLED',failure_reason='Order cancelled before preparation delivery' where order_id=p_order_id and event_type in ('SHIPPER_ORDER_PREPARE_EMAIL','SHIPPER_ORDER_PREPARE_WHATSAPP') and status in ('PENDING','RETRYING','PROCESSING');
    v_event:='BUYER_ORDER_CANCELLED'; insert into public.notification_outbox(business_event_id,recipient_user_id,order_id,recipient_scope,channel,payload,idempotency_key) values(v_event||':'||p_order_id,v_order.user_id,p_order_id,'BUYER','EMAIL',jsonb_build_object('order_number',v_order.order_number,'reason',trim(p_reason)),v_event||':'||p_order_id) on conflict do nothing;
    if v_has_assignment then
      insert into public.notification_outbox(business_event_id,order_id,recipient_scope,channel,payload,idempotency_key) values('SHIPPER_ORDER_CANCELLED_EMAIL:'||p_order_id,p_order_id,'SHIPPER','EMAIL',jsonb_build_object('order_number',v_order.order_number,'shipper_email',v_assignment.shipper_email,'instruction','DO NOT FULFIL'), 'SHIPPER_ORDER_CANCELLED_EMAIL:'||p_order_id),('SHIPPER_ORDER_CANCELLED_WHATSAPP:'||p_order_id,p_order_id,'SHIPPER','WHATSAPP',jsonb_build_object('order_number',v_order.order_number,'shipper_whatsapp',v_assignment.shipper_whatsapp,'instruction','DO NOT FULFIL'),'SHIPPER_ORDER_CANCELLED_WHATSAPP:'||p_order_id) on conflict do nothing;
    end if;
    perform public.record_audit_event('ORDER_CANCELLED','order',p_order_id,jsonb_build_object('reason',trim(p_reason),'finance_review_required',v_order.payment_status='PAID'));
  elsif p_next_status='DELIVERED' then
    insert into public.notification_outbox(business_event_id,recipient_user_id,order_id,recipient_scope,channel,payload,idempotency_key) values('BUYER_ORDER_DELIVERED:'||p_order_id,v_order.user_id,p_order_id,'BUYER','EMAIL',jsonb_build_object('order_number',v_order.order_number),'BUYER_ORDER_DELIVERED:'||p_order_id) on conflict do nothing;
    perform public.record_audit_event('ORDER_DELIVERED','order',p_order_id,'{}');
  elsif p_next_status='PROCESSING' then
    insert into public.notification_outbox(business_event_id,recipient_user_id,order_id,recipient_scope,channel,payload,idempotency_key) values('BUYER_ORDER_CONFIRMED:'||p_order_id,v_order.user_id,p_order_id,'BUYER','EMAIL',jsonb_build_object('order_number',v_order.order_number),'BUYER_ORDER_CONFIRMED:'||p_order_id) on conflict do nothing;
    insert into public.notification_outbox(business_event_id,order_id,recipient_scope,channel,payload,idempotency_key) values('SHIPPER_ORDER_PREPARE_EMAIL:'||p_order_id,p_order_id,'SHIPPER','EMAIL',jsonb_build_object('order_number',v_order.order_number,'instruction','PAYMENT VERIFIED - PREPARE ORDER'),'SHIPPER_ORDER_PREPARE_EMAIL:'||p_order_id),('SHIPPER_ORDER_PREPARE_WHATSAPP:'||p_order_id,p_order_id,'SHIPPER','WHATSAPP',jsonb_build_object('order_number',v_order.order_number,'instruction','PAYMENT VERIFIED - PREPARE ORDER'),'SHIPPER_ORDER_PREPARE_WHATSAPP:'||p_order_id) on conflict do nothing;
    perform public.record_audit_event('ORDER_PROCESSING','order',p_order_id,'{}');
  end if;
  return jsonb_build_object('status',p_next_status,'version',v_order.lifecycle_version);
end; $$;
revoke all on function public.transition_order_fulfilment(uuid,text,integer,text) from public; grant execute on function public.transition_order_fulfilment(uuid,text,integer,text) to authenticated;
