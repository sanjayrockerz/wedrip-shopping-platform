export const CHECKOUT_STATUSES = ["READY_FOR_PAYMENT", "PAYMENT_SUBMITTED", "UNDER_REVIEW", "HOLD", "REJECTED", "VERIFIED", "EXPIRED", "CANCELLED"] as const;
export type CheckoutStatus = typeof CHECKOUT_STATUSES[number];
export const PAYMENT_SUBMISSION_STATUSES = ["SUBMITTED", "UNDER_REVIEW", "HOLD", "REJECTED", "VERIFIED", "REPLACED"] as const;
export type PaymentSubmissionStatus = typeof PAYMENT_SUBMISSION_STATUSES[number];

const transitions: Record<string, readonly string[]> = {
  READY_FOR_PAYMENT: ["PAYMENT_SUBMITTED", "EXPIRED", "CANCELLED"],
  PAYMENT_SUBMITTED: ["UNDER_REVIEW", "HOLD", "REJECTED", "VERIFIED"],
  UNDER_REVIEW: ["HOLD", "REJECTED", "VERIFIED"],
  HOLD: ["UNDER_REVIEW", "REJECTED", "VERIFIED"],
  REJECTED: ["PAYMENT_SUBMITTED", "CANCELLED"],
};
export function canTransition(from: string, to: string) { return transitions[from]?.includes(to) ?? false; }
export function assertTransition(from: string, to: string) { if (!canTransition(from, to)) throw new Error(`Invalid payment transition: ${from} -> ${to}`); }

