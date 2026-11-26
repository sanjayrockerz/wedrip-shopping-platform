"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";

export function ShareButton({ title }: { title: string }) {
  const [message, setMessage] = useState("");
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title, url });
      else { await navigator.clipboard.writeText(url); setMessage("LINK COPIED"); }
    } catch { setMessage("SHARE UNAVAILABLE"); }
  };
  return <button type="button" onClick={() => void share()} aria-label={`Share ${title}`}><Share2 size={17} /> {message || "SHARE"}</button>;
}
