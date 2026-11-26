import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { recordAudit } from "@/lib/audit";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { apiErrorResponse } from "@/lib/http";
import { validateCatalogImage } from "@/lib/product-admin-validation";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request, ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"]);
  if ("error" in auth) return Response.json({ error: auth.error }, { status: auth.status });
  try {
    const { id } = await params;
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return Response.json({ error: "Choose an image to upload." }, { status: 422 });
    const bytes = new Uint8Array(await file.arrayBuffer());
    validateCatalogImage(bytes, file.type, file.size);
    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `products/${id}/${crypto.randomUUID()}.${extension}`;
    const admin = getSupabaseAdminClient();
    if (!admin) throw new Error("Privileged storage is not configured.");
    const upload = await admin.storage.from("product-images").upload(path, bytes, { contentType: file.type, cacheControl: "31536000", upsert: false });
    if (upload.error) throw upload.error;
    const publicUrl = admin.storage.from("product-images").getPublicUrl(path).data.publicUrl;
    const alt = typeof form.get("image_alt") === "string" ? String(form.get("image_alt")).trim() : "WeDrip product image";
    const { data, error } = await auth.client.from("products").update({ primary_image_url: publicUrl, image_alt: alt || "WeDrip product image", updated_at: new Date().toISOString() }).eq("id", id).select("id,primary_image_url,image_alt").single();
    if (error) throw error;
    await recordAudit(auth.client, auth.user.id, "PRODUCT_IMAGE_CHANGED", "product", id, { mime_type: file.type, size_bytes: file.size, storage_path: path });
    return Response.json({ image: data });
  } catch (error) { return apiErrorResponse(error, "Product image could not be uploaded."); }
}
