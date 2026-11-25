-- Phase 1 / Percentage discount integrity.
-- Existing rows remain untouched until staging preflight confirms they are valid.

alter table public.promos add column if not exists updated_at timestamptz not null default now();
alter table public.promos add constraint promos_code_format_check
  check (code ~ '^[A-Z0-9]{4,20}$') not valid;
alter table public.promos add constraint promos_percentage_range_check
  check (discount_type <> 'PERCENTAGE' or discount_value between 1 and 99) not valid;
alter table public.promos add constraint promos_validity_window_check
  check (ends_at is null or starts_at is null or starts_at <= ends_at) not valid;
create unique index if not exists promos_code_lower_idx on public.promos(lower(code));
