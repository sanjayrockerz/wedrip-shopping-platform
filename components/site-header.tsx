"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { catalog } from "@/lib/catalog";

export function SiteHeader({ dark = true }: { dark?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const matches = catalog.filter((product) => `${product.name} ${product.type}`.toLowerCase().includes(query.trim().toLowerCase()));
  useEffect(() => { const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") { setMenuOpen(false); setSearchOpen(false); } }; window.addEventListener("keydown", onKeyDown); return () => window.removeEventListener("keydown", onKeyDown); }, []);
  return <>
    <header className={`site-header${dark ? " site-header-dark" : ""}`}><button className="nav-action" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu size={18}/> <span>MENU</span></button><Link className="wordmark" href="/">WE<span>O</span>DRIP</Link><nav className="desktop-nav" aria-label="Primary navigation"><Link href="/collections/drop-001">SHOP</Link><a href="#world">WORLD</a></nav><div className="nav-right"><button onClick={() => setSearchOpen(true)} aria-label="Search"><Search size={19}/><span className="nav-word">SEARCH</span></button><Link href="/collections/drop-001" className="bag-trigger"><ShoppingBag size={19}/> <span className="nav-word">BAG</span> [0]</Link></div></header>
    {menuOpen && <div className="menu-panel" role="dialog" aria-modal="true" aria-label="Site menu"><button className="close" onClick={() => setMenuOpen(false)}><X/> CLOSE</button><nav><Link href="/collections/drop-001" onClick={() => setMenuOpen(false)}>SHOP</Link><a href="#world" onClick={() => setMenuOpen(false)}>WORLD</a><a href="#manifesto" onClick={() => setMenuOpen(false)}>ABOUT WEDRIP</a></nav><p>CHENNAI / INDIA<br/>EST. 2026</p></div>}
    {searchOpen && <div className="search-panel" role="dialog" aria-modal="true" aria-label="Search products"><div className="search-head"><label htmlFor="site-search">SEARCH THE DROP</label><button onClick={() => setSearchOpen(false)} aria-label="Close search"><X size={20}/></button></div><input id="site-search" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pieces..."/><div className="search-results">{query && matches.length === 0 && <p className="search-empty">No pieces found. Try tee or hoodie.</p>}{(query ? matches : catalog).map((product) => <Link href={`/products/${product.slug}`} key={product.slug} onClick={() => setSearchOpen(false)}><span>{product.name}</span><small>{product.type}</small></Link>)}</div><p className="search-note">Local catalog search / backend search connection required for a live inventory index.</p></div>}
  </>;
}
