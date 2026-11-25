# WeDrip Phase 1 Implementation

This document records the local implementation status for the Phase 2 Phase 1 foundation. It distinguishes code that is implemented in the repository from database, staging and production verification that still requires an isolated Supabase environment.

## Implemented locally

| Batch | Status | Scope |
|---|---|---|
| 1A | PARTIAL | Supabase SSR browser client, session-refresh middleware, signup names, protected account pages and profile creation trigger are implemented. Persistence still needs an isolated Supabase run. |
| 1B | PARTIAL | Profile retrieval, addresses with edit/default/landmark support and persisted wishlist UI are implemented. Cross-account isolation is represented by RLS and route scoping but not live-tested here. |
| 1C | PARTIAL | API role checks, server-rendered admin guards, private cache headers and audit RPC seam are implemented. Effective deployed grants and MFA are not verified. |
| 1D | PARTIAL | Catalog admin routes remain reusable; variant price editing is now exposed in the admin product detail UI and validated as integer paise. Public reads continue to use authoritative catalog data. |
| 1E | PARTIAL | Percentage discount creation/update validation is implemented with case-normalized codes and server-side calculation reuse. Checkout/order redemption concurrency remains outside this foundation batch. |
| 1F | PARTIAL | Shipper CRUD, active/default state and audit events are implemented. No outbound email or WhatsApp delivery is claimed. Customer listing is paginated and searchable. |
| 1G | PARTIAL | Admin navigation includes products, discounts, customers, shippers, audit and protected future shells for notifications/settings. Payment verification and order fulfilment remain gated. |

## Deliberately not implemented

Manual UPI payment verification, payment evidence uploads, order confirmation, shipper dispatch, notification delivery, cancellation/revocation and revenue reporting are not activated by this batch. The requirements require independent bank verification and provider readiness before those flows can be safe.
