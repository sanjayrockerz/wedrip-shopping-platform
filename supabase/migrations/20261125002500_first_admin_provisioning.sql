-- Phase 5 corrective migration: atomic first-admin provisioning.
-- The function is callable only with the server-side service_role context.
create or replace function public.provision_first_admin(
  p_user_id uuid,
  p_role text default 'SUPER_ADMIN'
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid;
  v_audit_id uuid;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Forbidden';
  end if;
  if p_role not in ('SUPER_ADMIN', 'ADMIN') then
    raise exception 'Invalid administrator role';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('wedrip:first-admin-provision', 0));

  if exists (select 1 from public.admin_users) then
    raise exception 'An administrator already exists';
  end if;

  select u.id into v_user_id
  from auth.users u
  where u.id = p_user_id
    and u.email_confirmed_at is not null;
  if v_user_id is null then
    raise exception 'The designated user must exist and have a confirmed email';
  end if;

  insert into public.admin_users(user_id, role)
  values (v_user_id, p_role);

  insert into public.audit_logs(actor_user_id, action, entity_type, entity_id, metadata)
  values (
    v_user_id,
    'FIRST_ADMIN_PROVISIONED',
    'admin_user',
    v_user_id,
    jsonb_build_object('role', p_role, 'provisioning_method', 'owner-authorized-service-operation')
  )
  returning id into v_audit_id;

  return v_user_id;
end;
$$;

revoke all on function public.provision_first_admin(uuid, text) from public;
grant execute on function public.provision_first_admin(uuid, text) to service_role;
