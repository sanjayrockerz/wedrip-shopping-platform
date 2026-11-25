# Phase 4 operational monitoring

The summary includes payment-review backlog and oldest pending age, held claims, expired checkouts, finance-review cases, failed email/WhatsApp events, pending/retrying/processing outbox work, stuck processing events, confirmed orders awaiting shipper assignment and assigned orders awaiting processing.

The existing `/admin/payments` and `/admin/notifications` pages remain the drill-down surfaces. No external alert delivery was configured. A future scheduler may call the protected internal worker, but provider delivery remains disabled until credentials, templates, sender approval and database acceptance exist.
