# WeDrip Phase 1 Database

## Migration

The Phase 1 foundation is split into seven additive migrations listed in `PHASE1_MIGRATION_MANIFEST.md`. They create the auth-user profile trigger, customer indexes, restricted settings capability, price constraints, discount constraints, shippers with a single-default trigger, and a trusted audit-recording RPC.

The migration has not been applied automatically. Apply it first to a separate Supabase staging project, inspect existing rows for constraint conflicts, run RLS tests, and only then obtain explicit production approval.

## Ownership rules

- Profiles and addresses are scoped to `auth.uid()`.
- Wishlist rows are scoped through the owning wishlist.
- Shippers and audit reads are restricted to `SUPER_ADMIN` and `ADMIN` by the new settings capability.
- API routes also enforce roles because RLS is not a substitute for route authorization.
- Payment evidence, bank verification and notification delivery remain outside this migration.
