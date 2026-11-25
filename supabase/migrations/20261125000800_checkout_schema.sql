-- Phase 2A: frozen customer-owned checkout quotes. Does not create orders or reserve stock.
create table if not exists public.checkouts (
  id uuid primary key default gen_random_uuid(), customer_id uuid not null references auth.users(id) on delete cascade,
  idempotency_key text not null, checkout_reference text not null unique, currency text not null default 'INR' check (currency = 'INR'),
  subtotal_paise bigint not null check (subtotal_paise >= 0), discount_paise bigint not null check (discount_paise >= 0),
  shipping_paise bigint not null default 0 check (shipping_paise = 0), final_amount_paise bigint not null check (final_amount_paise >= 0),
  coupon_snapshot jsonb, customer_snapshot jsonb not null, delivery_address_snapshot jsonb not null,
  status text not null default 'READY_FOR_PAYMENT' check (status in ('READY_FOR_PAYMENT','PAYMENT_SUBMITTED','UNDER_REVIEW','HOLD','REJECTED','VERIFIED','EXPIRED','CANCELLED')),
  expires_at timestamptz not null, version integer not null default 1 check (version > 0), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(customer_id, idempotency_key)
);
create table if not exists public.checkout_items (
  id uuid primary key default gen_random_uuid(), checkout_id uuid not null references public.checkouts(id) on delete cascade,
  product_id uuid not null references public.products(id), variant_id uuid not null references public.product_variants(id),
  product_name text not null, product_slug text, image_url text, selected_size text not null, quantity integer not null check (quantity between 1 and 20),
  unit_price_paise bigint not null check (unit_price_paise >= 0), line_discount_paise bigint not null default 0 check (line_discount_paise >= 0), line_total_paise bigint not null check (line_total_paise >= 0),
  snapshot jsonb not null default '{}'
);
create index if not exists checkouts_customer_status_idx on public.checkouts(customer_id, status, created_at desc);
create index if not exists checkout_items_checkout_idx on public.checkout_items(checkout_id);
alter table public.checkouts enable row level security; alter table public.checkout_items enable row level security;
drop policy if exists "Customers read own checkouts" on public.checkouts; create policy "Customers read own checkouts" on public.checkouts for select using (auth.uid() = customer_id);
drop policy if exists "Customers read own checkout items" on public.checkout_items; create policy "Customers read own checkout items" on public.checkout_items for select using (exists(select 1 from public.checkouts c where c.id = checkout_id and c.customer_id = auth.uid()));
revoke all on public.checkouts, public.checkout_items from anon, authenticated;
grant select on public.checkouts, public.checkout_items to authenticated;

create or replace function public.create_checkout_from_cart(p_address_id uuid, p_discount_code text, p_idempotency_key text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_user uuid := auth.uid(); v_cart uuid; v_checkout public.checkouts; v_address public.addresses; v_profile public.profiles; v_promo public.promos; v_item record; v_sub bigint := 0; v_discount bigint := 0; v_code text; v_ref text;
begin
  if v_user is null then raise exception 'Unauthorized'; end if;
  if p_idempotency_key is null or length(trim(p_idempotency_key)) < 16 or length(trim(p_idempotency_key)) > 100 then raise exception 'Invalid checkout request'; end if;
  select * into v_checkout from public.checkouts where customer_id = v_user and idempotency_key = trim(p_idempotency_key);
  if found then return jsonb_build_object('checkout', to_jsonb(v_checkout), 'reused', true); end if;
  select * into v_address from public.addresses where id = p_address_id and user_id = v_user;
  if not found then raise exception 'Shipping address is invalid'; end if;
  select * into v_profile from public.profiles where id = v_user;
  select id into v_cart from public.carts where user_id = v_user for update;
  if v_cart is null or not exists(select 1 from public.cart_items where cart_id = v_cart) then raise exception 'Your bag is empty'; end if;
  for v_item in select ci.*, p.name, p.slug, p.primary_image_url, pv.size, pv.color, pv.sku, coalesce(pv.price_paise,p.price_paise) as authoritative_price, pv.stock_quantity, pv.active, pv.product_id as variant_product_id from public.cart_items ci join public.products p on p.id=ci.product_id join public.product_variants pv on pv.id=ci.variant_id where ci.cart_id=v_cart for update of pv loop
    if not v_item.active or v_item.variant_product_id <> v_item.product_id or v_item.stock_quantity is null or v_item.quantity > v_item.stock_quantity then raise exception 'A cart item is unavailable'; end if;
    if v_item.authoritative_price is null or v_item.authoritative_price < 0 then raise exception 'A cart item has no valid price'; end if;
    v_sub := v_sub + (v_item.authoritative_price::bigint * v_item.quantity);
  end loop;
  if p_discount_code is not null and trim(p_discount_code) <> '' then
    v_code := upper(trim(p_discount_code)); select * into v_promo from public.promos where upper(code)=v_code and active and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at >= now());
    if not found or v_sub < v_promo.minimum_order_paise then raise exception 'Promo code is invalid or expired'; end if;
    if v_promo.usage_limit is not null and (select count(*) from public.promo_redemptions where promo_id=v_promo.id) >= v_promo.usage_limit then raise exception 'Promo usage limit reached'; end if;
    if v_promo.per_customer_limit is not null and (select count(*) from public.promo_redemptions where promo_id=v_promo.id and user_id=v_user) >= v_promo.per_customer_limit then raise exception 'Promo customer limit reached'; end if;
    if v_promo.discount_type='PERCENTAGE' then v_discount := floor(v_sub * v_promo.discount_value / 100); else v_discount := v_promo.discount_value; end if;
    v_discount := least(v_discount, coalesce(v_promo.maximum_discount_paise, v_discount), v_sub);
  end if;
  v_ref := 'WD-Q-' || to_char(now(),'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
  insert into public.checkouts(customer_id,idempotency_key,checkout_reference,subtotal_paise,discount_paise,shipping_paise,final_amount_paise,coupon_snapshot,customer_snapshot,delivery_address_snapshot,expires_at)
  values(v_user,trim(p_idempotency_key),v_ref,v_sub,v_discount,0,v_sub-v_discount,case when v_promo.id is null then null else jsonb_build_object('id',v_promo.id,'code',v_promo.code,'percentage',case when v_promo.discount_type='PERCENTAGE' then v_promo.discount_value else null end,'discount_value',v_promo.discount_value) end,jsonb_build_object('id',v_user,'email',(select email from auth.users where id=v_user),'full_name',coalesce(v_profile.first_name||' '||v_profile.last_name,v_profile.full_name),'phone',v_profile.phone),to_jsonb(v_address),now() + interval '48 hours') returning * into v_checkout;
  for v_item in select ci.*, p.name, p.slug, p.primary_image_url, pv.size, pv.color, pv.sku, coalesce(pv.price_paise,p.price_paise) as authoritative_price from public.cart_items ci join public.products p on p.id=ci.product_id join public.product_variants pv on pv.id=ci.variant_id where ci.cart_id=v_cart loop
    insert into public.checkout_items(checkout_id,product_id,variant_id,product_name,product_slug,image_url,selected_size,quantity,unit_price_paise,line_total_paise,snapshot) values(v_checkout.id,v_item.product_id,v_item.variant_id,v_item.name,v_item.slug,v_item.primary_image_url,v_item.size,v_item.quantity,v_item.authoritative_price,v_item.authoritative_price*v_item.quantity,jsonb_build_object('color',v_item.color,'sku',v_item.sku,'size',v_item.size,'slug',v_item.slug,'image',v_item.primary_image_url));
  end loop;
  return jsonb_build_object('checkout',to_jsonb(v_checkout),'reused',false);
end; $$;
revoke all on function public.create_checkout_from_cart(uuid,text,text) from public; grant execute on function public.create_checkout_from_cart(uuid,text,text) to authenticated;

