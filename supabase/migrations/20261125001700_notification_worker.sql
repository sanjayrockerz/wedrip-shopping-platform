-- Phase 3G: SKIP LOCKED claims and bounded retry state. Provider delivery remains disabled by configuration.
create or replace function public.claim_notification_outbox(p_worker_id text, p_limit integer default 20)
returns setof public.notification_outbox language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if p_worker_id is null or length(trim(p_worker_id)) < 8 then raise exception 'Invalid worker'; end if;
  return query with candidates as (select n.id from public.notification_outbox n left join public.orders o on o.id=n.order_id where n.status in ('PENDING','RETRYING') and (n.next_attempt_at is null or n.next_attempt_at<=now()) and (n.order_id is null or o.status not in ('CANCELLED','DELIVERED') or n.event_type in ('BUYER_ORDER_CANCELLED','SHIPPER_ORDER_CANCELLED_EMAIL','SHIPPER_ORDER_CANCELLED_WHATSAPP','BUYER_ORDER_DELIVERED')) order by n.created_at for update of n skip locked limit greatest(1,least(p_limit,100))) update public.notification_outbox n set status='PROCESSING',locked_by=trim(p_worker_id),locked_at=now(),attempt_count=n.attempt_count+1,last_attempt_at=now() from candidates c where n.id=c.id returning n.*;
end; $$;
revoke all on function public.claim_notification_outbox(text,integer) from public; grant execute on function public.claim_notification_outbox(text,integer) to service_role;

create or replace function public.complete_notification_outbox(p_id uuid, p_worker_id text, p_provider_message_id text, p_error text default null, p_retry boolean default true)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v_attempts integer;
begin
  select attempt_count into v_attempts from public.notification_outbox where id=p_id and locked_by=p_worker_id for update;
  if not found then raise exception 'Notification claim not found'; end if;
  if p_error is null then update public.notification_outbox set status='SENT',provider_message_id=left(p_provider_message_id,300),sent_at=now(),locked_by=null,locked_at=null,failure_reason=null where id=p_id;
  elsif p_retry and v_attempts < 5 then update public.notification_outbox set status='RETRYING',next_attempt_at=now() + make_interval(mins => least(60,2^greatest(v_attempts-1,0))),failure_reason=left(p_error,500),locked_by=null,locked_at=null where id=p_id;
  else update public.notification_outbox set status='TERMINALLY_FAILED',failure_reason=left(p_error,500),locked_by=null,locked_at=null where id=p_id; end if;
end; $$;
revoke all on function public.complete_notification_outbox(uuid,text,text,text,boolean) from public; grant execute on function public.complete_notification_outbox(uuid,text,text,text,boolean) to service_role;
