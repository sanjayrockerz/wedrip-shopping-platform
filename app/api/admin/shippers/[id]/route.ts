import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { recordAudit } from "@/lib/audit";
import { parseAdminInput, shipperInput } from "@/lib/admin-validation";
import { apiErrorResponse } from "@/lib/http";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request, ["SUPER_ADMIN", "ADMIN"]);
  if ("error" in auth) return Response.json({ error: auth.error }, { status: auth.status });
  try {
    const { id } = await params;
    const input = parseAdminInput(shipperInput.partial(), await request.json());
    const { data, error } = await auth.client.from("shippers").update({ ...input, updated_at: new Date().toISOString() }).eq("id", id).select("*").single();
    if (error || !data) throw error ?? new Error("Shipper not found.");
    await recordAudit(auth.client, auth.user.id, "SHIPPER_UPDATED", "shipper", id, { changed_fields: Object.keys(input) });
    return Response.json({ shipper: data });
  } catch (error) {
    return apiErrorResponse(error, "Shipper could not be updated.");
  }
}
