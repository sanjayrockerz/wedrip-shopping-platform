# Phase 5 reporting reconciliation

Phase 4 reporting is implemented against `monetary_events` and immutable `order_items`, with IST week boundaries and duplicate-event defensive aggregation. Pure boundary/static tests pass. Independent reconciliation against real synthetic PostgreSQL fixtures, query plans and historical cancellation/refund cases is **BLOCKED**.

When staging exists, compare the RPC output with an independently calculated fixture ledger for weekly/lifetime amount, units, orders, cancellation preservation, finance review and notification backlog.
