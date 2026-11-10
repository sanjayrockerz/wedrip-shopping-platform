create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (char_length(trim(slug)) > 0),
  name text not null check (char_length(trim(name)) > 0),
  product_type text not null check (char_length(trim(product_type)) > 0),
  short_description text,
  description text,
  price_paise integer not null check (price_paise >= 0),
  primary_image_url text not null check (char_length(trim(primary_image_url)) > 0),
  image_alt text not null check (char_length(trim(image_alt)) > 0),
  visual_tone text,
  material text,
  gsm integer check (gsm is null or gsm > 0),
  is_featured boolean not null default false,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
  on public.products for select
  to anon, authenticated
  using (is_active = true);

insert into public.products (id, slug, name, product_type, short_description, description, price_paise, primary_image_url, image_alt, visual_tone, material, gsm, is_featured, display_order, is_active)
values
  ('00000000-0000-4000-8000-000000000001', 'scene-01-heavy-tee', 'Scene 01 / Heavy Tee', 'T-Shirts', 'The everyday uniform, cut with room to move.', 'The everyday uniform, cut with room to move. A dense cotton study from Chennai.', 249000, '/images/wedrip-tee.png', 'WeDrip model wearing a heavyweight tee in an editorial Chennai street scene', 'cream', '100% combed cotton', 240, true, 1, true),
  ('00000000-0000-4000-8000-000000000002', 'after-hours-box-hoodie', 'After Hours / Box Hoodie', 'Hoodies', 'Built for the part of the day that has no name.', 'Built for the part of the day that has no name. A heavy layer with a structured hand-feel.', 429000, '/images/wedrip-hoodie.png', 'WeDrip model wearing a black hoodie against a blue urban backdrop', 'blue', '100% cotton fleece', 420, true, 2, true),
  ('00000000-0000-4000-8000-000000000003', 'studio-02-heavy-tee', 'Studio 02 / Heavy Tee', 'T-Shirts', 'A second study in shape and proportion.', 'A second study in shape and proportion, cut from dense combed cotton.', 249000, '/images/wedrip-tee.png', 'WeDrip model wearing a heavyweight tee in an editorial Chennai street scene', 'orange', '100% combed cotton', 240, true, 3, true),
  ('00000000-0000-4000-8000-000000000004', 'no-fixed-address-hoodie', 'No Fixed Address / Hoodie', 'Hoodies', 'A familiar layer, made less familiar.', 'A familiar layer, made less familiar. Designed to feel lived-in from the first wear.', 429000, '/images/wedrip-hoodie.png', 'WeDrip model wearing a black hoodie against a blue urban backdrop', 'ink', '100% cotton fleece', 420, true, 4, true)
on conflict (slug) do update set name = excluded.name, product_type = excluded.product_type, short_description = excluded.short_description, description = excluded.description, price_paise = excluded.price_paise, primary_image_url = excluded.primary_image_url, image_alt = excluded.image_alt, visual_tone = excluded.visual_tone, material = excluded.material, gsm = excluded.gsm, is_featured = excluded.is_featured, display_order = excluded.display_order, is_active = excluded.is_active, updated_at = now();
