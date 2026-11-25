import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/format";

export const getProductHref = (product: Pick<Product, "slug">) => `/products/${product.slug}`;

export function ProductCard({ product, priority = false, featured = false }: { product: Product; priority?: boolean; featured?: boolean }) {
  const displayName = product.name.replace(/^.*\s\/\s(?=heavy tee$)/i, "");
  return <article className={`catalog-card${featured ? " catalog-card-featured" : ""}`}>
    <div className="catalog-media-wrap"><Link className={`catalog-media ${product.visualTone ?? ""}`} href={getProductHref(product)} aria-label={`View ${product.name}`}>
      <Image src={product.primaryImageUrl} alt={product.imageAlt} fill priority={priority} loading={priority ? undefined : "lazy"} sizes="(max-width: 359px) 100vw, (max-width: 899px) 50vw, (max-width: 1199px) 33vw, 25vw" style={{ objectFit: product.visualTone === "mug" || product.visualTone === "bottle" ? "contain" : "cover", objectPosition: "center top" }} />
      <span className="catalog-index">{String(product.displayOrder).padStart(3, "0")} / {product.productType}</span>
    </Link><div className="quick-sizes" aria-label={`Available sizes for ${product.name}`}><span>AVAILABLE SIZES</span><div>{["S", "M", "L", "XL"].map((size) => <b key={size}>{size}</b>)}</div></div></div>
    <div className="catalog-meta"><div><p className="catalog-category">{product.productType}</p><h3>{displayName}</h3></div><strong>{formatPrice(product.pricePaise)}</strong></div>
  </article>;
}
