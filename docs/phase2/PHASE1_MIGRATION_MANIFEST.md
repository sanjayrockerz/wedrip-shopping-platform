# WeDrip Phase 1 Migration Manifest

## Environment status

| Environment | Applied status | Evidence |
|---|---|---|
| Local repository | Files prepared | Git working tree and migration inventory inspected on 2026-11-25 |
| Supabase local | BLOCKED | Supabase CLI 2.84.2 is installed, but the Docker Linux daemon is unavailable |
| Hosted staging | UNKNOWN / NOT PROVIDED | No isolated project or read-only migration inventory supplied |
| Production | UNKNOWN / NOT INSPECTED | No production connection used and no production mutation authorized |

## Ordered migrations

| Order | File | Depends on | Purpose |
|---:|---|---|---|
| 1 | `20261125000001_auth_profile.sql` | `20260910_account_fields_wishlist.sql` | Profile trigger, address landmark and customer address index |
| 2 | `20261125000200_customer_integrity.sql` | migration 1 | Wishlist lookup and profile search indexes |
| 3 | `20261125000300_admin_permissions.sql` | `20260909_account_commerce.sql` | Restricted settings capability function |
| 4 | `20261125000400_catalog_pricing.sql` | `20260905_create_products.sql`, `20260911_commerce_transaction.sql` | Positive future price constraints |
| 5 | `20261125000500_discount_constraints.sql` | `20260911_commerce_transaction.sql` | Discount timestamp, format, range, validity and case-insensitive uniqueness |
| 6 | `20261125000600_shippers.sql` | migration 3 | Shipper table, RLS and one-default trigger |
| 7 | `20261125000700_audit_rpc.sql` | `20260912_operations_designs.sql`, migration 3 | Actor-bound audit RPC and removal of direct customer audit inserts |

## Preflight before applying

Inspect existing rows for invalid prices, lower-case or duplicate promo codes, duplicate default addresses, and any existing shipper object. Do not apply the constraints until conflicts are resolved in a reviewed staging plan. After applying, run `NOT VALID` constraint validation deliberately and record the result.

## Rollback posture

These migrations are forward-only. Rollback is a reviewed compensating migration, not deletion of migration history. Before staging apply, capture schema, grants, policies, function definitions and synthetic-data backup. No destructive reset is authorized.
