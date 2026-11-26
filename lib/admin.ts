import type { NextRequest } from "next/server";
import { getAuthedSupabase } from "@/lib/supabase/request";
export async function requireAdmin(request: NextRequest, roles = ["SUPER_ADMIN", "ADMIN", "ORDER_MANAGER"]) { const auth = await getAuthedSupabase(request); if ("error" in auth) return auth; const { data } = await auth.client.from("admin_users").select("role").eq("user_id", auth.user.id).in("role", roles).maybeSingle(); return data ? auth : { error: "Forbidden", status: 403 as const }; }
export const ADMIN_ROLE_SETS = { dashboard: ["SUPER_ADMIN", "ADMIN"], catalog: ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"], operations: ["SUPER_ADMIN", "ADMIN", "ORDER_MANAGER"], finance: ["SUPER_ADMIN", "ADMIN"] } as const;
