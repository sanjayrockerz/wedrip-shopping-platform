-- Persistent commerce transaction layer. Stock is nullable by design: NULL means
-- inventory has not been configured and is never treated as available.
create extension if not exists pgcrypto;

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size text not null check (char_length(trim(size)) > 0),
  color text,
  sku text unique,
  price_paise integer check (price_paise is null or price_paise >= 0),
  stock_quantity integer check (stock_quantity is null or stock_quantity >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(product_id, size, color)
);
create index if not exists product_variants_product_idx on public.product_variants(product_id);

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id),
  variant_id uuid not null references public.product_variants(id),
  quantity integer not null check (quantity > 0 and quantity <= 20),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(cart_id, variant_id)
);

create table if not exists public.promos (
  id uuid primary key default gen_random_uuid(), code text unique not null,
  discount_type text not null check (discount_type in ('PERCENTAGE','FIXED')),
  discount_value integer not null check (discount_value > 0),
  minimum_order_paise integer not null default 0 check (minimum_order_paise >= 0),
  maximum_discount_paise integer check (maximum_discount_paise is null or maximum_discount_paise >= 0),
  starts_at timestamptz, ends_at timestamptz, active boolean not null default true,
  usage_limit integer check (usage_limit is null or usage_limit > 0),
  per_customer_limit integer check (per_customer_limit is null or per_customer_limit > 0),
  product_ids uuid[] not null default '{}', collection_keys text[] not null default '{}',
  created_at timestamptz not null default now()
);
create table if not exists public.promo_redemptions (
  id uuid primary key default gen_random_uuid(), promo_id uuid not null references public.promos(id),
  user_id uuid not null references auth.users(id), order_id uuid references public.orders(id),
  created_at timestamptz not null default now(), unique(promo_id, order_id)
);

alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check check (status in ('PENDING','PAYMENT_PENDING','PAID','CONFIRMED','PROCESSING','DESIGN_REVIEW','PRODUCTION','PACKED','SHIPPED','DELIVERED','CANCELLED','RETURN_REQUESTED','RETURNED','REFUND_PENDING','REFUNDED'));
alter table public.orders add column if not exists promo_id uuid references public.promos(id);
alter table public.orders add column if not exists discount_code text;
alter table public.order_items add column if not exists variant_id uuid references public.product_variants(id);
alter table public.order_items add column if not exists variant_snapshot jsonb;

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade,
  previous_status text, new_status text not null, actor_user_id uuid references auth.users(id),
  reason text, metadata jsonb not null default '{}', created_at timestamptz not null default now()
);
create table if not exists public.designs (
  id uuid primary key default gen_random_uuid(), customer_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade, order_item_id uuid references public.order_items(id) on delete set null,
  filename text not null, mime_type text not null, size_bytes bigint not null check (size_bytes > 0), storage_path text not null,
  current_version integer not null default 1, status text not null default 'UPLOADED' check (status in ('UPLOADED','IN_REVIEW','SENT_TO_CUSTOMER','REVISION_REQUESTED','APPROVED','PRODUCTION')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.design_versions (
  id uuid primary key default gen_random_uuid(), design_id uuid not null references public.designs(id) on delete cascade,
  version integer not null, filename text not null, mime_type text not null, size_bytes bigint not null check (size_bytes > 0), storage_path text not null,
  status text not null default 'UPLOADED' check (status in ('UPLOADED','IN_REVIEW','SENT_TO_CUSTOMER','REVISION_REQUESTED','APPROVED','PRODUCTION')),
  created_at timestamptz not null default now(), unique(design_id, version)
);
create table if not exists public.design_approvals (
  id uuid primary key default gen_random_uuid(), design_version_id uuid not null references public.design_versions(id) on delete cascade,
  customer_id uuid not null references auth.users(id), approved boolean not null, note text, created_at timestamptz not null default now()
);
create table if not exists public.notification_events (
  id uuid primary key default gen_random_uuid(), event_type text not null, order_id uuid references public.orders(id) on delete cascade,
  user_id uuid references auth.users(id), payload jsonb not null default '{}', provider text, status text not null default 'NOT_CONFIGURED' check (status in ('PENDING','SENT','FAILED','NOT_CONFIGURED')),
  created_at timestamptz not null default now(), sent_at timestamptz
);
create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(), order_id uuid references public.orders(id) on delete cascade,
  provider text, event_type text not null, status text not null default 'NOT_CONFIGURED', payload jsonb not null default '{}', created_at timestamptz not null default now()
);

alter table public.product_variants enable row level security;
alter table public.carts enable row level security; alter table public.cart_items enable row level security;
alter table public.promos enable row level security; alter table public.promo_redemptions enable row level security;
alter table public.order_status_history enable row level security; alter table public.designs enable row level security;
alter table public.design_versions enable row level security; alter table public.design_approvals enable row level security;
alter table public.notification_events enable row level security; alter table public.payment_events enable row level security;

create policy "Public read active variants" on public.product_variants for select to anon, authenticated using (active = true);
create policy "Users manage own cart" on public.carts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own cart items" on public.cart_items for all using (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())) with check (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()));
create policy "Users read own order timeline" on public.order_status_history for select using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "Users manage own designs" on public.designs for all using (auth.uid() = customer_id) with check (auth.uid() = customer_id);
create policy "Users read own design versions" on public.design_versions for select using (exists (select 1 from public.designs d where d.id = design_id and d.customer_id = auth.uid()));
create policy "Users manage own approvals" on public.design_approvals for all using (auth.uid() = customer_id) with check (auth.uid() = customer_id);
create policy "Users read own notifications" on public.notification_events for select using (auth.uid() = user_id);
create policy "Users read own payment events" on public.payment_events for select using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create or replace function public.user_is_admin() returns boolean language sql stable security definer set search_path = public as $$ select exists(select 1 from public.admin_users where user_id = auth.uid() and role in ('SUPER_ADMIN','ADMIN','ORDER_MANAGER')); $$;
create policy "Admins manage orders" on public.orders for all using (public.user_is_admin()) with check (public.user_is_admin());
create policy "Admins manage order items" on public.order_items for all using (public.user_is_admin()) with check (public.user_is_admin());
create policy "Admins manage variants" on public.product_variants for all using (public.user_is_admin()) with check (public.user_is_admin());

create or replace function public.user_is_admin() returns boolean language sql stable security definer set search_path = public as $$ select exists(select 1 from public.admin_users where user_id = auth.uid() and role in ('SUPER_ADMIN','ADMIN','ORDER_MANAGER')); $$;
create policy "Admins manage commerce operations" on public.promos for all using (public.user_is_admin()) with check (public.user_is_admin());
create policy "Admins read redemptions" on public.promo_redemptions for select using (public.user_is_admin());
create policy "Admins manage order timeline" on public.order_status_history for all using (public.user_is_admin()) with check (public.user_is_admin());
create policy "Admins manage designs" on public.designs for all using (public.user_is_admin()) with check (public.user_is_admin());
create policy "Admins manage design versions" on public.design_versions for all using (public.user_is_admin()) with check (public.user_is_admin());
create policy "Admins manage design approvals" on public.design_approvals for all using (public.user_is_admin()) with check (public.user_is_admin());
create policy "Admins manage notifications" on public.notification_events for all using (public.user_is_admin()) with check (public.user_is_admin());
create policy "Admins manage payments" on public.payment_events for all using (public.user_is_admin()) with check (public.user_is_admin());

create or replace function public.create_order_from_cart(p_address_id uuid, p_discount_code text default null)
returns public.orders language plpgsql security definer set search_path = public as $$
declare v_user uuid := auth.uid(); v_cart uuid; v_sub integer := 0; v_discount integer := 0; v_shipping integer := 0; v_tax integer := 0; v_total integer; v_order public.orders; v_promo promos; v_address addresses; v_item record; v_price integer; v_code text;
begin
  if v_user is null then raise exception 'Unauthorized'; end if;
  select * into v_address from addresses where id = p_address_id and user_id = v_user;
  if not found then raise exception 'Shipping address is invalid'; end if;
  select id into v_cart from carts where user_id = v_user for update;
  if v_cart is null then raise exception 'Cart is empty'; end if;
  if not exists(select 1 from cart_items where cart_id = v_cart) then raise exception 'Cart is empty'; end if;
  for v_item in select ci.*, p.name, p.primary_image_url, p.slug, pv.size, pv.color, pv.sku, coalesce(pv.price_paise, p.price_paise) as authoritative_price, pv.stock_quantity, pv.active, pv.product_id as variant_product_id from cart_items ci join products p on p.id=ci.product_id join product_variants pv on pv.id=ci.variant_id where ci.cart_id=v_cart for update of pv loop
    if not v_item.active or v_item.variant_product_id <> v_item.product_id or v_item.stock_quantity is null then raise exception 'A cart item is unavailable'; end if;
    if v_item.quantity > v_item.stock_quantity then raise exception 'A cart item exceeds available stock'; end if;
    v_price := v_item.authoritative_price; v_sub := v_sub + v_price * v_item.quantity;
  end loop;
  if p_discount_code is not null and trim(p_discount_code) <> '' then
    v_code := upper(trim(p_discount_code)); select * into v_promo from promos where upper(code)=v_code and active and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at >= now());
    if not found then raise exception 'Promo code is invalid or expired'; end if;
    if v_sub < v_promo.minimum_order_paise then raise exception 'Minimum order value not met'; end if;
    if v_promo.usage_limit is not null and (select count(*) from promo_redemptions where promo_id=v_promo.id) >= v_promo.usage_limit then raise exception 'Promo usage limit reached'; end if;
    if v_promo.per_customer_limit is not null and (select count(*) from promo_redemptions where promo_id=v_promo.id and user_id=v_user) >= v_promo.per_customer_limit then raise exception 'Promo customer limit reached'; end if;
    if v_promo.discount_type='PERCENTAGE' then v_discount := floor(v_sub * v_promo.discount_value / 100); else v_discount := v_promo.discount_value; end if;
    if v_promo.maximum_discount_paise is not null then v_discount := least(v_discount, v_promo.maximum_discount_paise); end if; v_discount := least(v_discount, v_sub);
  end if;
  v_total := v_sub - v_discount + v_shipping + v_tax;
  insert into orders(order_number,user_id,status,payment_status,subtotal_paise,discount_paise,shipping_paise,tax_paise,total_paise,shipping_address,promo_id,discount_code) values ('WD-'||to_char(now(),'YYYYMMDD')||'-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)),v_user,'PAYMENT_PENDING','UNPAID',v_sub,v_discount,v_shipping,v_tax,v_total,to_jsonb(v_address),v_promo.id,case when v_promo.id is null then null else v_promo.code end) returning * into v_order;
  for v_item in select ci.*, p.name,p.slug,p.primary_image_url,pv.size,pv.color,pv.sku,coalesce(pv.price_paise,p.price_paise) as authoritative_price from cart_items ci join products p on p.id=ci.product_id join product_variants pv on pv.id=ci.variant_id where ci.cart_id=v_cart loop
    insert into order_items(order_id,product_id,product_name,size,quantity,unit_price_paise,variant_id,variant_snapshot) values(v_order.id,v_item.product_id,v_item.name,v_item.size,v_item.quantity,v_item.authoritative_price,v_item.variant_id,jsonb_build_object('size',v_item.size,'color',v_item.color,'sku',v_item.sku,'slug',v_item.slug,'image',v_item.primary_image_url));
    update product_variants set stock_quantity=stock_quantity-v_item.quantity, updated_at=now() where id=v_item.variant_id;
  end loop;
  if v_promo.id is not null then insert into promo_redemptions(promo_id,user_id,order_id) values(v_promo.id,v_user,v_order.id); end if;
  insert into order_status_history(order_id,new_status,actor_user_id,reason) values(v_order.id,'PAYMENT_PENDING',v_user,'Order created; payment confirmation required');
  insert into notification_events(event_type,order_id,user_id,payload) values('ORDER_CREATED',v_order.id,v_user,jsonb_build_object('order_id',v_order.id,'order_number',v_order.order_number));
  delete from cart_items where cart_id=v_cart; update carts set updated_at=now() where id=v_cart;
  return v_order;
end; $$;
revoke all on function public.create_order_from_cart(uuid,text) from public; grant execute on function public.create_order_from_cart(uuid,text) to authenticated;
