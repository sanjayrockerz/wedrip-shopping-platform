import { requireGoogleUser } from "@/lib/google-auth"; import { AccountSection } from "@/components/account-section";
export const dynamic = "force-dynamic";
export default async function ProfilePage() { const user = await requireGoogleUser("/account/profile"); return <AccountSection title="PROFILE"><div className="account-panel"><p>GOOGLE ACCOUNT</p><strong>{user.name}</strong><small>{user.email}</small><small>Profile editing and persistence will be connected to the customer backend in the next commerce integration phase.</small></div></AccountSection>; }
