# Database foundation — current evidence

## Phase 0B update

Local Docker is installed but its Linux daemon is unavailable. No verified isolated staging target was identified; no migrations or policy tests were run, and no policies were changed. A policy patch requires redesign of existing customer design, version and audit operations together, plus tests for SELECT/INSERT/UPDATE/DELETE and direct storage calls under anonymous, two customer and each admin role. A superficial policy removal would break current route behavior and does not establish a secure replacement. Production/staging database and bucket separation remains BLOCKED pending owner-provided evidence.

Checked-in Supabase SQL defines profiles, addresses, products, variants, carts and cart items, wishlists and items, orders and items, promotions and redemptions, status history, customer designs and versions, approvals, payment and notification events, templates and audit logs. Foreign keys and RLS appear in the migrations; active products and active variants have public read policies. Ownership policies exist for profiles, addresses, orders and related resources. Exact deployed schema, column grants, bucket configuration, RLS enforcement and environment separation are unknown.

The `customer-designs` bucket is declared private with path-based policies. The design/approval policies and broad admin policy require adversarial review (see SECURITY_AUDIT.md). The order RPC uses `SECURITY DEFINER`, fixes its search path, authenticates the user, locks cart/variant records and restricts execute to authenticated users; its business and concurrency edge cases remain unverified.

## Migration strategy

Inventory live migration history and grants using owner-provided read-only access; establish a separate synthetic staging project and backup/restore procedure. Write additive, versioned migrations with least-privilege grants, explicit policy changes and independent SQL tests for anonymous, two customer and distinct admin roles. Rehearse upgrade and rollback against representative synthetic data. Review lock duration and indexing with query plans. Explicit owner authorization is required before any production schema or policy operation. Do not assume the local SQL is deployed.

Future entities and integrations must be derived from the missing Phase 2 specification and actual operating decisions. No speculative payment, checkout or finance tables are proposed in this audit.
