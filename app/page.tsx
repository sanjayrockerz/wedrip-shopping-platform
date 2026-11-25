import Link from "next/link";
import { getCatalogProducts, getFeaturedProducts, starterProducts } from "@/lib/products";
import { HomeCatalog } from "@/components/home-catalog";
import { SiteHeader } from "@/components/site-header";
import "./hero-responsive.css";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [{ products }, catalog] = await Promise.all([getFeaturedProducts(), getCatalogProducts()]);
  const visibleProducts = products.length ? products : starterProducts.filter((product) => product.isFeatured);
  const visibleCatalog = catalog.products.length ? catalog.products : starterProducts;
  return <main className="home-page" id="top"><a className="skip-link" href="#main-content">Skip to content</a><SiteHeader products={visibleCatalog} /><div id="main-content">
    <section className="editorial-hero" aria-labelledby="hero-title"><div className="hero-copy"><p className="eyebrow">PREMIUM STREETWEAR MERCH</p><h1 id="hero-title"><span>WEAR</span><strong>THE SCENE</strong></h1><p className="hero-description">Curated streetwear essentials —<br className="desktop-only" /> tees, hoodies and everyday objects.</p><Link className="hero-cta" href="#objects">SHOP COLLECTION <span aria-hidden="true">→</span></Link></div><div className="hero-gallery" aria-label="WeDrip editorial campaign"><figure><img src="/images/wedrip-tee.png" alt="Model wearing a WeDrip heavyweight tee" style={{ objectPosition: "center top" }} /></figure><figure><img src="/images/wedrip-hoodie.png" alt="Model wearing a WeDrip black hoodie" style={{ objectPosition: "center top" }} /></figure></div></section>
    <HomeCatalog products={visibleCatalog} featuredProducts={visibleProducts} />
    <footer><Link className="footer-logo" href="#top">WE<span>O</span>DRIP</Link><div className="footer-grid"><p>Contemporary streetwear<br />designed in Chennai, India.</p><p>CHENNAI, INDIA<br /><a href="mailto:hello@wedrip.in">HELLO@WEDRIP.IN</a></p><nav aria-label="Footer navigation"><a href="#objects">SHOP</a><a href="/account">ACCOUNT</a><a href="/bag">BAG</a><a href="https://www.instagram.com/wedrip.merch?utm_source=ig_web_button_share_sheet&dlrf=ZDNlZDc0MzIxNw==" target="_blank" rel="noreferrer">INSTAGRAM ↗</a></nav></div><small>© 2026 WEDRIP STUDIO — ALL RIGHTS RESERVED</small></footer>
  </div></main>;
}
