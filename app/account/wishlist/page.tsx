import { requireChatGPTUser } from "@/app/chatgpt-auth"; import { AccountSection } from "@/components/account-section";
export const dynamic = "force-dynamic";
export default async function WishlistPage() { await requireChatGPTUser("/account/wishlist"); return <AccountSection title="WISHLIST"><div className="account-panel"><p>SAVED PIECES</p><strong>Your account wishlist is empty.</strong><small>Guest saves remain local until an authenticated wishlist backend is connected.</small></div></AccountSection>; }
