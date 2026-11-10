import { NextRequest } from "next/server";
import { getAuthedSupabase } from "@/lib/supabase/request";
import { jsonError } from "@/lib/commerce";
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { const auth = await getAuthedSupabase(request); if ("error" in auth) return Response.json({ error: auth.error }, { status: auth.status }); const { id } = await params; const { data, error } = await auth.client.from("orders").select("*,order_items(*),order_status_history(*)").eq("id", id).eq("user_id", auth.user.id).maybeSingle(); if (error) return jsonError(error); if (!data) return Response.json({ error: "Order not found." }, { status: 404 }); return Response.json({ order: data }); }
