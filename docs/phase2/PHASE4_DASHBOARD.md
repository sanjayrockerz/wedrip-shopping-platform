# Phase 4 dashboard

`/admin` now requests `/api/admin/dashboard` with the existing authenticated session. The route requires `SUPER_ADMIN` or `ADMIN`, returns private no-store data, delegates financial aggregation to `get_admin_reporting_summary`, and adds design/stock indicators from bounded count queries.

The UI displays weekly/lifetime verified sales, units and orders plus pending payment review, held claims, processing/delivered/cancelled orders, finance review, failed/pending notifications, expired checkouts, shipper backlog, stuck worker events, design review and low-stock indicators. Loading, retry/error and refresh states are explicit. Values are never hardcoded.
