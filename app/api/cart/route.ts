import { NextRequest } from "next/server";
import { getAuthedSupabase } from "@/lib/supabase/request";
import { jsonError, validateVariant } from "@/lib/commerce";

export async function GET(request: NextRequest) {
  const auth = await getAuthedSupabase(request); if ("error" in auth) return Response.json({ error: auth.error }, { status: auth.status });
  const { data: cart, error: cartError } = await auth.client.from("carts").select("id,updated_at").eq("user_id", auth.user.id).maybeSingle();
  if (cartError) return jsonError(cartError);
  if (!cart) return Response.json({ cart: null, items: [], subtotal_paise: 0 });
  const { data: items, error } = await auth.client.from("cart_items").select("id,product_id,variant_id,quantity,product_variants!inner(id,size,color,sku,price_paise,stock_quantity,active),products!inner(name,slug,primary_image_url,price_paise,is_active)").eq("cart_id", cart.id).order("created_at");
  if (error) return jsonError(error);
  const normalized = (items ?? []).map((item: any) => ({ ...item, variant: item.product_variants, product: item.products, authoritative_price_paise: item.product_variants.price_paise ?? item.products.price_paise }));
  return Response.json({ cart, items: normalized, subtotal_paise: normalized.reduce((sum, item) => sum + item.authoritative_price_paise * item.quantity, 0) });
}

export async function DELETE(request: NextRequest) {
  const auth = await getAuthedSupabase(request); if ("error" in auth) return Response.json({ error: auth.error }, { status: auth.status });
  const { data: cart } = await auth.client.from("carts").select("id").eq("user_id", auth.user.id).maybeSingle();
  if (cart) await auth.client.from("cart_items").delete().eq("cart_id", cart.id);
  return Response.json({ ok: true });
}
