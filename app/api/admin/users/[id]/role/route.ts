import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { recordAudit } from "@/lib/audit";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request, ["SUPER_ADMIN"]);
  if ("error" in auth) return Response.json({ error: auth.error }, { status: auth.status });
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return Response.json({ error: "Invalid user id." }, { status: 422 });
  const body = await request.json().catch(() => ({}));
  if (body.role !== "ADMIN") return Response.json({ error: "Only the ADMIN role can be granted from this control." }, { status: 422 });
  const adminClient = getSupabaseAdminClient();
  if (!adminClient) return Response.json({ error: "Privileged administrator operations are unavailable." }, { status: 503 });
  const { data: userResult, error: userError } = await adminClient.auth.admin.getUserById(id);
  if (userError || !userResult.user) return Response.json({ error: "Auth user not found." }, { status: 404 });
  if (!userResult.user.email_confirmed_at) return Response.json({ error: "The user must confirm their email before promotion." }, { status: 422 });
  const { error } = await adminClient.from("admin_users").upsert({ user_id: id, role: "ADMIN" }, { onConflict: "user_id" });
  if (error) return Response.json({ error: "Administrator role could not be saved." }, { status: 500 });
  await recordAudit(auth.client, auth.user.id, "ADMIN_ROLE_ASSIGNED", "admin_user", id, { role: "ADMIN" });
  return Response.json({ promoted: true, user_id: id, role: "ADMIN" });
}
