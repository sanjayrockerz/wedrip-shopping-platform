"use client";
import { Share2 } from "lucide-react";
import { useState } from "react";

export function ShareButton({ title }: { title: string }) { const [message, setMessage] = useState(""); const share = async () => { const url = window.location.href; if (navigator.share) { await navigator.share({ title, url }).catch(() => undefined); } else { await navigator.clipboard.writeText(url); setMessage("LINK COPIED"); } }; return <button type="button" onClick={share} aria-label={`Share ${title}`}><Share2 size={17} /> {message || "SHARE"}</button>; }
