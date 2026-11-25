-- Phase 1 / Trusted audit recording.
-- Depends on 20260912_operations_designs.sql and 20261125000300_admin_permissions.sql.

create or replace function public.record_audit_event(
  p_action text,
  p_entity_type text,
  p_entity_id uuid,
  p_metadata jsonb default '{}'
)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'Unauthorized'; end if;
  if not public.user_is_admin() and p_action not in ('DESIGN_UPLOADED', 'DESIGN_REVISION_REQUESTED', 'DESIGN_APPROVED') then
    raise exception 'Forbidden';
  end if;
  insert into public.audit_logs(actor_user_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), left(trim(p_action), 120), left(trim(p_entity_type), 80), p_entity_id, coalesce(p_metadata, '{}'))
  returning id into v_id;
  return v_id;
end;
$$;
revoke all on function public.record_audit_event(text, text, uuid, jsonb) from public;
grant execute on function public.record_audit_event(text, text, uuid, jsonb) to authenticated;

drop policy if exists "Users create own audit events" on public.audit_logs;
drop policy if exists "Admins read audit events" on public.audit_logs;
create policy "Admins read audit events" on public.audit_logs
  for select using (public.user_can_manage_settings());
