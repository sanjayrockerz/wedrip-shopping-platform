"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowserClient } from "@/lib/supabase/client";

export function WishlistButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false); const [message, setMessage] = useState("");
  useEffect(() => { (async () => { const session = (await supabaseBrowserClient?.auth.getSession())?.data.session; if (!session) return; const response = await fetch("/api/account/wishlist", { headers: { authorization: `Bearer ${session.access_token}` } }); if (response.ok) { const body = await response.json(); setSaved((body.items ?? []).some((item: { product_id: string }) => item.product_id === productId)); } })(); }, [productId]);
  const toggle = async () => { const session = (await supabaseBrowserClient?.auth.getSession())?.data.session; if (!session) { router.push(`/login?returnTo=${encodeURIComponent(window.location.pathname)}`); return; } const response = await fetch("/api/account/wishlist", { method: saved ? "DELETE" : "POST", headers: { "content-type": "application/json", authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ product_id: productId }) }); if (response.ok) { setSaved(!saved); setMessage(saved ? "Removed from wishlist." : "Saved to wishlist."); } else setMessage("Wishlist could not be updated."); };
  return <div><button className="wishlist-button" type="button" onClick={() => void toggle()} aria-pressed={saved}><Heart size={17} fill={saved ? "currentColor" : "none"} /> {saved ? "SAVED" : "SAVE"}</button>{message && <span className="sr-only" role="status">{message}</span>}</div>;
}
