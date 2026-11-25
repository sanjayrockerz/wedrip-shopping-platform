-- Phase 3 security correction: the legacy RPC creates payment-pending orders and
-- decrements inventory before manual bank verification. It must not be callable
-- by customer sessions. The Phase 2 checkout/approval RPCs are the only supported path.
revoke execute on function public.create_order_from_cart(uuid, text) from authenticated;
