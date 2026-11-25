# WeDrip Phase 1 Handover

## Current handover

The repository contains the Phase 1 foundation implementation and seven additive staging migrations described in `PHASE1_MIGRATION_MANIFEST.md`. Existing local storefront and Phase 0 changes were preserved. No production migration, push or deployment was performed.

## Blockers before launch

1. Provide an isolated Supabase staging project and deployed migration/grant inventory.
2. Alternatively start the local Docker Linux daemon, then apply and test the seven `20261125_0*.sql` migrations with two customers and one administrator.
3. Verify Auth email/redirect configuration, session refresh and optional MFA policy.
4. Resolve the remaining full-lint baseline without weakening assertions.
5. Complete typed Supabase adapters and route validation where legacy `any` remains.
6. Design and separately approve the manual UPI checkout, private evidence, bank verification, order transition, notification outbox and delivery workflows.
7. Configure and test authenticated email/WhatsApp providers before claiming shipper dispatch.

## Release boundary

Phase 1 account, catalog, discount and shipper foundations may be tested in staging. UPI, payment verification, confirmed orders, automatic notifications, fulfilment and financial dashboard activation remain disabled until their security and operational gates are satisfied.
