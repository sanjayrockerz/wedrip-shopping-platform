# Phase 5 migration verification

The repository contains the legacy migrations through `20260917_customer_order_event_payload.sql`, followed by corrected 14-digit Supabase migration versions `20261125000001` and `20261125000200` through `20261125002200`. Static tests verify chronological inventory, pinned `SECURITY DEFINER` search paths, sensitive function grants, legacy order-RPC revocation and reporting write restrictions.

Hosted migration application is **PASS** for the linked non-production project `flbdevgqhfosbaaswwbf`: the CLI dry-run listed the complete chain, the chain was applied, and `supabase migration list` shows every local version through `20261125002200` matching remote. `supabase db lint --linked` reports no schema errors. A prior malformed 8-digit `20261125` marker created by the first failed attempt was repaired as reverted before reapplying its idempotent SQL under `20261125000001`. Local Docker/Postgres remains unavailable, so local-database parity and backup/restore are still unverified.

Integration corrections applied during hosted verification:

- `20261125001500_fulfilment_schema.sql` now adds and backfills the missing `notification_outbox.event_type` column before Phase 3 indexes and worker predicates use it.
- `20261125001600_fulfilment_rpc.sql` declares the missing `v_has_assignment` variable.
- `20261125002100_notification_worker_fix.sql` corrects the PostgreSQL `make_interval` integer argument.
- `20261125002200_fulfilment_lint_cleanup.sql` removes two unused RPC variables. Hosted `supabase db lint --linked` now reports `No schema errors found`.
