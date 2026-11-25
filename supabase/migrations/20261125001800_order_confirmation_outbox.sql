-- Phase 3: every newly confirmed order gets one buyer confirmation event after the
-- Phase 2 approval transaction commits its order row. This is idempotent.
create or replace function public.enqueue_buyer_order_confirmation()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if new.status = 'CONFIRMED' and new.payment_status = 'PAID' then
    insert into public.notification_outbox(business_event_id,recipient_user_id,order_id,recipient_scope,channel,payload,idempotency_key)
    values('BUYER_ORDER_CONFIRMED:'||new.id,new.user_id,new.id,'BUYER','EMAIL',jsonb_build_object('order_number',new.order_number),'BUYER_ORDER_CONFIRMED:'||new.id)
    on conflict do nothing;
  end if;
  return new;
end; $$;
drop trigger if exists orders_confirmation_outbox on public.orders;
create trigger orders_confirmation_outbox after insert on public.orders for each row execute function public.enqueue_buyer_order_confirmation();
revoke all on function public.enqueue_buyer_order_confirmation() from public;
