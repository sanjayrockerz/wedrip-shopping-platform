import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Truck } from "lucide-react";
import { formatPrice, getFeaturedProducts, getProductBySlug, getProductVariants } from "@/lib/products";
import { AddToBag } from "@/components/bag-actions";
import { WishlistButton } from "@/components/wishlist-button";
import { ShareButton } from "@/components/share-button";

export async function generateStaticParams() { const { products } = await getFeaturedProducts(); return products.map((product) => ({ slug: product.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const product = await getProductBySlug((await params).slug); return product ? { title: product.name, description: product.description ?? product.shortDescription ?? undefined, alternates: { canonical: `/products/${product.slug}` } } : {}; }

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();
  const variants = await getProductVariants(product.id);
  const hasStockData = variants.some((variant) => variant.stock_quantity !== null);
  const summary = product.shortDescription ?? product.description;
  return <main className="detail-page">
    <header className="detail-header"><Link href="/" aria-label="Back to WeDrip home"><ArrowLeft size={16} /> WEDRIP</Link><span>PRODUCT / {product.productType}</span></header>
    <div className="detail-layout">
      <div className={`detail-media ${product.visualTone ?? ""}`}><Image src={product.primaryImageUrl} alt={product.imageAlt} fill priority sizes="(max-width: 700px) 100vw, 56vw" /><span className="media-count">1 / 1</span></div>
      <section className="detail-copy" aria-labelledby="product-title">
        <div className="detail-summary"><p className="eyebrow">DROP 001 / {product.productType}</p><h1 id="product-title">{product.name}</h1><p className="detail-price">{formatPrice(product.pricePaise)}</p>{summary && <p className="detail-lede">{summary}</p>}</div>
        <div className="detail-purchase">
          <div className="detail-purchase-heading"><span>MAKE IT YOURS</span><span>SECURE THE OBJECT</span></div>
          {variants.length > 0 && <p className="availability" role="status">{hasStockData ? (variants.some((variant) => (variant.stock_quantity ?? 0) > 0) ? "IN STOCK" : "CURRENTLY UNAVAILABLE") : "Availability will be confirmed before order processing."}</p>}
          <AddToBag product={product} variants={variants} />
          <div className="product-secondary"><WishlistButton productId={product.id} /><ShareButton title={product.name} /></div>
        </div>
        <div className="detail-trust"><span><Check size={15} /> AUTHENTIC WE DRIP OBJECT</span><span><Truck size={15} /> SHIPPING CALCULATED AT CHECKOUT</span></div>
        <div className="detail-accordions">
          <details open><summary>DESCRIPTION</summary><p>{product.description ?? product.shortDescription}</p></details>
          <details><summary>MATERIAL / WEIGHT</summary><p>{product.material ?? "Material details will be confirmed for this object."}{product.gsm ? ` · ${product.gsm} GSM` : ""}</p></details>
          <details><summary>SHIPPING / RETURNS</summary><p>Each order is checked before dispatch. Delivery details and return support are confirmed after checkout.</p></details>
        </div>
      </section>
    </div>
  </main>;
}
