# WeDrip Phase 1 Security

## Controls added

- Browser authentication uses `@supabase/ssr` with PKCE-aware browser sessions.
- `middleware.ts` refreshes Supabase sessions and marks account/admin pages private and non-cacheable.
- `lib/supabase/server.ts`, `lib/products.ts` and `lib/auth-server.ts` are server-only modules.
- Admin pages use trusted `admin_users` role records; customer-controlled metadata is not used for privilege.
- Admin APIs continue to require server-side role checks.
- Shipper and discount mutation bodies use Zod validation.
- Unexpected API failures use generic messages and request IDs through `lib/http.ts`.
- Audit writes use the `record_audit_event` database function rather than a customer-controlled actor ID.

## Open security evidence

The local workspace has no verified isolated Supabase target, deployed grants snapshot, two-user fixture, storage policy test, MFA configuration, or provider delivery credentials. Therefore this document does not claim live RLS isolation, production secret isolation or launch readiness.

The existing legacy design workflow and broad order-management policies still require adversarial staging review. UPI/payment/order activation remains blocked until the requirements' bank-verification invariants and notification controls are implemented and tested.
