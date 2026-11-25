"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/products";

const categories = ["Featured", "T-Shirts", "Hoodies", "Objects", "All"] as const;

export function HomeCatalog({ products, featuredProducts }: { products: Product[]; featuredProducts: Product[] }) {
  const [category, setCategory] = useState<(typeof categories)[number]>("Featured");
  const visibleProducts = useMemo(() => {
    if (category === "Featured") return featuredProducts;
    if (category === "All") return products;
    if (category === "Objects") return products.filter((product) => !["t-shirts", "hoodies"].includes(product.productType.toLowerCase()));
    return products.filter((product) => product.productType.toLowerCase() === category.toLowerCase());
  }, [category, featuredProducts, products]);

  return <section className="home-catalog" id="objects" aria-labelledby="objects-title">
    <div className="catalog-heading"><div><p className="eyebrow">FEATURED OBJECTS</p><h2 id="objects-title">SHOP THE EDIT</h2></div><a href="/shop">VIEW ALL <span aria-hidden="true">→</span></a></div>
    <nav className="category-nav" aria-label="Product categories">{categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)} aria-pressed={category === item}>{item}</button>)}</nav>
    {visibleProducts.length ? <div className="product-grid">{visibleProducts.map((product, index) => <ProductCard key={product.id} product={product} priority={index < 2} />)}</div> : <p className="catalog-empty">No objects in this category yet.</p>}
  </section>;
}
