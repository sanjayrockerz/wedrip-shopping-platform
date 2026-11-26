-- Remove internal numeric/studio reference names from customer-facing product titles.
-- Slugs remain stable so existing product URLs, carts and bookmarks continue to work.
update public.products
set name = 'Everyday Heavy Tee', updated_at = now()
where slug = 'studio-02-heavy-tee';

update public.products
set name = 'Form Heavy Tee', updated_at = now()
where slug = 'scene-01-heavy-tee';
