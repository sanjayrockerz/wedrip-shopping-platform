# Phase 4 financial definitions

Authoritative source: `public.monetary_events`, joined to immutable `public.order_items` by `order_id`.

- Verified sales received: sum of one deduplicated `PAYMENT_VERIFIED` monetary event per order, using `amount_paise`.
- Verified order count: distinct orders with a `PAYMENT_VERIFIED` event.
- Gross verified units: sum of `order_items.quantity` for orders with a verified event.
- Weekly attribution: `monetary_events.created_at` (the approval/verification transaction timestamp), in the half-open interval Monday 00:00 IST through the following Monday 00:00 IST.
- Lifetime: all verified events, independent of current week.
- Cancellations: do not remove historical verified receipts or gross verified units. Open finance review is reported separately.
- Refunds: no completed refund event exists in the current model; the dashboard does not claim a net-sales figure.

No current product price, profile address, pending checkout, screenshot, UTR claim, held claim or rejected claim participates in revenue totals.
