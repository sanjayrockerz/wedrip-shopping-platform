-- Every published product must have real variants before it can enter an
-- authenticated cart. Without these rows the storefront creates local-only
-- fallback sizes, which cannot be merged into cart_items or checked out.
insert into public.product_variants (product_id, size, color, sku, price_paise, stock_quantity, active)
select p.id, sizes.size, null, p.slug || '-' || lower(sizes.size), null, 10, true
from public.products p
cross join (values ('S'), ('M'), ('L'), ('XL')) as sizes(size)
where p.slug in ('scene-01-heavy-tee', 'studio-02-heavy-tee', 'after-hours-box-hoodie', 'no-fixed-address-hoodie')
  and not exists (
    select 1 from public.product_variants pv
    where pv.product_id = p.id and pv.size = sizes.size and pv.color is null
  );
