import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { apiErrorResponse, PublicApiError } from "@/lib/http";
import { getBusinessWeekBounds } from "@/lib/reporting-period";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request, ["SUPER_ADMIN", "ADMIN"]);
  if ("error" in auth) return Response.json({ error: auth.error }, { status: auth.status, headers: { "Cache-Control": "private, no-store" } });
  try {
    const week = getBusinessWeekBounds();
    const { data: report, error } = await auth.client.rpc("get_admin_reporting_summary", { p_week_start: week.start, p_week_end: week.end });
    if (error) throw new PublicApiError("Reporting data is unavailable until the reporting migration is applied.", 503);
    const [designs, lowStock] = await Promise.all([
      auth.client.from("designs").select("id", { count: "exact", head: true }).in("status", ["UPLOADED", "IN_REVIEW"]),
      auth.client.from("product_variants").select("id", { count: "exact", head: true }).not("stock_quantity", "is", null).lte("stock_quantity", 5),
    ]);
    return Response.json({ report, operational: { designs_awaiting_review: designs.count ?? 0, low_stock_variants: lowStock.count ?? 0 }, refresh: { requested_at: new Date().toISOString(), week }, }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return apiErrorResponse(error, "Dashboard data could not be loaded."); }
}
