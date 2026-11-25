import "server-only";
import { getSupabaseSessionClient } from "@/lib/supabase/server";

export async function getServerUser() {
  const client = await getSupabaseSessionClient();
  if (!client) return null;
  const { data } = await client.auth.getUser();
  return data.user ? { client, user: data.user } : null;
}

export async function getServerAdmin(roles = ["SUPER_ADMIN", "ADMIN", "ORDER_MANAGER"]) {
  const auth = await getServerUser();
  if (!auth) return null;
  const { data } = await auth.client.from("admin_users").select("role").eq("user_id", auth.user.id).in("role", roles).maybeSingle();
  return data ? { ...auth, role: data.role } : null;
}
