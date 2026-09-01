import { requireGoogleUser } from "@/lib/google-auth"; import { AccountSection } from "@/components/account-section";
export const dynamic = "force-dynamic";
export default async function AddressesPage() { await requireGoogleUser("/account/addresses"); return <AccountSection title="ADDRESSES"><div className="account-panel"><p>SAVED ADDRESSES</p><strong>No saved addresses.</strong><small>Address validation and persistence will be enabled when Shopify customer data is connected.</small></div></AccountSection>; }
