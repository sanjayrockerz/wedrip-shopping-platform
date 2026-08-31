import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/catalog";

export function ProductCard({ product, priority = false, featured = false }: { product: Product; priority?: boolean; featured?: boolean }) {
  return (
    <article className={`catalog-card${featured ? " catalog-card-featured" : ""}`}>
      <Link className={`catalog-media ${product.tone}`} href={`/products/${product.slug}`} aria-label={`View ${product.name}`}>
        <Image src={product.media[0].src} alt={product.media[0].alt} fill priority={priority} sizes={featured ? "(max-width: 700px) 100vw, 66vw" : "(max-width: 700px) 100vw, 50vw"} />
        <span className="catalog-index">{product.availability === "Sold out" ? "SOLD OUT" : product.availability.toUpperCase()}</span>
        <span className="catalog-view">VIEW PIECE <span aria-hidden="true">↗</span></span>
      </Link>
      <div className="catalog-meta"><div><h3>{product.name}</h3><p>{product.material}</p></div><strong>{formatPrice(product.price)}</strong></div>
    </article>
  );
}
