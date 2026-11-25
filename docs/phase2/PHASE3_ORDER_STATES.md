# Phase 3 order states

`CONFIRMED` is created only by the Phase 2 bank-verification transaction. Phase 3 permits:

- `CONFIRMED → PROCESSING` only when payment is `PAID`, a verified payment reference exists and an active verified shipper is assigned.
- `CONFIRMED|PROCESSING → DELIVERED` through the protected admin RPC.
- `CONFIRMED|PROCESSING → CANCELLED` with a required reason and finance-review marker when paid.

Delivered and cancelled orders cannot be normally transitioned again. Every transition locks the row, checks `lifecycle_version`, increments it, writes order history and audit data, and creates idempotent notification events where applicable.
