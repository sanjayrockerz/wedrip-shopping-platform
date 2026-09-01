import type { Metadata } from "next";
import Link from "next/link";
import { ShopExplorer } from "@/components/shop-explorer";
import { catalog } from "@/lib/catalog";
export const metadata: Metadata = { title: "Shop — WeDrip", description: "All WeDrip objects from Drop 001." };
export default function ShopPage() { return <main className="shop-page"><header className="section-page-header"><Link href="/">WE<span>●</span>DRIP</Link><div><Link href="/collections">COLLECTIONS</Link><Link href="/world">WORLD</Link><Link href="/bag">BAG</Link></div></header><section className="shop-intro"><p className="eyebrow">ALL OBJECTS / {catalog.length} PIECES</p><h1>SHOP<br/><i>the scene.</i></h1><p>Wearable objects from current and future drops. Made with intent in Chennai, India.</p></section><ShopExplorer /></main>; }
