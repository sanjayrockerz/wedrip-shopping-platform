# Phase 2 database

Migration order is `20261125_08_checkout_schema.sql` through `20261125_14_payment_approval.sql`, after the seven Phase 1 migrations. They are forward-only and have not been applied to production.

The local repository contains real tables, RLS policies, private `payment-evidence` storage, customer submission RPCs and the protected approval transaction. PostgreSQL execution, RLS behavior, storage policies, row locks, rollback atomicity, trigger behavior and two-user isolation are **BLOCKED** because Docker/local Postgres is unavailable and no isolated hosted Supabase project is connected.

Apply only to a disposable/staging project first. Never reset production. Verify `supabase db lint`, migration history, grants, policies, storage access and concurrent approval tests before enabling payment collection.
