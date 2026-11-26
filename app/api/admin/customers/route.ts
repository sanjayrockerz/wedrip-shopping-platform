import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request, ["SUPER_ADMIN", "ADMIN"]);
  if ("error" in auth) return Response.json({ error: auth.error }, { status: auth.status });
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") ?? "25") || 25));
  const search = url.searchParams.get("search")?.trim().replace(/[(),]/g, " ");
  let query = auth.client.from("profiles").select("id,first_name,last_name,phone,created_at,orders(id,total_paise,status),designs(id,status)", { count: "exact" }).order("created_at", { ascending: false }).range((page - 1) * limit, page * limit - 1);
  if (search) query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone.ilike.%${search}%`);
  const { data, error, count } = await query;
  if (error) return Response.json({ error: "Customers could not be loaded." }, { status: 500 });
  const adminClient = getSupabaseAdminClient();
  const authUsers = adminClient ? await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 }) : { data: { users: [] }, error: null };
  const roles = adminClient ? await adminClient.from("admin_users").select("user_id,role") : await auth.client.from("admin_users").select("user_id,role");
  const roleByUser = new Map((roles.data ?? []).map((row) => [row.user_id, row.role]));
  const emailByUser = new Map((authUsers.data?.users ?? []).map((user) => [user.id, user.email ?? null]));
  const customers = (data ?? []).map((customer) => ({ ...customer, email: emailByUser.get(customer.id) ?? null, admin_role: roleByUser.get(customer.id) ?? null }));
  return Response.json({ customers, page, limit, total: count ?? 0 }, { headers: { "Cache-Control": "private, no-store" } });
}
