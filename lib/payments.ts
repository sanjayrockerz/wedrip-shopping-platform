export type PaymentOrder = { id: string; total_paise: number; order_number: string };
export async function createPayment(_order: PaymentOrder) { return { status: "NOT_CONFIGURED" as const, message: "Payment unavailable / configuration required." }; }
export async function verifyPayment(_payload: unknown) { return { verified: false, status: "NOT_CONFIGURED" as const }; }
export async function handlePaymentWebhook(_payload: unknown) { return { accepted: false, status: "NOT_CONFIGURED" as const }; }
export async function refundPayment(_order: PaymentOrder) { return { status: "NOT_CONFIGURED" as const, message: "Refund provider is not configured." }; }
