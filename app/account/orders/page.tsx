import { requireChatGPTUser } from "@/app/chatgpt-auth"; import { AccountSection } from "@/components/account-section";
export const dynamic = "force-dynamic";
export default async function OrdersPage() { await requireChatGPTUser("/account/orders"); return <AccountSection title="ORDERS"><div className="account-panel"><p>ORDER HISTORY</p><strong>No orders yet.</strong><small>Orders will appear here once a commerce backend is connected. This prototype does not fabricate order data.</small></div></AccountSection>; }
