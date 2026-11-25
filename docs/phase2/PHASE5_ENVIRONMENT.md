# Phase 5 environment verification

Checked locally on 2026-11-25:

- Branch: `redesign/wedrip-editorial-storefront`
- HEAD: `b7eb30c3c96b7a0a26f6423b4aae06ed2d93dd75`
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
- No rotated credentials for `flbdevgqhfosbaaswwbf` were present in `.env.local`, process environment, or the checked secure variable names.

The hosted migration chain was applied to the explicitly identified new target after the remote history was confirmed empty of application migrations. No production project, deployment, payment flag or fulfilment-notification flag was changed.
