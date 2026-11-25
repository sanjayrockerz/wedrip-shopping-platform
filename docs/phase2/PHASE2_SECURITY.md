# Phase 2 security review

The browser supplies only delivery selection, an optional coupon code and untrusted payer/evidence claims. Payable amounts are recalculated by `create_checkout_from_cart`; approval accepts only a protected admin session and exact bank-credit fields. The actor is taken from `auth.uid()` inside SQL. Bank reference uniqueness is database-enforced per receiving account. Evidence uses a private storage bucket and server-generated customer-scoped keys.

Known limitations pending database acceptance: image decode/pixel-limit and malware scanning are not available in the current runtime validator; PostgreSQL/RLS/grant/transaction behavior is not verified; the merchant configuration is intentionally empty and `WEDRIP_PAYMENT_ENABLED=false`. No production payment collection or order confirmation should be enabled until those gates pass.
