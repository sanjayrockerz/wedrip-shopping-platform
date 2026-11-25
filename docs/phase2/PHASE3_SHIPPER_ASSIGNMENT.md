# Shipper assignment

`order_shipper_assignments` stores the shipper id plus name, verified email and verified WhatsApp snapshot at assignment time. Current directory edits do not rewrite historical order assignments. Assignment requires an administrator, a paid verified order, an active shipper and `contact_status = VERIFIED`; stale lifecycle versions are rejected.

Shippers receive only fulfilment and delivery information. Payment evidence, payer VPA, UTR, bank reference and admin credentials are excluded from worker payload construction.
