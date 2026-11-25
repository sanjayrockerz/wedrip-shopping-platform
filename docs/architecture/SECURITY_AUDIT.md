# Security audit — preliminary

## Phase 0B update and remaining exposure

The local `npm audit --omit=dev --json` now reports zero affected packages after targeted Next/Zod and transitive updates; live deployment and advisory reachability have not been verified. The cart merge handler now bounds and validates request bodies, groups duplicate variants and emits a generic error with a random correlation ID. Its multiple writes remain non-atomic; authentication ownership was only tested for an anonymous request. All other raw-error, storage upload, RLS, role and audit-integrity findings below remain open. Neither server-side upload signature verification nor direct-storage restrictions have been implemented.

The specification requires independently verified bank credit before confirmation or fulfilment. Existing order/status code and policies have not been proven to enforce that invariant; do not enable live payment or fulfilment until a verified implementation and staging tests exist.

Assessment uses [OWASP ASVS 5](https://asvs.owasp.org/) and [OWASP API Security Top 10 2023](https://owasp.org/API-Security/editions/2023/en/0x11-t10/) as risk guides, not as a claim of conformance. Findings describe checked-in code and are not proof of live exploitability. Effective grants, deployed migrations, external controls and isolated-account tests remain unverified.

## Critical — dependency advisories require triage

`npm audit --omit=dev --json` reported eight affected packages: one critical (`next`), six high (`fast-uri`, `nanoid`, `postcss`, `sharp`, `source-map-js`, `zod`) and one moderate (`baseline-browser-mapping`). The audit suggests Next 16.4.6 and a major Zod upgrade for some paths. These are registry classifications, not proof of reachable exploitation; assess each advisory and affected runtime path, then test compatible upgrades without an automatic audit fix. Production dependency remediation is unresolved.

## High — customer design field and state access

`supabase/migrations/20260911_commerce_transaction.sql:105` grants row-policy access for all operations on customer-owned designs; `20260912_operations_designs.sql:4` adds `internal_message` to the same row. RLS alone does not restrict columns or status transitions. If the deployed grants permit corresponding operations, a customer could read internal fields or bypass API workflow checks. Investigate effective SELECT/UPDATE grants and exposed PostgREST operations in isolated staging; plan column separation or restricted operations and server-verified transitions. Do not apply policy changes without explicit production authorization.

## High — roles at API and database boundaries differ

`20260911_commerce_transaction.sql:110-123` defines `user_is_admin()` to include ORDER_MANAGER and uses it for broad `FOR ALL` policies on promos, variants, payments and other tables. Routes such as `app/api/admin/discounts/route.ts` restrict writes to SUPER_ADMIN/ADMIN. If database grants expose direct writes, an ORDER_MANAGER could bypass route-level role restrictions. Verify deployed grants and design least-privilege policies per operation and role.

## Medium — audit event integrity

`20260912_operations_designs.sql:14` allows users to insert audit events when `actor_user_id` is their own ID, without restricting action, entity or metadata. If INSERT is granted, users can fabricate events attributed to themselves. Move trusted audit recording behind narrowly authorized server/database operations and distinguish untrusted events.

## Medium — untrusted errors and request limits

`lib/commerce.ts:17-19` returns `Error.message` to callers; several API handlers return database `error.message` directly. Errors can disclose implementation details and often use 400 for internal failures. `app/api/cart/merge/route.ts:4` has an unbounded client-supplied item array and sequential database work. Use bounded schemas, generic internal errors, correlation IDs and an infrastructure-aware rate-limit design.

## Medium — unsafe assumptions around storage and uploaded content

`lib/designs.ts` checks browser-supplied MIME type and size, not file signatures; `20260912_operations_designs.sql:17-19` grants direct storage upload based on path ownership. Server-side validation can be bypassed if direct storage upload is granted. Verify bucket limits, malware handling, effective policies, safe download headers and exposure in staging.

## Medium — transactional and business controls

The order RPC checks variant active state but does not visibly check the parent product's `is_active` (`20260911_commerce_transaction.sql:132-136`). Promo limits count rows without locking the promo, allowing a possible race; product/collection restrictions are stored but not applied in the shown RPC. This is a code inspection finding; production effect needs isolated concurrency and business-rule tests. Existing policy scope must not be changed in production without authorization.

## Low — security configuration and documentation

`.env.example` and README describe incompatible historical integrations. `next.config.ts` sets several headers but no CSP. Absence of application-level rate limiting is visible, but external Vercel/Supabase controls are unknown. Never log credentials; inspect service-role bundle isolation with synthetic values and review actual CI/deployment configuration.

## Unverified

Cross-customer isolation, live bucket privacy, effective grants and RLS, auth expiry/logout, CSRF threat model, public caching, dependencies, session storage/XSS exposure and production secret isolation require controlled tests and access. No claim is made that a vulnerability was exploited or that production is safe.
