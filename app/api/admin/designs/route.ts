import { NextRequest } from "next/server";
import { getAuthedSupabase } from "@/lib/supabase/request";
import { jsonError } from "@/lib/commerce";
async function authorize(request: NextRequest) { const auth = await getAuthedSupabase(request); if ("error" in auth) return auth; const { data } = await auth.client.from("admin_users").select("role").eq("user_id", auth.user.id).in("role", ["SUPER_ADMIN", "ADMIN", "ORDER_MANAGER"]).maybeSingle(); return data ? auth : { error: "Forbidden", status: 403 as const }; }
export async function GET(request: NextRequest) { const auth = await authorize(request); if ("error" in auth) return Response.json({ error: auth.error }, { status: auth.status }); const url = new URL(request.url); let query = auth.client.from("designs").select("*,orders!inner(order_number,user_id),design_versions(*)").order("updated_at", { ascending: false }); const status = url.searchParams.get("status"); if (status) query = query.eq("status", status); const { data, error } = await query; if (error) return jsonError(error); return Response.json({ designs: data ?? [] }); }
export { authorize };
