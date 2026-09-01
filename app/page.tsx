import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { catalog, collection, formatPrice } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  const heroProduct = catalog[0];
  return <main className="home-page">
    <div className="ticker"><span>WEAR THE SCENE - MADE IN INDIA - CREATOR-LED OBJECTS - </span><span>WEAR THE SCENE - MADE IN INDIA - CREATOR-LED OBJECTS - </span></div>
    <SiteHeader />
    <section className="hero" id="top"><Image src="/images/wedrip-hero.png" alt="WeDrip campaign featuring two models in oversized streetwear" fill priority sizes="100vw" className="hero-image"/><div className="hero-shade"/><div className="hero-copy"><p>DROP 001 / THE THIRD SPACE</p><h1>NOT MERCH.<br/><em>A PIECE OF THE WORLD.</em></h1><Link href="/collections/drop-001">ENTER THE DROP <ArrowDown size={18}/></Link></div><p className="vertical-note">CHENNAI - 13.0827 N, 80.2707 E</p></section>
    <section className="statement" id="manifesto"><p className="eyebrow">WE ARE WEDRIP / 001</p><h2>Creators build worlds.<br/>We make them <i>wearable.</i></h2><div className="statement-foot"><p>Limited objects made with people who shape culture.<br/>Designed with intent. Made to outlive the feed.</p><span>NO BLANKS. NO LOGO SLAPS.<br/>EVERY DROP HAS A REASON.</span></div></section>
    <section className="feature-object" aria-labelledby="feature-heading"><div className="feature-image cream"><Image src={heroProduct.media[0].src} alt={heroProduct.media[0].alt} fill sizes="(max-width: 700px) 100vw, 68vw"/></div><div className="feature-copy"><p className="eyebrow">{collection.eyebrow} / OBJECT 01</p><h2 id="feature-heading">{heroProduct.name}</h2><p>{heroProduct.description}</p><Link href={`/products/${heroProduct.slug}`}>VIEW THE PIECE <ArrowRight size={16}/></Link><strong>{formatPrice(heroProduct.price)}</strong></div></section>
    <section className="image-sequence" id="world"><div className="sequence-intro"><p className="eyebrow">THE SCENE / MATERIAL STUDIES</p><h2>Shape is a<br/><i>language.</i></h2><p>Garments are only one part of the world. The rest lives in light, texture, movement and the places we return to.</p></div><figure className="sequence-large"><Image src="/images/wedrip-hoodie.png" alt="Model wearing a black WeDrip hoodie against a blue urban backdrop" fill sizes="(max-width: 700px) 100vw, 44vw"/><figcaption>01 / AFTER HOURS</figcaption></figure><figure className="sequence-small"><Image src="/images/wedrip-tee.png" alt="Detail crop of the Scene 01 heavy tee" fill sizes="(max-width: 700px) 48vw, 22vw"/><figcaption>02 / WEIGHT + FORM</figcaption></figure></section>
    <section className="collection" id="objects"><div className="collection-head"><div><p className="eyebrow">DROP 001 / NOW LIVE</p><h2>THE OBJECTS</h2></div><Link href="/collections/drop-001" className="collection-link">VIEW ALL {catalog.length} <ArrowRight size={15}/></Link></div><div className="product-grid">{catalog.slice(1).map((product, index) => <ProductCard key={product.slug} product={product} priority={index === 0}/>)}</div></section>
    <section className="world-note"><p className="eyebrow">WORLD / 001</p><div><h2>Made for the people<br/>who make <i>the scene.</i></h2><p>WeDrip is a platform for future uniforms: clothing, images and objects made around the people and places shaping contemporary India. Creator and culture work is coming soon.</p></div></section>
    <section className="closing-image"><Image src="/images/wedrip-hero.png" alt="WeDrip campaign closing image" fill sizes="100vw"/><div className="closing-overlay"><p className="eyebrow">WEAR THE SCENE</p><Link href="/collections/drop-001">SHOP DROP 001 <ArrowRight size={16}/></Link></div></section>
    <footer><Link className="footer-logo" href="#top">WE<span>O</span>DRIP</Link><div><p>Objects, uniforms and wearable worlds<br/>built with independent creators.</p><p>CHENNAI, INDIA<br/>HELLO@WEDRIP.IN</p><p>INSTAGRAM -<br/>SHIPPING & RETURNS</p></div><small>2026 WEDRIP STUDIO - ALL RIGHTS RESERVED</small></footer>
  </main>;
}
