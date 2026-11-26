-- Phase 5 corrective migration: replace broad ORDER_MANAGER RLS with role-scoped permissions.
create or replace function public.user_can_manage_catalog()
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select exists(select 1 from public.admin_users where user_id=auth.uid() and role in ('SUPER_ADMIN','ADMIN','CONTENT_MANAGER'));
$$;
create or replace function public.user_can_manage_commerce()
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select exists(select 1 from public.admin_users where user_id=auth.uid() and role in ('SUPER_ADMIN','ADMIN'));
$$;
create or replace function public.user_can_manage_orders()
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select exists(select 1 from public.admin_users where user_id=auth.uid() and role in ('SUPER_ADMIN','ADMIN','ORDER_MANAGER'));
$$;
revoke all on function public.user_can_manage_catalog(), public.user_can_manage_commerce(), public.user_can_manage_orders() from public;
grant execute on function public.user_can_manage_catalog(), public.user_can_manage_commerce(), public.user_can_manage_orders() to authenticated;

drop policy if exists "Admins manage orders" on public.orders;
create policy "Order staff manage orders" on public.orders for all using (public.user_can_manage_orders()) with check (public.user_can_manage_orders());
drop policy if exists "Admins manage order items" on public.order_items;
create policy "Order staff manage order items" on public.order_items for all using (public.user_can_manage_orders()) with check (public.user_can_manage_orders());
drop policy if exists "Admins manage variants" on public.product_variants;
create policy "Catalog staff manage variants" on public.product_variants for all using (public.user_can_manage_catalog()) with check (public.user_can_manage_catalog());
drop policy if exists "Admins manage commerce operations" on public.promos;
create policy "Commerce admins manage promos" on public.promos for all using (public.user_can_manage_commerce()) with check (public.user_can_manage_commerce());
drop policy if exists "Admins read redemptions" on public.promo_redemptions;
create policy "Commerce admins read redemptions" on public.promo_redemptions for select using (public.user_can_manage_commerce());
drop policy if exists "Admins manage order timeline" on public.order_status_history;
create policy "Order staff manage order timeline" on public.order_status_history for all using (public.user_can_manage_orders()) with check (public.user_can_manage_orders());
drop policy if exists "Admins manage designs" on public.designs;
create policy "Order staff manage designs" on public.designs for all using (public.user_can_manage_orders()) with check (public.user_can_manage_orders());
drop policy if exists "Admins manage design versions" on public.design_versions;
create policy "Order staff manage design versions" on public.design_versions for all using (public.user_can_manage_orders()) with check (public.user_can_manage_orders());
drop policy if exists "Admins manage design approvals" on public.design_approvals;
create policy "Order staff manage design approvals" on public.design_approvals for all using (public.user_can_manage_orders()) with check (public.user_can_manage_orders());
drop policy if exists "Admins manage notifications" on public.notification_events;
create policy "Order staff manage notifications" on public.notification_events for all using (public.user_can_manage_orders()) with check (public.user_can_manage_orders());
drop policy if exists "Admins manage payments" on public.payment_events;
create policy "Payment admins manage payment events" on public.payment_events for all using (public.user_can_verify_payments()) with check (public.user_can_verify_payments());

drop policy if exists "Admins manage notification outbox" on public.notification_outbox;
create policy "Order staff manage notification outbox" on public.notification_outbox for all using (public.user_can_manage_orders()) with check (public.user_can_manage_orders());
drop policy if exists "Admins manage order shipper assignments" on public.order_shipper_assignments;
create policy "Order staff manage shipper assignments" on public.order_shipper_assignments for all using (public.user_can_manage_orders()) with check (public.user_can_manage_orders());
drop policy if exists "Admins manage cancellation records" on public.order_cancellation_records;
create policy "Order staff manage cancellation records" on public.order_cancellation_records for all using (public.user_can_manage_orders()) with check (public.user_can_manage_orders());
