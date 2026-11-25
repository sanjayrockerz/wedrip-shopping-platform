# Phase 3 handover

New migrations are `20261125_15_fulfilment_schema.sql` through `20261125_19_disable_legacy_order_rpc.sql`; they depend on Phase 1 migrations 01–07 and Phase 2 migrations 08–14. They are forward-only and have not been applied to production. Migration 19 revokes the legacy customer-callable order-creation RPC so it cannot bypass manual bank verification.

Next safe step: connect a disposable Supabase/Postgres environment, apply all migrations in order, run RLS and concurrency integration tests, then configure test-only email/WhatsApp adapters. Do not set `WEDRIP_PAYMENT_ENABLED` or `WEDRIP_FULFILMENT_NOTIFICATIONS_ENABLED` true in production from this handover.
