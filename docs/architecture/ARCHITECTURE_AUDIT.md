# Architecture audit — preliminary, 2026-11-24

## Phase 0B update

Requirements reviewed from `C:/Users/motis/Downloads/WeDrip_Phase_2_Backend_Functional_and_Technical_Requirements.docx`. It mandates independently verified bank credit before confirmation or fulfilment, private evidence, free shipping, and existing catalog artwork rather than customer customization. Existing customer-design code is outside that future scope; do not treat it as an approved new feature. Local scripts and build establish Next.js as the application path for this checkout; they do not establish actual Vercel deployment settings.

Status: incomplete read-only audit. The named Phase 2 requirements DOCX was not found in the workspace, and live Supabase/Vercel configuration has not been inspected. Do not treat this as a production security certification.

## Baseline

Repository branch `redesign/wedrip-editorial-storefront`, commit `b7eb30c` (Complete commerce platform and account flows), with pre-existing tracked and untracked edits including storefront, product data, bag controls and a deleted hero asset. Preserve them. No production operations or source refactors were performed in this audit.

Installed versions: Next.js 16.2.6 App Router, React 19.2.6, TypeScript 5.9.3, Supabase JS 2.115.0 and Zod 3.25.76. Strict TypeScript is enabled. `app/` contains server-rendered pages and API route handlers; `components/` contains client interactions; `lib/` mixes data access, authorization and commerce services; `supabase/migrations/` defines PostgreSQL policies and functions. A separate Vinext/Vite/Cloudflare/D1 starter remains in the repository alongside Next; it is not established which deployment path is authoritative. README and `.env.example` describe older Shopify/Vinext assumptions that conflict with current code. Verify deployment ownership before removal or configuration changes.

## Confirmed structural observations

- `lib/supabase/request.ts` verifies bearer tokens with `auth.getUser`, and `lib/admin.ts` performs a role lookup. RLS still governs direct Supabase access, so API guards alone cannot constrain database capabilities.
- Route handlers commonly parse bodies, query tables and apply domain logic in one function; errors and validation vary. Some admin queries select nested unbounded records. `app/api/cart/merge/route.ts` processes an unbounded array serially and can partially mutate the cart before failure.
- `lib/supabase/server.ts` combines anonymous and privileged client factories without an explicit server-only import boundary. This does not itself prove a key leak. Generated database types are absent from the inspected client factories; code contains broad casts and `any`.
- Supabase migrations create accounts, catalog, variants, carts, orders, design workflow, notifications and admin operations already. These are existing features, not authorization to build more.
- `tests/commerce-security.test.mjs` relies primarily on source-text assertions, not database-enforced isolation tests. No live staging or production RLS claim can be inferred.
- The checked-in lint script invokes Bash/WSL; it fails locally because the configured WSL disk is unavailable. Prior local checks found lint errors and a `dist` CSS test failure. Re-run in a suitable environment before treating them as current baseline.

## Audit still required

Inspect the supplied requirements document once available, complete route-by-route input and authorization analysis, inspect installed dependency advisories, verify actual Vercel settings and deployed migrations/grants, and run isolated browser, API, RLS and storage tests. Do not infer unused dependencies solely from text search.
