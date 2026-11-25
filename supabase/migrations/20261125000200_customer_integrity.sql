-- Phase 1 / Customer-owned record indexes and compatibility fields.
-- Depends on 20261125000001_auth_profile.sql.

create index if not exists wishlist_items_product_idx
  on public.wishlist_items(product_id);
create index if not exists profiles_name_search_idx
  on public.profiles(first_name, last_name);
