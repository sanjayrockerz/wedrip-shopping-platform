-- Phase 1 / Positive authoritative selling prices.
-- Existing rows are not rewritten. NOT VALID lets staging owners inspect legacy rows
-- before validation while enforcing the rule for future writes.

alter table public.products add constraint products_positive_price_check
  check (price_paise > 0) not valid;
alter table public.product_variants add constraint variants_positive_price_check
  check (price_paise is null or price_paise > 0) not valid;
