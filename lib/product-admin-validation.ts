import { PublicApiError } from "@/lib/http";

export function rupeesToPaise(value: string): number {
  const input = value.trim().replace(/,/g, "");
  if (!/^\d+(?:\.\d{1,2})?$/.test(input)) throw new PublicApiError("Enter a valid INR amount.", 422);
  const [whole, fraction = ""] = input.split(".");
  const paise = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(paise) || paise <= 0) throw new PublicApiError("Price must be a positive, safe INR amount.", 422);
  return paise;
}

export function paiseToRupees(value: number | null | undefined): string { return Number.isInteger(value) && (value ?? 0) >= 0 ? ((value ?? 0) / 100).toFixed(2) : "0.00"; }

export function validateCatalogImage(bytes: Uint8Array, mime: string, size: number) {
  if (!(new Set(["image/jpeg", "image/png", "image/webp"])).has(mime)) throw new PublicApiError("Upload a JPG, PNG or WebP image.", 422);
  if (size <= 0 || size > 10 * 1024 * 1024) throw new PublicApiError("Image must be smaller than 10 MB.", 422);
  const png = bytes.length >= 8 && bytes.slice(0, 8).every((value, index) => value === [137, 80, 78, 71, 13, 10, 26, 10][index]);
  const jpeg = bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const webp = bytes.length >= 12 && new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
  if ((mime === "image/png" && !png) || (mime === "image/jpeg" && !jpeg) || (mime === "image/webp" && !webp)) throw new PublicApiError("The image content does not match its file type.", 422);
}
