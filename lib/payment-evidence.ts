const MAX_BYTES = 5 * 1024 * 1024;
const signatures: Record<string, number[]> = { "image/jpeg": [0xff, 0xd8, 0xff], "image/png": [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], "image/webp": [0x52, 0x49, 0x46, 0x46] };
export function validatePaymentEvidence(file: { type: string; size: number; bytes: Uint8Array }) {
  if (!signatures[file.type] || file.size < 1 || file.size > MAX_BYTES) throw new Error("Upload a JPEG, PNG or WebP image up to 5 MB.");
  const signature = signatures[file.type];
  if (!signature.every((value, index) => file.bytes[index] === value) || (file.type === "image/webp" && String.fromCharCode(...file.bytes.slice(8, 12)) !== "WEBP")) throw new Error("The uploaded file is not a valid image.");
  return true;
}
export const PAYMENT_EVIDENCE_MAX_BYTES = MAX_BYTES;

