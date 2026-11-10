import Link from "next/link";
import { AccountManagement } from "@/components/account-management";
import { OrderHistory } from "@/components/order-history";
import { DesignWorkspace } from "@/components/design-workspace";

export default async function AccountSection({ params, searchParams }: { params: Promise<{ section: string[] }>; searchParams: Promise<{ confirmed?: string }> }) {
  const { section } = await params; const { confirmed } = await searchParams; const title = section.join(" / ").replaceAll("-", " ").toUpperCase(); const kind = section[0] === "profile" || section[0] === "addresses" || section[0] === "wishlist" ? section[0] as "profile" | "addresses" | "wishlist" : null;
  return <main className="account-page account-subpage"><Link className="account-wordmark" href="/account">WE<span>O</span>DRIP</Link><Link href="/account" className="eyebrow">← MY ACCOUNT</Link><h1>{title}.</h1>{kind ? <AccountManagement kind={kind} /> : section[0] === "orders" ? <OrderHistory id={section[1]} confirmed={confirmed === "1"} /> : section[0] === "designs" ? <DesignWorkspace id={section[1]} /> : <div className="account-empty"><p className="eyebrow">{title}</p><h2>Nothing here<br /><i>yet.</i></h2><Link href="/account">BACK TO ACCOUNT →</Link></div>}</main>;
}
