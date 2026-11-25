-- Phase 1 / Auth and profile lifecycle.
-- Depends on 20260909_account_commerce.sql and 20260910_account_fields_wishlist.sql.

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, first_name, last_name)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'first_name', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'last_name', '')), '')
  ) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.addresses add column if not exists landmark text;
create index if not exists addresses_user_default_idx
  on public.addresses(user_id, is_default desc, updated_at desc);
