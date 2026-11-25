# Email and WhatsApp adapters

`lib/fulfilment-notifications.ts` defines the provider seam. The worker uses server-only environment credentials and an idempotency header. No provider credentials are bundled into browser code.

Required configuration is intentionally absent by default: `WEDRIP_FULFILMENT_NOTIFICATIONS_ENABLED=false`. Email and WhatsApp require separate URL, key and sender values. The repository contains no unofficial WhatsApp automation and does not mark events sent without a real provider response. Provider delivery evidence remains BLOCKED until an approved provider, sender and templates are configured.
