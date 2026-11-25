import { z } from "zod";
import { PublicApiError } from "@/lib/http";

const optionalDate = z.string().trim().min(1).optional().nullable();

export const discountInput = z.object({
  code: z.string().trim().regex(/^[A-Za-z0-9]{4,20}$/, "Code must be 4–20 letters or numbers."),
  discount_type: z.literal("PERCENTAGE"),
  discount_value: z.number().int().min(1).max(99),
  minimum_order_paise: z.number().int().min(0).default(0),
  maximum_discount_paise: z.number().int().positive().nullable().optional(),
  starts_at: optionalDate,
  ends_at: optionalDate,
  usage_limit: z.number().int().positive().nullable().optional(),
  per_customer_limit: z.number().int().positive().nullable().optional(),
  active: z.boolean().optional(),
});

export const shipperInput = z.object({
  name: z.string().trim().min(2).max(120),
  company: z.string().trim().max(120).nullable().optional(),
  email: z.string().trim().email().max(254).nullable().optional(),
  whatsapp_number: z.string().trim().max(32).nullable().optional(),
  contact_status: z.enum(["UNVERIFIED", "PENDING_TEST", "VERIFIED", "FAILED"]).default("UNVERIFIED"),
  is_active: z.boolean().default(true),
  is_default: z.boolean().default(false),
});

export function parseAdminInput<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new PublicApiError(issue?.message ?? "Invalid request.", 422);
  }
  return result.data;
}

export function assertPositivePaise(value: unknown) {
  if (!Number.isInteger(value) || Number(value) <= 0) throw new PublicApiError("Price must be a positive integer in paise.", 422);
}
