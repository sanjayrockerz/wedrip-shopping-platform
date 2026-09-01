import Link from "next/link";
export function AccountSection({ title, children }: { title: string; children: React.ReactNode }) { return <main className="account-page account-subpage"><Link href="/account" className="account-wordmark">WE<span>●</span>DRIP</Link><Link href="/account" className="eyebrow">← MY ACCOUNT</Link><h1>{title}</h1>{children}</main>; }
