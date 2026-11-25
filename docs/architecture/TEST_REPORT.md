# Test report — preliminary

## Phase 0B results

- PASS: `npm audit --omit=dev --json`, zero reported vulnerabilities after updates (registry result, not a penetration test).
- PASS: `npm run build` with Next 16.4.6, including TypeScript; `npx tsc --noEmit` passed separately before the final lockfile refresh.
- PASS: `node --test tests/*.test.mjs`, 18 tests after correcting the CSS artifact path. An earlier `npm test` run loaded the old test before the correction and failed; rerun the full command in CI.
- PASS: targeted ESLint for the changed cart handler and validator. FAIL: `npm run lint` cannot start WSL due to missing disk; direct full ESLint reports 53 errors and 28 warnings across existing files. No assertions were weakened.
- `node scripts/verify-client-bundle-secrets.mjs` returned `serviceRoleBundled:false`; it skips scanning if no service secret is configured, so this is not proof of secret isolation.
- BLOCKED: SQL/RLS, storage, two-user isolation, session and Vercel verification. Docker daemon unavailable; no verified isolated staging resources were provided. Browser regression and UI screenshots not run.

Read-only audit on 2026-11-24. No production tests performed. The named requirements DOCX was not found under the workspace. No isolated Supabase test project or synthetic account credentials were supplied.

- `npm ls next react react-dom typescript @supabase/supabase-js zod --depth=0`: passed; actual versions are recorded in ARCHITECTURE_AUDIT.md.
- Previous turn on the same workspace: `npx tsc --noEmit` and `npm run build` passed; `node --test tests/*.test.mjs` reported 13 passed and 1 failed because a `dist` stylesheet lacked an expected scrollbar utility. The lint wrapper failed at WSL startup; direct targeted ESLint found two errors and two image warnings. These are prior-turn results, not a fresh full baseline for this audit.
- `npm audit --omit=dev --json`: failed with 8 affected packages: 1 critical, 6 high, 1 moderate. `next` is the critical entry. Reachability has not been assessed; see SECURITY_AUDIT.md.
- Security tests in `tests/commerce-security.test.mjs` are source checks, not proof of runtime isolation.

Not run: production writes or destructive tests; two-user RLS and storage tests; forged object IDs; external auth/session/CSRF tests; full browser functional regression; effective Vercel/Supabase configuration audit. Need staging project, test identities, deployed schema/grants and the specification before these can be verified. Never use production customer data as fixtures.
