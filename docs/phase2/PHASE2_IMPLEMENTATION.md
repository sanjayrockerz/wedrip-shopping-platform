# Phase 2 checkout implementation

Implemented locally without activating payment collection:

- Frozen customer-owned checkout quotes with idempotency keys and 48-hour expiry.
- Server-authoritative integer-paise totals, free shipping, coupon snapshots and item snapshots.
- Server-only merchant UPI configuration and local QR generation; disabled when configuration is absent.
- Private payment-evidence metadata and authenticated upload route with MIME/signature/size checks.
- Admin payment queue and approval endpoint.
- Atomic approval RPC contract that locks the claim/checkout, enforces exact amount and unique bank reference, creates one confirmed order, decrements inventory, writes monetary/audit/outbox records, and is idempotent by checkout.

The legacy `create_order_from_cart` RPC remains untouched for history but is no longer used by the checkout UI. It must not be used for the manual-UPI flow.
