import type { SupabaseClient } from "@supabase/supabase-js";
import { validateVariant } from "@/lib/commerce";
import { PublicApiError } from "@/lib/http";

export type CartMergeItem = {
  productId: string;
  variantId: string;
  quantity: number;
};

/**
 * Applies browser-held bag lines to the authenticated cart.
 *
 * The operation validates every line before the first mutation. The database
 * remains the authorization boundary through the caller's RLS-scoped client;
 * a future SQL RPC can replace the mutation loop without changing the route.
 */
export async function mergeCartItems(
  client: SupabaseClient,
  userId: string,
  items: CartMergeItem[],
) {
  const variants = await Promise.all(
    items.map((item) => validateVariant(client, item.productId, item.variantId, item.quantity)),
  );

  const { data: cart, error: cartError } = await client
    .from("carts")
    .upsert({ user_id: userId }, { onConflict: "user_id" })
    .select("id")
    .single();

  if (cartError || !cart) throw cartError ?? new Error("Cart could not be created.");

  for (const [index, item] of items.entries()) {
    const { data: existing, error: lookupError } = await client
      .from("cart_items")
      .select("id,quantity")
      .eq("cart_id", cart.id)
      .eq("variant_id", item.variantId)
      .maybeSingle();

    if (lookupError) throw lookupError;

    const nextQuantity = (existing?.quantity ?? 0) + item.quantity;
    if (nextQuantity > 20 || nextQuantity > (variants[index].stock_quantity ?? 0)) {
      throw new PublicApiError("A bag item exceeds available stock or quantity limits.");
    }

    const result = existing
      ? await client
          .from("cart_items")
          .update({ quantity: nextQuantity, updated_at: new Date().toISOString() })
          .eq("id", existing.id)
          .eq("cart_id", cart.id)
      : await client.from("cart_items").insert({
          cart_id: cart.id,
          product_id: item.productId,
          variant_id: item.variantId,
          quantity: item.quantity,
        });

    if (result.error) throw result.error;
  }
}
