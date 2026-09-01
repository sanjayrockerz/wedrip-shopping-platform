import { requireGoogleUser } from "@/lib/google-auth"; import { AccountSection } from "@/components/account-section";
export const dynamic = "force-dynamic";
export default async function OrdersPage() { await requireGoogleUser("/account/orders"); return <AccountSection title="ORDERS"><div className="account-panel"><p>ORDER HISTORY</p><strong>No orders yet.</strong><small>Orders will appear here once Shopify is connected. WhatsApp handoffs are not treated as confirmed orders.</small></div></AccountSection>; }
