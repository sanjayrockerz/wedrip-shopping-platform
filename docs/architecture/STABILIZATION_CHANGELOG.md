# Stabilization changelog

2026-11-24: Read-only source review begun; architecture, security, database, test and readiness documents added. No application logic, database policies, migrations, credentials or infrastructure were modified as part of this audit. Existing local changes predate this audit and were preserved.

2026-11-25: Deepened the cart merge seam without changing the route contract. Added `lib/cart-merge.ts` as the cart operation module, moved merge validation/mutation orchestration out of the route, and added `lib/http.ts` for sanitized unexpected-error responses with correlation IDs. Expected cart validation failures now retain explicit 422/409 responses; database failures are generic 500 responses. Full lint remains blocked by the existing legacy backlog; TypeScript, focused lint, build, and the 21-test suite pass.

Implementation has not started: requirements document, live-policy evidence and the requested review of the proposed architecture are outstanding. See TARGET_ARCHITECTURE.md for bounded proposed batches and rollback.

## Phase 0B update

The owner supplied the requirements DOCX in Downloads. It specifies manual independent bank verification, private evidence, free shipping and no customer customization. Existing design uploads and order flows are not evidence of Phase 2 compliance and were not expanded here.

- Upgraded Next 16.2.6 to 16.4.6, eslint-config-next to 16.4.6, Zod 3.25.76 to 4.6.7, and refreshed three vulnerable transitive packages in the lockfile. Production audit now reports zero advisories. No assertion is made about deployed packages or other attack surfaces.
- Added `lib/cart-merge-validation.ts`, bounded request reads, schema validation, duplicate handling, server-side variant checks and generic correlated errors in `app/api/cart/merge/route.ts`. Merge remains non-transactional and full cross-user testing is outstanding.
- Added `tests/cart-merge-validation.test.mjs`. Corrected `tests/ui-components.test.mjs` to read the Next production CSS output rather than stale Vinext `dist`; existing assertions remain unchanged.
- Clarified the current Next/Supabase entry points in README and updated `.env.example` without secrets. Live Vercel/Supabase configuration remains unknown.
- No migration was applied to any environment. The seven local Phase 1 migrations are prepared but require staging preflight and policy tests. Broad legacy policies and direct storage access remain unresolved; an untested policy change would risk breaking existing workflows.
