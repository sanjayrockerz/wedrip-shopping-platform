-- Phase 4: authoritative financial and operational reporting. Aggregates the
-- verified monetary ledger and immutable order snapshots inside PostgreSQL.
alter table public.order_cancellation_records add column if not exists finance_review_status text not null default 'OPEN' check (finance_review_status in ('OPEN','RESOLVED'));
alter table public.order_cancellation_records add column if not exists finance_resolved_at timestamptz;
alter table public.order_cancellation_records add column if not exists finance_resolution_notes text;
create index if not exists monetary_events_verified_created_idx on public.monetary_events(event_type, created_at, order_id);
create index if not exists payment_submissions_review_idx on public.payment_submissions(status, submitted_at);
create index if not exists cancellation_finance_review_idx on public.order_cancellation_records(finance_review_status, created_at);

create or replace function public.user_can_view_reporting() returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select exists(select 1 from public.admin_users where user_id=auth.uid() and role in ('SUPER_ADMIN','ADMIN'));
$$;
revoke all on function public.user_can_view_reporting() from public; grant execute on function public.user_can_view_reporting() to authenticated;
drop policy if exists "Admins manage monetary events" on public.monetary_events;
drop policy if exists "Admins manage bank verifications" on public.bank_verifications;
create policy "Admins read monetary events" on public.monetary_events for select using (public.user_can_view_reporting());
create policy "Admins read bank verifications" on public.bank_verifications for select using (public.user_can_view_reporting());
revoke insert, update, delete on public.monetary_events, public.bank_verifications from authenticated;

create or replace function public.get_admin_reporting_summary(p_week_start timestamptz, p_week_end timestamptz)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_week jsonb; v_lifetime jsonb; v_pending integer; v_held integer; v_processing integer; v_delivered integer; v_cancelled integer; v_failed_email integer; v_failed_whatsapp integer; v_pending_notifications integer; v_finance integer; v_oldest timestamptz; v_expired integer; v_unassigned integer; v_assigned_waiting integer; v_stuck integer; v_as_of timestamptz:=now();
begin
  if auth.uid() is null or not public.user_can_view_reporting() then raise exception 'Forbidden'; end if;
  if p_week_start is null or p_week_end is null or p_week_end <= p_week_start or p_week_end-p_week_start > interval '8 days' then raise exception 'Invalid reporting period'; end if;
  select jsonb_build_object('verified_amount_paise',coalesce((select sum(x.amount_paise) from (select distinct on (me.order_id) me.order_id,me.amount_paise from public.monetary_events me where me.event_type='PAYMENT_VERIFIED' and me.created_at>=p_week_start and me.created_at<p_week_end order by me.order_id,me.created_at,me.id) x),0),'units_sold',coalesce((select sum(oi.quantity) from public.order_items oi where exists(select 1 from public.monetary_events m2 where m2.order_id=oi.order_id and m2.event_type='PAYMENT_VERIFIED' and m2.created_at>=p_week_start and m2.created_at<p_week_end)),0),'verified_order_count',(select count(distinct me.order_id) from public.monetary_events me where me.event_type='PAYMENT_VERIFIED' and me.created_at>=p_week_start and me.created_at<p_week_end)) into v_week;
  select jsonb_build_object('verified_amount_paise',coalesce((select sum(x.amount_paise) from (select distinct on (me.order_id) me.order_id,me.amount_paise from public.monetary_events me where me.event_type='PAYMENT_VERIFIED' order by me.order_id,me.created_at,me.id) x),0),'units_sold',coalesce((select sum(oi.quantity) from public.order_items oi where exists(select 1 from public.monetary_events m2 where m2.order_id=oi.order_id and m2.event_type='PAYMENT_VERIFIED')),0),'verified_order_count',(select count(distinct me.order_id) from public.monetary_events me where me.event_type='PAYMENT_VERIFIED')) into v_lifetime;
  select count(*) into v_pending from public.payment_submissions where status in ('SUBMITTED','UNDER_REVIEW');
  select count(*) into v_held from public.payment_submissions where status='HOLD';
  select count(*) into v_processing from public.orders where status='PROCESSING' and payment_status='PAID';
  select count(*) into v_delivered from public.orders where status='DELIVERED' and payment_status='PAID';
  select count(*) into v_cancelled from public.orders where status='CANCELLED' and payment_status='PAID';
  select count(*) into v_failed_email from public.notification_outbox where channel='EMAIL' and status in ('FAILED','RETRYING','TERMINALLY_FAILED');
  select count(*) into v_failed_whatsapp from public.notification_outbox where channel='WHATSAPP' and status in ('FAILED','RETRYING','TERMINALLY_FAILED');
  select count(*) into v_pending_notifications from public.notification_outbox where status in ('PENDING','PROCESSING','RETRYING');
  select count(*),min(submitted_at) into v_pending,v_oldest from public.payment_submissions where status in ('SUBMITTED','UNDER_REVIEW');
  select count(*) into v_finance from public.payment_exceptions where review_state='OPEN';
  select v_finance + count(*) into v_finance from public.order_cancellation_records where finance_review_status='OPEN' and finance_review_required=true;
  select count(*) into v_expired from public.checkouts where status='EXPIRED';
  select count(*) into v_unassigned from public.orders o where o.status='CONFIRMED' and o.payment_status='PAID' and o.verified_payment_reference is not null and not exists(select 1 from public.order_shipper_assignments a where a.order_id=o.id);
  select count(*) into v_assigned_waiting from public.orders o where o.status='CONFIRMED' and exists(select 1 from public.order_shipper_assignments a where a.order_id=o.id);
  select count(*) into v_stuck from public.notification_outbox where status='PROCESSING' and locked_at < now()-interval '15 minutes';
  return jsonb_build_object('time_zone','Asia/Kolkata','week_start',p_week_start,'week_end',p_week_end,'as_of',v_as_of,'weekly',v_week,'lifetime',v_lifetime,'operations',jsonb_build_object('pending_payment_review_count',v_pending,'held_payment_count',v_held,'processing_count',v_processing,'delivered_count',v_delivered,'cancelled_count',v_cancelled,'failed_email_count',v_failed_email,'failed_whatsapp_count',v_failed_whatsapp,'pending_notification_count',v_pending_notifications,'finance_review_count',v_finance,'oldest_pending_payment_at',v_oldest,'expired_checkout_count',v_expired,'confirmed_awaiting_shipper_count',v_unassigned,'assigned_awaiting_processing_count',v_assigned_waiting,'stuck_processing_notification_count',v_stuck));
end; $$;
revoke all on function public.get_admin_reporting_summary(timestamptz,timestamptz) from public; grant execute on function public.get_admin_reporting_summary(timestamptz,timestamptz) to authenticated;
