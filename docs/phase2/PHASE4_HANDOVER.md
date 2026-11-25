# Phase 4 handover

Apply migration `20261125_20_reporting_summary.sql` after migrations 01–19 in an isolated database. Verify reporting function grants, RLS, duplicate monetary-event handling, historical cancellations, finance-review counts and query performance with synthetic records. Test IST week boundaries at the database timestamp level.

Then run browser checks for admin authorization, loading/error/refresh states and responsive KPI layout. Keep `WEDRIP_PAYMENT_ENABLED=false` and `WEDRIP_FULFILMENT_NOTIFICATIONS_ENABLED=false` until all prior phase and provider gates pass.
