-- Phase 5 corrective migration: PostgreSQL requires an integer cast for make_interval(mins => ...).
-- This replaces the already-applied worker function without rewriting migration history.
create or replace function public.complete_notification_outbox(p_id uuid, p_worker_id text, p_provider_message_id text, p_error text default null, p_retry boolean default true)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v_attempts integer;
begin
  select attempt_count into v_attempts from public.notification_outbox where id=p_id and locked_by=p_worker_id for update;
  if not found then raise exception 'Notification claim not found'; end if;
  if p_error is null then
    update public.notification_outbox
    set status='SENT', provider_message_id=left(p_provider_message_id,300), sent_at=now(), locked_by=null, locked_at=null, failure_reason=null
    where id=p_id;
  elsif p_retry and v_attempts < 5 then
    update public.notification_outbox
    set status='RETRYING', next_attempt_at=now() + make_interval(mins => (least(60, 2 ^ greatest(v_attempts-1, 0)))::integer), failure_reason=left(p_error,500), locked_by=null, locked_at=null
    where id=p_id;
  else
    update public.notification_outbox
    set status='TERMINALLY_FAILED', failure_reason=left(p_error,500), locked_by=null, locked_at=null
    where id=p_id;
  end if;
end; $$;
revoke all on function public.complete_notification_outbox(uuid,text,text,text,boolean) from public;
grant execute on function public.complete_notification_outbox(uuid,text,text,text,boolean) to service_role;
