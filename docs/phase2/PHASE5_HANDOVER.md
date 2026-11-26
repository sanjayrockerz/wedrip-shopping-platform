# Phase 5 handover

1. Start Docker Desktop or provide a verified isolated Supabase staging project.
2. Set `PHASE5_ENVIRONMENT=local` or `staging`, `PHASE5_SUPABASE_URL`, and `PHASE5_DATABASE_URL`; run `npm run phase5:env-check`.
3. Positively identify the target and confirm it contains no production data.
4. Migration application is complete on the linked target through `20261125002400`; verify with `supabase migration list --linked` before future changes.
5. Run Supabase migration lint, RLS/grant tests, persistence tests, approval concurrency tests, worker tests and reporting reconciliation.
6. Run browser E2E with synthetic identities.
7. Keep `WEDRIP_PAYMENT_ENABLED=false` and `WEDRIP_FULFILMENT_NOTIFICATIONS_ENABLED=false` until a separate release review authorizes activation.

Current recommendation: **PARTIAL for hosted schema preparation; BLOCKED for authenticated application/database acceptance until rotated target app credentials and an explicitly approved isolated test scope are available; NO-GO for production.**
