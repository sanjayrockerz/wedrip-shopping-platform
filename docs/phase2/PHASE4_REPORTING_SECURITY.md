# Phase 4 reporting security

The reporting API requires an authenticated `SUPER_ADMIN` or `ADMIN` record and calls a narrowly granted `SECURITY DEFINER` function. The function verifies `auth.uid()` and `user_can_view_reporting()` before aggregation. It returns no customer addresses, bank references, payer VPAs, screenshots or raw payment claims.

The reporting function is granted only to `authenticated`; the function and helper revoke public execution. The response is `private, no-store`. Live RLS, grant behavior and customer denial still require isolated PostgreSQL/Supabase verification.
