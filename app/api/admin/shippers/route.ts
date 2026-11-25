import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { recordAudit } from "@/lib/audit";
import { parseAdminInput, shipperInput } from "@/lib/admin-validation";
import { apiErrorResponse } from "@/lib/http";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request, ["SUPER_ADMIN", "ADMIN"]);
  if ("error" in auth) return Response.json({ error: auth.error }, { status: auth.status });
  const { data, error } = await auth.client.from("shippers").select("*").order("is_default", { ascending: false }).order("name");
  if (error) return apiErrorResponse(error, "Shippers could not be loaded.");
  return Response.json({ shippers: data ?? [] }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, ["SUPER_ADMIN", "ADMIN"]);
  if ("error" in auth) return Response.json({ error: auth.error }, { status: auth.status });
  try {
    const input = parseAdminInput(shipperInput, await request.json());
    const { data, error } = await auth.client.from("shippers").insert(input).select("*").single();
    if (error) throw error;
    await recordAudit(auth.client, auth.user.id, "SHIPPER_CREATED", "shipper", data.id, { name: data.name, is_default: data.is_default });
    return Response.json({ shipper: data }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error, "Shipper could not be created.");
  }
}
