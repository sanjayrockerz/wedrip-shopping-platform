# Phase 3 security tests

Static tests cover migration ordering, protected RPC grants, provider-secret seams, notification event uniqueness, cancellation suppression and the verified-payment fulfilment predicates. Runtime tests still need an isolated Supabase project to prove RLS, row locks, concurrent assignment/cancel/delivery, storage isolation, worker crash recovery and cross-customer access.

The worker intentionally has two gates: a secret request header and `WEDRIP_FULFILMENT_NOTIFICATIONS_ENABLED=true`. Customers have no route to the admin RPCs. Actor ids are taken from `auth.uid()` inside SQL. Shipper payloads are assembled from order snapshots and assignment snapshots, never from current customer profile edits or payment evidence. The legacy `create_order_from_cart` customer execution grant is revoked by migration 19, and `/api/orders` POST is closed so it cannot bypass manual verification.
