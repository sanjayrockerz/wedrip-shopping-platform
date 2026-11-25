# Phases 1–3 audit report

Audit date: 2026-11-25. Branch: `redesign/wedrip-editorial-storefront`. HEAD remains `b7eb30c3c96b7a0a26f6423b4aae06ed2d93dd75`; all changes remain uncommitted and local.

## Findings fixed

### Phase 1

- The existing Phase 1 migration/test organization and customer/admin modules are present and covered by the current static regression suite.
- No live RLS or grant acceptance could be claimed because local Postgres is unavailable. This remains an infrastructure blocker, not a passing database result.

### Phase 2

- The legacy `/api/orders` POST still called `create_order_from_cart`, which could create a payment-pending order and decrement stock outside the frozen manual-payment flow. The route now returns `410`, and migration `20261125_19_disable_legacy_order_rpc.sql` revokes its `authenticated` execution grant.
- Confirmed-order buyer email creation was not guaranteed at approval time. Migration `20261125_18_order_confirmation_outbox.sql` adds an idempotent post-insert trigger for paid confirmed orders.

### Phase 3

- Admin notification retry had an RLS privilege mismatch: authenticated admins had policy coverage but no table `UPDATE` grant. Migration 15 now grants `SELECT, UPDATE`; the policy remains admin-scoped.
- The notification worker attempted to send `IN_APP` rows through an external provider adapter. It now completes those rows internally and only calls email/WhatsApp adapters for external channels.
- Cancellation could read an unassigned shipper record as an uninitialized PL/pgSQL record. The RPC now tracks assignment existence explicitly.
- The order transition API no longer performs direct client-controlled status updates; it delegates lifecycle validation, locking, version checks, audit and outbox writes to the protected RPC.

## Verification

- `node --test tests/*.test.mjs`: 35/35 PASS.
- `npx tsc --noEmit`: PASS.
- Focused ESLint on changed Phase 2/3 routes, worker, adapters and order UI: PASS with 0 errors and 0 warnings after cleanup.
- `npm run build`: PASS; 39 routes generated.
- `npm audit --omit=dev --audit-level=high`: 0 high/critical vulnerabilities.
- `git diff --check`: PASS; only existing line-ending warnings are reported by Git.
- `supabase db lint --local`: BLOCKED; Postgres at `127.0.0.1:54322` refused the connection.

## Remaining blockers

Live database execution is still unverified: migration syntax in PostgreSQL, migration history, RLS, function grants, storage policies, trigger behavior, transaction rollback, row-lock concurrency, two-customer isolation and worker crash recovery all require an isolated Supabase/Postgres environment.

Provider delivery is unverified and intentionally disabled. No email/WhatsApp provider URL, credentials, approved sender, template, webhook or scheduler is configured. Browser E2E is not claimed.

Full lint remains a legacy backlog: direct `npx eslint .` reports 41 errors and 21 warnings across pre-existing broad `any` usage, hook rules and UI code. The project wrapper additionally fails in this Windows environment because its Bash helper cannot mount a temporary VHD. Focused changed-file lint is clean.

Production remains **NO-GO** until database/RLS/concurrency and provider acceptance are completed.
