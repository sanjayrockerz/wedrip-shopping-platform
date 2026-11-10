-- Enrich the existing ORDER_CREATED event without coupling checkout to providers.
create or replace function public.enrich_order_created_notification(p_order_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_order public.orders;
  v_email text;
  v_event uuid;
begin
  select * into v_order from public.orders where id = p_order_id and user_id = auth.uid();
  if not found then raise exception 'Order not found'; end if;
  select id into v_event from public.notification_events where order_id = p_order_id and event_type = 'ORDER_CREATED' order by created_at desc limit 1;
  if v_event is null then return; end if;
  select email into v_email from auth.users where id = v_order.user_id;
  update public.notification_events
  set payload = coalesce(payload, '{}'::jsonb) || jsonb_build_object(
    'order_id', v_order.id,
    'order_number', v_order.order_number,
    'customer', jsonb_build_object('id', v_order.user_id, 'email', v_email, 'name', v_order.shipping_address->>'name', 'phone', v_order.shipping_address->>'phone'),
    'shipping_address', v_order.shipping_address,
    'items', coalesce((select jsonb_agg(jsonb_build_object('product', product_name, 'size', size, 'quantity', quantity, 'unit_price_paise', unit_price_paise)) from public.order_items where order_id = p_order_id), '[]'::jsonb),
    'subtotal_paise', v_order.subtotal_paise,
    'discount_paise', v_order.discount_paise,
    'shipping_paise', v_order.shipping_paise,
    'tax_paise', v_order.tax_paise,
    'total_paise', v_order.total_paise,
    'designs', coalesce((select jsonb_agg(jsonb_build_object('design_id', id, 'order_item_id', order_item_id, 'version', current_version, 'status', status, 'filename', filename)) from public.designs where order_id = p_order_id), '[]'::jsonb)
  )
  where id = v_event;
end;
$$;
revoke all on function public.enrich_order_created_notification(uuid) from public;
grant execute on function public.enrich_order_created_notification(uuid) to authenticated;

create or replace function public.sync_order_created_design_event()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.notification_events
  set payload = coalesce(payload, '{}'::jsonb) || jsonb_build_object(
    'designs', coalesce((select jsonb_agg(jsonb_build_object('design_id', id, 'order_item_id', order_item_id, 'version', current_version, 'status', status, 'filename', filename)) from public.designs where order_id = new.order_id), '[]'::jsonb)
  )
  where order_id = new.order_id and event_type = 'ORDER_CREATED';
  return new;
end;
$$;
drop trigger if exists sync_order_created_design_event on public.designs;
create trigger sync_order_created_design_event after insert or update on public.designs for each row execute function public.sync_order_created_design_event();
