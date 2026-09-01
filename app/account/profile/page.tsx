import { requireChatGPTUser } from "@/app/chatgpt-auth"; import { AccountSection } from "@/components/account-section";
export const dynamic = "force-dynamic";
export default async function ProfilePage() { const user = await requireChatGPTUser("/account/profile"); return <AccountSection title="PROFILE"><div className="account-panel"><p>Signed in as</p><strong>{user.email}</strong><small>Profile editing will be connected to the customer backend when commerce authentication is configured.</small></div></AccountSection>; }
