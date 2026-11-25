import { NextRequest } from "next/server";
import { getAuthedSupabase } from "@/lib/supabase/request";
import { mergeCartItems } from "@/lib/cart-merge";
import { readBoundedJson, validateMergeBody } from "@/lib/cart-merge-validation";
import { apiErrorResponse } from "@/lib/http";

export async function POST(request: NextRequest) {
  const auth = await getAuthedSupabase(request);
  if ("error" in auth) return Response.json({ error: auth.error }, { status: auth.status });
  let items;
  try {
    items = validateMergeBody(await readBoundedJson(request));
  } catch {
    items = null;
  }
  if (!items) return Response.json({ error: "Invalid bag items or request size." }, { status: 400 });
  try {
    await mergeCartItems(auth.client, auth.user.id, items);
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiErrorResponse(error, "Unable to merge your bag.");
  }
}
