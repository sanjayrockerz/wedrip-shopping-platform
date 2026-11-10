"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, ArrowRight, UserRound, ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";

export function SiteHeader({ products }: { products: Product[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [dark, setDark] = useState<boolean | null>(null);
  const [bagCount, setBagCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = products.filter((product) => `${product.name} ${product.productType}`.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => { const stored = localStorage.getItem("wedrip-theme"); setDark(stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches); }, []);
  useEffect(() => { const update = () => { try { setBagCount(JSON.parse(localStorage.getItem("wedrip-bag") ?? "[]").reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0)); } catch { setBagCount(0); } }; update(); window.addEventListener("wedrip-bag-change", update); return () => window.removeEventListener("wedrip-bag-change", update); }, []);
  useEffect(() => { if (dark === null) return; document.documentElement.dataset.theme = dark ? "dark" : "light"; localStorage.setItem("wedrip-theme", dark ? "dark" : "light"); }, [dark]);
  useEffect(() => {
    const open = menuOpen || searchOpen;
    document.body.classList.toggle("overlay-open", open);
    if (searchOpen) inputRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") { setMenuOpen(false); setSearchOpen(false); } };
    window.addEventListener("keydown", onKeyDown);
    return () => { document.body.classList.remove("overlay-open"); window.removeEventListener("keydown", onKeyDown); };
  }, [menuOpen, searchOpen]);
  const closeAll = () => { setMenuOpen(false); setSearchOpen(false); };

  return <>
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label="WeDrip home">WE<span>O</span>DRIP</Link>
      <div className="nav-right"><button onClick={() => setSearchOpen(true)} aria-label="Open product search"><Search size={18} /><span>SEARCH</span></button><Link href="/account" aria-label="Account"><UserRound size={18} /><span>ACCOUNT</span></Link><Link href="/bag" aria-label={`Bag, ${bagCount} items`}><ShoppingBag size={18} /><span>BAG [{bagCount}]</span></Link></div>
    </header>
    {searchOpen && <div className="overlay search-panel" role="dialog" aria-modal="true" aria-label="Search products"><div className="search-head"><p className="eyebrow">SEARCH THE OBJECTS</p><button className="overlay-close" onClick={closeAll} aria-label="Close search"><X size={20} /> CLOSE</button></div><div className="search-input-wrap"><Search size={25} aria-hidden="true" /><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tee, hoodie..." aria-label="Search products" />{query && <button onClick={() => setQuery("")} aria-label="Clear search"><X size={18} /></button>}</div><p className="search-count" aria-live="polite">{results.length} {results.length === 1 ? "OBJECT" : "OBJECTS"}</p>{results.length ? <div className="search-results">{results.map((product) => <Link href={`/products/${product.slug}`} key={product.slug} onClick={closeAll}><Image src={product.primaryImageUrl} alt="" width={72} height={72} /><span><b>{product.name}</b><small>{product.productType}</small></span><strong>{formatPrice(product.pricePaise)}</strong><ArrowRight size={16} aria-hidden="true" /></Link>)}</div> : <div className="search-empty"><h2>Nothing <i>found.</i></h2><p>Try tee or hoodie.</p></div>}</div>}
  </>;
}
