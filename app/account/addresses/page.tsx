import { requireChatGPTUser } from "@/app/chatgpt-auth"; import { AccountSection } from "@/components/account-section";
export const dynamic = "force-dynamic";
export default async function AddressesPage() { await requireChatGPTUser("/account/addresses"); return <AccountSection title="ADDRESSES"><div className="account-panel"><p>SAVED ADDRESSES</p><strong>No saved addresses.</strong><small>Address validation and persistence will be enabled with the customer backend.</small></div></AccountSection>; }
