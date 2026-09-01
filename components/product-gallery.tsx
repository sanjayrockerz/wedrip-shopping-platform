"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/catalog";

export function ProductGallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const media = product.media;
  const move = (direction: number) => setActive((current) => (current + direction + media.length) % media.length);
  useEffect(() => { const onKey = (event: KeyboardEvent) => { if (event.key === "ArrowRight") move(1); if (event.key === "ArrowLeft") move(-1); }; window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); });
  return <section className={`product-gallery product-gallery-${product.tone}`} aria-label={`${product.name} product media`}>
    <div className="gallery-stage">
      <Image src={media[active].src} alt={media[active].alt} fill priority={active === 0} sizes="(max-width: 700px) 100vw, 60vw" />
      <span className="gallery-label">{media[active].kind.toUpperCase()}</span>
      {media.length > 1 && <div className="gallery-controls"><button type="button" onClick={() => move(-1)} aria-label="Previous product image"><ChevronLeft size={18} /></button><span>{String(active + 1).padStart(2, "0")} / {String(media.length).padStart(2, "0")}</span><button type="button" onClick={() => move(1)} aria-label="Next product image"><ChevronRight size={18} /></button></div>}
      <button className="gallery-zoom" type="button" aria-label="Open larger product image"><Maximize2 size={15} /></button>
    </div>
    <div className="gallery-rail" aria-label="Product image views">{media.map((item, index) => <button key={item.src} type="button" className={index === active ? "is-active" : ""} onClick={() => setActive(index)} aria-label={`View ${item.kind} image`}><Image src={item.src} alt="" fill sizes="88px" /></button>)}</div>
    {product.missingMedia.length > 0 && <p className="media-requirement"><span>MEDIA TO ADD</span> {product.missingMedia.join(" · ")} <small>Only confirmed brand photography is shown.</small></p>}
  </section>;
}
