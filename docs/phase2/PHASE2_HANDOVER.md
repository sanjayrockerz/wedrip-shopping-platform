# Phase 2 handover

Start with an isolated Supabase project. Apply migrations 01–14 in order, inspect `supabase migration list`, run database lint, create two disposable customers and one deliberately provisioned admin, then execute the customer-isolation and concurrent-approval suites. Configure no merchant VPA until storage/RLS and approval checks pass. Keep `WEDRIP_PAYMENT_ENABLED=false` during this work.

The safe release decision is currently **NO-GO** for production payment activation and **NO-GO** for claiming Phase 2 database acceptance. Local code/build gates are ready for isolated integration testing.
