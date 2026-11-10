"use client";
import { Heart } from "lucide-react";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { supabaseBrowserClient } from "@/lib/supabase/client";

const supabase = supabaseBrowserClient;
export function WishlistButton({ productId }: { productId: string }) {
  const [saved, setSaved] = useState(false); const [message, setMessage] = useState("");
  const toggle = async () => { const session = (await supabase?.auth.getSession())?.data.session; if (!session) { window.location.href = `/login?returnTo=${encodeURIComponent(window.location.pathname)}`; return; } const response = await fetch("/api/account/wishlist", { method: saved ? "DELETE" : "POST", headers: { "content-type": "application/json", authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ product_id: productId }) }); if (response.ok) { setSaved(!saved); setMessage(saved ? "Removed from wishlist." : "Saved to wishlist."); } else setMessage("Wishlist could not be updated."); };
  return <div><button className="wishlist-button" type="button" onClick={toggle} aria-pressed={saved}><Heart size={17} fill={saved ? "currentColor" : "none"} /> {saved ? "SAVED" : "SAVE"}</button>{message && <span className="sr-only" role="status">{message}</span>}</div>;
}
