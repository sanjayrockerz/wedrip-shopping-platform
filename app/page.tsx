"use client";
import { useState } from "react";
import { Menu, Search, ShoppingBag, X, ArrowDown, Plus } from "lucide-react";

const products = [
  ["Scene 01 / Heavy Tee", "₹2,490", "/images/wedrip-tee.png", "cream"],
  ["After Hours / Box Hoodie", "₹4,290", "/images/wedrip-hoodie.png", "blue"],
  ["Studio 02 / Heavy Tee", "₹2,490", "/images/wedrip-tee.png", "orange"],
  ["No Fixed Address / Hoodie", "₹4,290", "/images/wedrip-hoodie.png", "ink"],
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cart, setCart] = useState(0);
  return <main>
    <div className="ticker"><span>WEAR THE SCENE — MADE IN INDIA — CREATOR-LED OBJECTS — </span><span>WEAR THE SCENE — MADE IN INDIA — CREATOR-LED OBJECTS — </span></div>
    <header className="nav">
      <button className="nav-action" onClick={() => setMenuOpen(true)}><Menu size={18}/> MENU</button>
      <a className="wordmark" href="#top">WE<span>●</span>DRIP</a>
      <div className="nav-right"><button aria-label="Search"><Search size={19}/></button><button><ShoppingBag size={19}/> BAG [{cart}]</button></div>
    </header>
    {menuOpen && <div className="menu-panel"><button className="close" onClick={() => setMenuOpen(false)}><X/> CLOSE</button><nav><a href="#drop" onClick={() => setMenuOpen(false)}>NEW DROP</a><a href="#objects" onClick={() => setMenuOpen(false)}>OBJECTS</a><a href="#manifesto" onClick={() => setMenuOpen(false)}>ABOUT WEDRIP</a></nav><p>CHENNAI / INDIA<br/>EST. 2026</p></div>}
    <section className="hero" id="top"><img src="/images/wedrip-hero.png" alt="WeDrip campaign featuring two models in oversized streetwear"/><div className="hero-shade"/><div className="hero-copy"><p>DROP 001 / THE THIRD SPACE</p><h1>NOT MERCH.<br/><em>A PIECE OF THE WORLD.</em></h1><a href="#objects">ENTER THE DROP <ArrowDown size={18}/></a></div><p className="vertical-note">CHENNAI — 13.0827° N, 80.2707° E</p></section>
    <section className="statement" id="manifesto"><p className="eyebrow">WE ARE WEDRIP / 001</p><h2>Creators build worlds.<br/>We make them <i>wearable.</i></h2><div className="statement-foot"><p>Limited objects made with people who shape culture.<br/>Designed with intent. Made to outlive the feed.</p><span>NO BLANKS. NO LOGO SLAPS.<br/>EVERY DROP HAS A REASON.</span></div></section>
    <section className="collection" id="objects"><div className="collection-head"><h2>THE OBJECTS</h2><div><span>DROP 001</span><span>VIEW [4]</span></div></div><div className="product-grid">{products.map((p,i)=><article className="product" key={p[0]}><div className={`product-image ${p[3]}`}><img src={p[2]} alt={p[0]}/><span>0{i+1}</span><button onClick={()=>setCart(cart+1)} aria-label={`Add ${p[0]} to bag`}><Plus/></button></div><div className="product-meta"><div><h3>{p[0]}</h3><p>240 GSM / LIMITED RUN</p></div><strong>{p[1]}</strong></div></article>)}</div></section>
    <section className="drop" id="drop"><div><p>NEXT TRANSMISSION / 09.26</p><h2>YOUR FAVOURITE CREATOR’S<br/><i>NEXT WORLD</i> STARTS HERE.</h2></div><a href="mailto:hello@wedrip.in">BUILD WITH WEDRIP ↗</a></section>
    <footer><a className="footer-logo" href="#top">WE<span>●</span>DRIP</a><div><p>Objects, uniforms and wearable worlds<br/>built with independent creators.</p><p>CHENNAI, INDIA<br/>HELLO@WEDRIP.IN</p><p>INSTAGRAM ↗<br/>SHIPPING & RETURNS</p></div><small>© 2026 WEDRIP STUDIO — ALL RIGHTS RESERVED</small></footer>
  </main>;
}
