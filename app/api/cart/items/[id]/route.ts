import { NextRequest } from "next/server";
import { getAuthedSupabase } from "@/lib/supabase/request";
import { jsonError, validateVariant } from "@/lib/commerce";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthedSupabase(request); if ("error" in auth) return Response.json({ error: auth.error }, { status: auth.status });
  try { const { id } = await params; const body = await request.json(); const quantity = Number(body.quantity); const { data: item } = await auth.client.from("cart_items").select("id,product_id,variant_id,carts!inner(user_id)").eq("id", id).eq("carts.user_id", auth.user.id).maybeSingle(); if (!item) throw new Error("Cart item not found."); await validateVariant(auth.client, item.product_id, item.variant_id, quantity); const { error } = await auth.client.from("cart_items").update({ quantity, updated_at: new Date().toISOString() }).eq("id", id); if (error) throw error; return Response.json({ ok: true }); } catch (error) { return jsonError(error); }
}
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { const auth = await getAuthedSupabase(request); if ("error" in auth) return Response.json({ error: auth.error }, { status: auth.status }); const { id } = await params; const { error } = await auth.client.from("cart_items").delete().eq("id", id).eq("carts.user_id", auth.user.id); if (error) return jsonError(error); return Response.json({ ok: true }); }
