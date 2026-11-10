import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
export async function getAuthedSupabase(request: NextRequest) { const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, ""); const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; if (!token || !url || !key) return { error: "Unauthorized", status: 401 as const }; const client = createClient(url, key, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } }); const { data, error } = await client.auth.getUser(token); if (error || !data.user) return { error: "Unauthorized", status: 401 as const }; return { client, user: data.user };
}
