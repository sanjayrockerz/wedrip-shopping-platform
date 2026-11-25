import "server-only";
export function getPaymentConfig() {
  const enabled = process.env.WEDRIP_PAYMENT_ENABLED === "true";
  const vpa = process.env.WEDRIP_UPI_VPA?.trim() ?? "";
  const merchantName = process.env.WEDRIP_UPI_MERCHANT_NAME?.trim() ?? "";
  const expiryHours = Math.max(1, Math.min(168, Number(process.env.WEDRIP_CHECKOUT_EXPIRY_HOURS ?? 48) || 48));
  return { enabled: enabled && Boolean(vpa && merchantName), merchantName, vpa, expiryHours };
}
export function buildUpiUri(amountPaise: number, reference: string) {
  const config = getPaymentConfig();
  if (!config.enabled) return null;
  const params = new URLSearchParams({ pa: config.vpa, pn: config.merchantName, am: (amountPaise / 100).toFixed(2), cu: "INR", tn: `WeDrip ${reference}` });
  return `upi://pay?${params.toString()}`;
}

