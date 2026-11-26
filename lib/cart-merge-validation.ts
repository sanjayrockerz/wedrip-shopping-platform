import { z } from "zod";

export const MAX_MERGE_BYTES = 16 * 1024;
export const MAX_MERGE_LINES = 50;
const line = z.object({ product_id: z.string().uuid().optional(), id: z.string().uuid().optional(), variant_id: z.string().uuid().optional(), size: z.string().trim().min(1).max(80).optional(), quantity: z.number().int().min(1).max(20) }).refine((item) => Boolean(item.product_id || item.id)).refine((item) => Boolean(item.variant_id || item.size));
const bodySchema = z.object({ items: z.array(line).max(MAX_MERGE_LINES) });

export function validateMergeBody(value: unknown) {
  const result = bodySchema.safeParse(value);
  if (!result.success) return null;
  const unique = new Map<string, { productId: string; variantId: string; size?: string; quantity: number }>();
  for (const item of result.data.items) {
    const productId = item.product_id ?? item.id!;
    const key = item.variant_id ?? `${productId}:${item.size}`;
    const previous = unique.get(key);
    if (previous && (previous.productId !== productId || previous.quantity + item.quantity > 20)) return null;
    unique.set(key, { productId, variantId: item.variant_id ?? "", size: item.size, quantity: (previous?.quantity ?? 0) + item.quantity });
  }
  return [...unique.values()];
}

export async function readBoundedJson(request: Request): Promise<unknown> {
  const length = request.headers.get("content-length");
  if (length && (!/^\d+$/.test(length) || Number(length) > MAX_MERGE_BYTES)) throw new Error("invalid body");
  if (!request.body) throw new Error("invalid body");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_MERGE_BYTES) { await reader.cancel(); throw new Error("invalid body"); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
}
