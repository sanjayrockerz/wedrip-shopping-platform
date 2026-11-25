# Phase 3 fulfilment architecture

Phase 3 extends the Phase 2 `notification_outbox` and existing `orders`, `order_items`, `order_status_history`, `shippers`, `audit_logs` and payment tables. No parallel order or queue model was introduced.

The fulfilment seam is the authenticated API/RPC pair under `/api/admin/orders/[id]/fulfilment`: assignment and lifecycle actions are validated inside PostgreSQL while the browser supplies only an order id, expected lifecycle version and requested action. The notification seam is `lib/fulfilment-notifications.ts` plus the internal worker route; email and WhatsApp are adapters behind environment configuration and are disabled by default.

Flow: verified payment → confirmed order → verified shipper assignment → processing → durable preparation events → delivered or cancelled. Cancellation locks the order, suppresses pending preparation events and queues buyer/shipper cancellation events. External delivery failures never roll back the order transaction.
