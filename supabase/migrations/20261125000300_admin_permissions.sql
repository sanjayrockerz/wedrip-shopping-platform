-- Phase 1 / Restricted settings capability.
-- Depends on 20260909_account_commerce.sql.

create or replace function public.user_can_manage_settings()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from public.admin_users
    where user_id = auth.uid() and role in ('SUPER_ADMIN', 'ADMIN')
  );
$$;
revoke all on function public.user_can_manage_settings() from public;
grant execute on function public.user_can_manage_settings() to authenticated;
