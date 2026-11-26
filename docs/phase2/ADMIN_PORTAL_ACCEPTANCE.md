# WeDrip Admin Portal Acceptance

Checked 2026-11-25 on branch `redesign/wedrip-editorial-storefront`.

## Evidence

- Target project: `flbdevgqhfosbaaswwbf` (`wedrip-shopping-platform`, Sydney).
- Runtime public and privileged queries: PASS via `node scripts/verify-target-runtime.mjs`.
- Hosted migration history: PASS through `20261125002600`.
- Hosted `supabase db lint --linked`: PASS.
- Hosted data inspection: 4 products, 0 Auth users, 0 administrators, 0 orders, 0 payment submissions and 0 notification rows.
- Payments and fulfilment notifications remain disabled.
- Automated suite: 53/53 passed before the final shell/logout presentation changes; focused admin regression tests pass after them.
- Production build and TypeScript passed in the current remediation cycle before the final presentation-only changes.

## Acceptance matrix

| Module | UI | API | Database | Authorization | Browser E2E | Final |
|---|---|---|---|---|---|---|
| Admin login | PASS | PASS | BLOCKED: no Auth user | PASS static | BLOCKED | BLOCKED |
| Dashboard | PASS | PASS | PASS schema/RPC | PASS static | BLOCKED | BLOCKED |
| Products | PASS | PASS | PASS schema | PASS static | BLOCKED | BLOCKED |
| Discounts | PASS | PASS | PASS schema | PASS static | BLOCKED | BLOCKED |
| Customers | PASS | PASS | PASS schema | PASS static | BLOCKED | BLOCKED |
| Payments | PASS | PASS | PASS schema | PASS static | BLOCKED; disabled | PARTIAL |
| Orders | PASS | PASS | PASS schema | PASS static | BLOCKED; no records | BLOCKED |
| Shippers | PASS | PASS | PASS schema | PASS static | BLOCKED | BLOCKED |
| Notifications | PASS | PASS | PASS schema | PASS static | BLOCKED; providers disabled | PARTIAL |
| Audit logs | PASS | PASS | PASS schema | PASS static | BLOCKED | BLOCKED |
| Settings | PARTIAL: truthful shell | No supported mutation | N/A | PASS static | BLOCKED | PARTIAL |
| Customer Auth | PASS locally | PASS locally | BLOCKED runtime fixtures | PASS static | BLOCKED | BLOCKED |
| Profile/Addresses | PASS locally | PASS locally | BLOCKED runtime fixtures | PASS static | BLOCKED | BLOCKED |

## Remaining blockers

1. The owner-designated Auth user and administrator do not exist yet. Run `npm run admin:provision` only after creating and verifying the intended Auth identity and setting `WEDRIP_ADMIN_USER_ID` locally.
2. Docker's Linux daemon is unavailable, so local Supabase cannot be started for isolated RLS, persistence or concurrency tests.
3. Credential rotation/revocation of previously exposed values requires owner dashboard evidence.
4. Full ESLint executes successfully but retains the unrelated legacy backlog of 38 errors and 21 warnings. Touched admin/security/tooling files pass direct ESLint.
5. Browser acceptance requires a real administrator and an approved isolated fixture environment.

Production remains **NO-GO**. No production data, deployment, payment activation or provider delivery was performed.
