import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { collection } from "@/lib/products";

export const metadata = { title: "Collections — WeDrip", description: "Drops and visual studies from WeDrip." };
export default function CollectionsPage() { return <main className="collection-archive"><header className="detail-header"><Link href="/">WEDRIP</Link><Link href={`/collections/${collection.slug}`}>ENTER DROP <ArrowRight size={15} /></Link></header><section className="archive-intro"><p className="eyebrow">THE ARCHIVE / CURRENT DROPS</p><h1>COLLECT<br /><i>the world.</i></h1></section><Link className="archive-feature" href={`/collections/${collection.slug}`}><Image src="/images/wedrip-hero.png" alt="WeDrip Drop 001 campaign" fill sizes="100vw" /><span>{collection.eyebrow} / {collection.name} <ArrowRight size={15} /></span></Link></main>; }
