import { NextRequest } from "next/server";
import { getAuthedSupabase } from "@/lib/supabase/request";
import { apiErrorResponse, PublicApiError } from "@/lib/http";
export async function POST(request: NextRequest) {
  const auth = await getAuthedSupabase(request); if ("error" in auth) return Response.json({ error: auth.error }, { status: auth.status });
  try { const body = await request.json(); if (typeof body.address_id !== "string" || typeof body.idempotency_key !== "string") throw new PublicApiError("Address and checkout idempotency key are required.");
    const { data, error } = await auth.client.rpc("create_checkout_from_cart", { p_address_id: body.address_id, p_discount_code: typeof body.discount_code === "string" ? body.discount_code : null, p_idempotency_key: body.idempotency_key });
    if (error) throw new PublicApiError(error.message, error.message.includes("invalid") ? 400 : 409); return Response.json(data, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiErrorResponse(error, "Checkout could not be created."); }
}
export async function GET(request: NextRequest) { const auth = await getAuthedSupabase(request); if ("error" in auth) return Response.json({ error: auth.error }, { status: auth.status }); const { data, error } = await auth.client.from("checkouts").select("id,checkout_reference,final_amount_paise,status,expires_at,created_at,payment_submissions(id,status,submitted_at)").eq("customer_id", auth.user.id).order("created_at", { ascending: false }).limit(20); if (error) return apiErrorResponse(error, "Checkouts could not be loaded."); return Response.json({ checkouts: data ?? [] }, { headers: { "Cache-Control": "no-store" } }); }
