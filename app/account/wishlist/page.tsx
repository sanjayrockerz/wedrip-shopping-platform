import { requireGoogleUser } from "@/lib/google-auth"; import { AccountSection } from "@/components/account-section";
export const dynamic = "force-dynamic";
export default async function WishlistPage() { await requireGoogleUser("/account/wishlist"); return <AccountSection title="WISHLIST"><div className="account-panel"><p>SAVED PIECES</p><strong>Your account wishlist is empty.</strong><small>Google identity is active; persistent account wishlist storage will be connected with the commerce database.</small></div></AccountSection>; }
