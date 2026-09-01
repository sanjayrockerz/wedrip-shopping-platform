"use client";

import { Heart, Share2 } from "lucide-react";

export function ProductActions({ slug, name }: { slug: string; name: string }) {
  const save = () => { const saved = JSON.parse(localStorage.getItem("wedrip_wishlist") ?? "[]"); const next = saved.includes(slug) ? saved.filter((item: string) => item !== slug) : [...saved, slug]; localStorage.setItem("wedrip_wishlist", JSON.stringify(next)); };
  const share = () => { if (navigator.share) navigator.share({ title: name, url: window.location.href }); else navigator.clipboard?.writeText(window.location.href); };
  return <div className="product-actions"><button type="button" onClick={save}><Heart size={16}/> SAVE</button><button type="button" onClick={share}><Share2 size={16}/> SHARE</button></div>;
}
