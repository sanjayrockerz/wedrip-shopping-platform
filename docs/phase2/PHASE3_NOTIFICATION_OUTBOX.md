# Notification outbox and retries

Migration `20261125_15_fulfilment_schema.sql` extends the existing Phase 2 outbox with order linkage, recipient scope, attempt count, lock ownership, retry time, provider reference and redacted failure reason. Migration `20261125_17_notification_worker.sql` adds `claim_notification_outbox` using `FOR UPDATE SKIP LOCKED` and `complete_notification_outbox` with a maximum of five attempts and bounded exponential backoff. Migration `20261125_18_order_confirmation_outbox.sql` creates the idempotent buyer-confirmation trigger.

The internal worker requires `WEDRIP_NOTIFICATION_WORKER_SECRET` and the fulfilment flag. With the flag off it returns `BLOCKED` and claims nothing. Provider guarantees are at-least-once; idempotency keys reduce duplicate logical sends but cannot prove physical single delivery.
