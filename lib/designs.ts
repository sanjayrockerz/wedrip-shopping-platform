import type { SupabaseClient } from "@supabase/supabase-js";
export const DESIGN_MAX_BYTES = 10 * 1024 * 1024;
export const DESIGN_MIME_TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "application/pdf": "pdf" } as const;
export type DesignStatus = "UPLOADED" | "IN_REVIEW" | "SENT_TO_CUSTOMER" | "REVISION_REQUESTED" | "APPROVED" | "PRODUCTION";
export function validateDesignFile(file: File) { if (!DESIGN_MIME_TYPES[file.type as keyof typeof DESIGN_MIME_TYPES]) throw new Error("Unsupported design file. Use JPG, PNG, WEBP, or PDF."); if (file.size <= 0 || file.size > DESIGN_MAX_BYTES) throw new Error("Design files must be smaller than 10 MB."); }
export async function signedDesignUrl(client: SupabaseClient, path: string) { const { data, error } = await client.storage.from("customer-designs").createSignedUrl(path, 300); if (error) throw error; return data.signedUrl; }
export const customerTransitions: Record<DesignStatus, DesignStatus[]> = { UPLOADED: [], IN_REVIEW: [], SENT_TO_CUSTOMER: ["APPROVED", "REVISION_REQUESTED"], REVISION_REQUESTED: [], APPROVED: [], PRODUCTION: [] };
export const adminTransitions: Record<DesignStatus, DesignStatus[]> = { UPLOADED: ["IN_REVIEW"], IN_REVIEW: ["SENT_TO_CUSTOMER", "REVISION_REQUESTED"], SENT_TO_CUSTOMER: ["IN_REVIEW"], REVISION_REQUESTED: ["IN_REVIEW"], APPROVED: ["PRODUCTION"], PRODUCTION: [] };
