import type { SupabaseClient } from "@supabase/supabase-js";

export const MAX_QUANTITY = 20;
export type Variant = { id: string; product_id: string; size: string; color: string | null; sku: string | null; price_paise: number | null; stock_quantity: number | null; active: boolean };

export async function validateVariant(client: SupabaseClient, productId: string, variantId: string, quantity: number) {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) throw new Error(`Quantity must be between 1 and ${MAX_QUANTITY}.`);
  const { data, error } = await client.from("product_variants").select("id,product_id,size,color,sku,price_paise,stock_quantity,active,products!inner(is_active,price_paise)").eq("id", variantId).eq("product_id", productId).maybeSingle();
  if (error || !data) throw new Error("Product variant is invalid.");
  const raw = data as unknown as Variant & { products: { is_active: boolean; price_paise: number } | { is_active: boolean; price_paise: number }[] };
  const row = { ...raw, products: Array.isArray(raw.products) ? raw.products[0] : raw.products };
  if (!row.active || !row.products.is_active || row.stock_quantity === null) throw new Error("This variant is currently unavailable.");
  if (quantity > row.stock_quantity) throw new Error("The requested quantity exceeds available stock.");
  return { ...row, authoritative_price_paise: row.price_paise ?? row.products.price_paise };
}

export function jsonError(error: unknown, fallback = "Request failed.") {
  const message = error instanceof Error ? error.message : fallback;
  return Response.json({ error: message }, { status: message === "Unauthorized" ? 401 : 400 });
}
