# WeDrip Phase 1 Admin Guide

## Sign-in

Use a Supabase-authenticated account that has a trusted row in `public.admin_users`. A customer account or user metadata field is not sufficient. If the role is missing, `/admin` redirects to sign-in and admin APIs return 403.

## Catalog and pricing

Open `/admin/products`, select a product, edit the product or a size variant, and save. Variant prices are integer paise and are recorded through the existing audit seam. Product IDs, slugs and official imagery are preserved.

## Discounts

Open `/admin/discounts`. Phase 1 creates percentage codes only, 4–20 ASCII alphanumeric characters, with a 1–99 percentage value. Entering a code does not redeem it; redemption belongs to the later checkout/order flow.

## Shippers

Open `/admin/shippers` to create or edit a fulfilment contact, mark contact readiness, activate/deactivate it, or choose the default. The screen does not claim that a message was delivered. Email and WhatsApp provider configuration and delivery tests are still required.

## Audit and customers

Customer search is paginated and exposes only approved profile summary fields in the list. Detailed addresses are available only inside the authorized customer detail view. Audit records are read-only to administrators through the API surface.
