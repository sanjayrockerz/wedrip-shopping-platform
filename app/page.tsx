import Image from "next/image";
import Link from "next/link";
import { getCatalogProducts, getFeaturedProducts } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [{ products, error }, catalog] = await Promise.all([getFeaturedProducts(), getCatalogProducts()]);
  return <main className="home-page" id="top"><a className="skip-link" href="#main-content">Skip to content</a><SiteHeader products={catalog.products} /><div id="main-content">
    <section className="collection" id="objects" aria-labelledby="objects-title"><div className="collection-head"><div><p className="eyebrow">DROP 001 / FEATURED OBJECTS</p><h2 id="objects-title">THE OBJECTS</h2></div><span className="collection-count">{products.length} {products.length === 1 ? "PIECE" : "PIECES"} / MADE IN INDIA</span></div>{error ? <div className="product-grid-state" role="status"><p>THE OBJECTS ARE TEMPORARILY OFFLINE.<br />TRY AGAIN SHORTLY.</p></div> : products.length === 0 ? <div className="product-grid-state" role="status"><p>NO OBJECTS IN THIS DROP YET.</p></div> : <div className="product-grid">{products.map((product, index) => <ProductCard key={product.id} product={product} priority={index < 2} featured={index === 0} />)}</div>}</section>
    <section className="image-sequence" id="world" aria-labelledby="world-title"><div className="sequence-intro"><p className="eyebrow">THE SCENE / MATERIAL STUDIES</p><h2 id="world-title">Shape is a<br /><i>language.</i></h2><p>Garments are only one part of the world. The rest lives in light, texture, movement and the places we return to.</p></div><figure className="sequence-large"><Image src="/images/wedrip-hoodie.png" alt="Model wearing a black WeDrip hoodie against a blue urban backdrop" fill sizes="(max-width: 700px) 100vw, 44vw" /><figcaption>01 / AFTER HOURS</figcaption></figure><figure className="sequence-small"><Image src="/images/wedrip-tee.png" alt="Detail crop of a WeDrip heavy tee" fill sizes="(max-width: 700px) 48vw, 22vw" /><figcaption>02 / WEIGHT + FORM</figcaption></figure></section>
    <footer><Link className="footer-logo" href="#top">WE<span>O</span>DRIP</Link><div className="footer-grid"><p>Contemporary streetwear<br />designed in Chennai, India.</p><p>CHENNAI, INDIA<br /><a href="mailto:hello@wedrip.in">HELLO@WEDRIP.IN</a></p><nav aria-label="Footer navigation"><a href="#objects">SHOP</a><a href="/account">ACCOUNT</a><a href="/bag">BAG</a><a href="https://www.instagram.com/wedrip.in/" target="_blank" rel="noreferrer">INSTAGRAM ↗</a></nav></div><small>© 2026 WEDRIP STUDIO — ALL RIGHTS RESERVED</small></footer>
  </div></main>;
}
