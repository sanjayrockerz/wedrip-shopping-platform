# Proposed target architecture

Phase 0B implements bounded cart input, a dedicated cart operation module, and sanitized errors for the merge route. Atomic mutations, server-only enforcement, RLS alignment and full request validation remain proposed rather than completed. Refer to the supplied requirements for payment-confirmation and evidence isolation invariants; do not infer them from the current database schema.

This is a proposal, not an implemented refactor. Retain Next.js App Router and Supabase until the actual deployment and requirements are reconciled. Keep UI and routes stable.

```text
UI -> route handler -> authenticated user and role -> validated input
   -> application operation -> scoped Supabase query / approved transaction
   -> PostgreSQL grants + RLS
```

The database remains an independent authorization boundary because clients can call Supabase directly. Use shared primitives only when an existing endpoint consumes them. Put privileged client creation in a server-only module, validate configuration without logging secrets, use explicit response DTOs and safe typed errors, and add request correlation without storing tokens, payment data or personal data in logs. Introduce Zod schemas at actual input boundaries and establish limits before parsing expensive data. Determine browser-token and cookie usage before prescribing CSRF controls; enforce authorization for every object.

## Proposed batches and rollback

1. Establish clean CI baseline, synthetic test fixtures and staging isolation; no production mutation. Rollback: discard test-only additions.
2. With focused tests, add server-only boundaries, bounded validation and standardized sanitized errors to a small set of existing routes. Preserve contracts where safe. Rollback: revert the specific commit.
3. Design database role, column and workflow restrictions with SQL-level adversarial tests and data-preserving forward/rollback scripts. Rehearse in isolated staging; owner must explicitly authorize any production migration or policy change. Rollback must restore prior grants/policies only after security impact review.
4. Expand coverage and performance improvements only where measured. No new framework, second identity system or speculative future entities.

Prior to major changes, compare the missing requirements document, capture current staging grants and migration versions, and review impact with the owner. Do not create an admin portal, payment workflow or deployment in this phase.
