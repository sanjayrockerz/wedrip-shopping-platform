# Phase 4 test matrix

| Area | Local evidence | Database/provider evidence | Result |
|---|---|---|---|
| IST week boundaries | Pure tests pass | Not run | PARTIAL |
| Verified amount/unit formulas | Static SQL and pure tests pass | Not run | PARTIAL |
| Reporting authorization | Route/static checks pass | RLS/grants not run | PARTIAL |
| Dashboard loading/error/refresh | Build/typecheck pass | Browser E2E not run | PARTIAL |
| Operational counts | SQL contract present | Real records not run | PARTIAL |
| Migration execution | Ordered/static file present | Postgres unavailable | BLOCKED |

The dashboard is not financially accepted until real synthetic data is aggregated in isolated PostgreSQL and reconciled manually.
