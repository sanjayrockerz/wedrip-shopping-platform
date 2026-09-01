import Link from "next/link";
import { requireGoogleUser } from "@/lib/google-auth";
export const dynamic = "force-dynamic";
export default async function AccountPage() { const user = await requireGoogleUser("/account"); return <main className="account-page"><Link href="/" className="account-wordmark">WE<span>●</span>DRIP</Link><p className="eyebrow">MY ACCOUNT / GOOGLE VERIFIED</p><h1>WELCOME,<br/><i>{user.name}</i></h1><nav className="account-nav"><Link href="/account/profile">PROFILE <span>→</span></Link><Link href="/account/orders">ORDERS <span>→</span></Link><Link href="/account/addresses">ADDRESSES <span>→</span></Link><Link href="/account/wishlist">WISHLIST <span>→</span></Link></nav><a className="account-logout" href="/api/auth/logout">LOG OUT</a></main>; }
