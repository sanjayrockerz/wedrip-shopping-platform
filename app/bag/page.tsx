import Link from "next/link";
import { BagView } from "@/components/bag-actions";
export default function BagPage() { return <main className="bag-page"><header className="detail-header"><Link href="/">← WEDRIP</Link><span>BAG</span></header><div className="bag-heading"><p className="eyebrow">SHOPPING BAG</p><h1>Your bag.</h1></div><BagView /></main>; }
