-- Phase 2 security: payment approval is only an authenticated trusted admin operation.
create or replace function public.user_can_verify_payments() returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select exists(select 1 from public.admin_users where user_id = auth.uid() and role in ('SUPER_ADMIN','ADMIN'));
$$;
revoke all on function public.user_can_verify_payments() from public; grant execute on function public.user_can_verify_payments() to authenticated;

