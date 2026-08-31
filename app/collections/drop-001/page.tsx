import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { catalog, collection } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";

export const metadata: Metadata = { title: `${collection.name} — WeDrip`, description: collection.description, alternates: { canonical: "/collections/drop-001" } };

export default function CollectionPage() {
  return <main className="collection-page"><header className="collection-page-header"><Link href="/" className="back-link"><ArrowLeft size={16}/> WEDRIP</Link><p className="eyebrow">{collection.eyebrow} / 2026</p><h1>{collection.name}</h1><p className="collection-description">{collection.description}</p><div className="collection-stats"><span>{catalog.length} objects</span><span>Made in India</span></div></header><section className="collection-grid" aria-label={`${collection.name} products`}>{catalog.map((product, index) => <ProductCard key={product.slug} product={product} priority={index < 2} featured={index === 0}/>)}</section></main>;
}
