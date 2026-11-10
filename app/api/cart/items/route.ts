import { NextRequest } from "next/server";
import { getAuthedSupabase } from "@/lib/supabase/request";
import { jsonError, validateVariant } from "@/lib/commerce";

export async function POST(request: NextRequest) {
  const auth = await getAuthedSupabase(request); if ("error" in auth) return Response.json({ error: auth.error }, { status: auth.status });
  try {
    const body = await request.json(); const productId = String(body.product_id ?? ""); const variantId = String(body.variant_id ?? ""); const quantity = Number(body.quantity ?? 1);
    const variant = await validateVariant(auth.client, productId, variantId, quantity);
    const { data: cart, error: cartError } = await auth.client.from("carts").upsert({ user_id: auth.user.id }, { onConflict: "user_id" }).select("id").single(); if (cartError) throw cartError;
    const { data: existing } = await auth.client.from("cart_items").select("id,quantity").eq("cart_id", cart.id).eq("variant_id", variantId).maybeSingle();
    const nextQuantity = (existing?.quantity ?? 0) + quantity; if (nextQuantity > (variant.stock_quantity ?? 0)) throw new Error("The requested quantity exceeds available stock.");
    const query = existing ? auth.client.from("cart_items").update({ quantity: nextQuantity, updated_at: new Date().toISOString() }).eq("id", existing.id) : auth.client.from("cart_items").insert({ cart_id: cart.id, product_id: productId, variant_id: variantId, quantity });
    const { error } = await query; if (error) throw error;
    return Response.json({ ok: true });
  } catch (error) { return jsonError(error); }
}
