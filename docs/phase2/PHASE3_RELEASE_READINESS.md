# Phase 3 release readiness

Local TypeScript/build/unit gates are the only available evidence. Production fulfilment is **NO-GO**: database migrations and RLS are unapplied/unverified, worker execution is not connected to a scheduler, and email/WhatsApp credentials/templates/senders are not configured. Keep both payment and fulfilment notification flags disabled.

Before release: apply migrations to isolated staging, prove two-admin races, prove cancelled orders suppress preparation, verify private data redaction, configure approved providers, run signed worker tests, then obtain business approval before production migration or activation.
