# Phase 5 environment verification

Checked locally on 2026-11-25:

- Branch: `redesign/wedrip-editorial-storefront`
- HEAD at audit start: `5bf75e092e277e8bc79df31230f556a0ce0626cf`
- Supabase CLI: `2.84.2`
- Supabase project id in local config: `new_ecommercewedrip`
- Local database port: `54322`
- Docker CLI installed, Docker Linux daemon unavailable (`dockerDesktopLinuxEngine` pipe missing).
- The supplied hosted project API endpoint is reachable and returned HTTP 200 from `/auth/v1/health`.
- Supabase CLI authentication is available and the exact project reference `flbdevgqhfosbaaswwbf` is listed as `wedrip-shopping-platform` in `Oceania (Sydney)`.
- The local CLI is linked to that project only.
- The supplied direct database hostname resolves only to IPv6 (`2406:da1c:10e4:6400:0:a2c1:20fd:13b1`) from this machine.
- The machine has no IPv6 route to the database host; `Test-NetConnection` and `psql` both report TCP/5432 network unreachable.
- The Supabase REST endpoint cannot be used as a SQL migration transport; no database schema was changed.
- A pooler/IPv4-capable database connection string is still required before runtime migration verification.
- The ignored `.env` contains a different Supabase project and pooler target (`kpwnwndehljitvhkyjvv`); it was not used because it does not match the requested target `flbdevgqhfosbaaswwbf`.
- A new ignored `.env.local` is now configured from the authenticated Supabase CLI session for `flbdevgqhfosbaaswwbf`; values are intentionally not recorded here. Public and privileged runtime queries both succeeded against the target host.

The hosted migration chain was applied to the explicitly identified target after the remote history was confirmed empty of application migrations. Remote history now matches local through `20261125002400`. No production project, deployment, payment flag or fulfilment-notification flag was changed.
- The current ignored `.env` still targets the legacy project and was intentionally not rewritten. Local development uses `.env.local`, which targets only `flbdevgqhfosbaaswwbf`.
- Rotation/revocation of the previously exposed database password and Supabase secret key has not been independently evidenced through the available CLI session; this remains a security blocker for production use.
- Runtime verification command: `node scripts/verify-target-runtime.mjs` reported the target host, successful public/private queries and both payment/fulfilment flags disabled.
- Hosted data inspection found 0 Auth users, 0 admin role rows, 4 products, 0 orders, 0 payment submissions and 0 notification outbox rows. No synthetic or production records were inserted.
