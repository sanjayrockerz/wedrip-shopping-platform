export const SHIPPING_PAISE = 0;
export const MAX_LINE_QUANTITY = 20;
export const MAX_CHECKOUT_LINES = 50;
export const MAX_CHECKOUT_AMOUNT_PAISE = 2_000_000_000;

export type CheckoutLineInput = { unitPricePaise: number; quantity: number };
export type CheckoutTotals = { subtotalPaise: number; discountPaise: number; shippingPaise: 0; totalPaise: number };

function safeInteger(value: number, label: string) {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error(`${label} must be a non-negative integer.`);
  return value;
}

export function calculateCheckoutTotals(lines: CheckoutLineInput[], discountPercentage = 0, maximumDiscountPaise?: number | null): CheckoutTotals {
  if (!lines.length || lines.length > MAX_CHECKOUT_LINES) throw new Error("The bag is empty or too large.");
  if (!Number.isInteger(discountPercentage) || discountPercentage < 0 || discountPercentage > 99) throw new Error("Discount percentage is invalid.");
  let subtotalPaise = 0;
  let discountPaise = 0;
  for (const line of lines) {
    const price = safeInteger(line.unitPricePaise, "Price");
    if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > MAX_LINE_QUANTITY) throw new Error("Quantity is invalid.");
    const lineSubtotal = price * line.quantity;
    if (!Number.isSafeInteger(lineSubtotal)) throw new Error("Checkout amount is too large.");
    subtotalPaise += lineSubtotal;
    discountPaise += Math.floor(lineSubtotal * discountPercentage / 100);
  }
  if (maximumDiscountPaise != null) discountPaise = Math.min(discountPaise, safeInteger(maximumDiscountPaise, "Maximum discount"));
  discountPaise = Math.min(discountPaise, subtotalPaise);
  const totalPaise = subtotalPaise - discountPaise;
  if (subtotalPaise > MAX_CHECKOUT_AMOUNT_PAISE || totalPaise > MAX_CHECKOUT_AMOUNT_PAISE) throw new Error("Checkout amount is too large.");
  return { subtotalPaise, discountPaise, shippingPaise: SHIPPING_PAISE, totalPaise };
}

