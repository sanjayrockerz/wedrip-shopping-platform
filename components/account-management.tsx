"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { supabaseBrowserClient } from "@/lib/supabase/client";

type Address = { id: string; name: string; phone: string; address_line_1: string; address_line_2: string | null; landmark: string | null; city: string; state: string; postal_code: string; country: string; is_default: boolean };
type WishItem = { product_id: string; products: { slug: string; name: string; price_paise: number; primary_image_url: string; image_alt: string; is_active?: boolean } | null };
const emptyAddress = { name: "", phone: "", address_line_1: "", address_line_2: "", landmark: "", city: "", state: "", postal_code: "", country: "India", is_default: false };

async function call(path: string, options: RequestInit = {}) {
  const session = (await supabaseBrowserClient?.auth.getSession())?.data.session;
  if (!session) throw new Error("Please sign in first.");
  const response = await fetch(path, { ...options, headers: { "content-type": "application/json", authorization: `Bearer ${session.access_token}`, ...options.headers } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error ?? "Request failed.");
  return body;
}

export function AccountManagement({ kind }: { kind: "profile" | "addresses" | "wishlist" }) {
  const [form, setForm] = useState<Record<string, string | boolean | null>>({});
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [wishlist, setWishlist] = useState<WishItem[]>([]);
  const [state, setState] = useState("loading");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    try {
      if (kind === "profile") { const data = await call("/api/account/profile"); setForm(data.profile); }
      if (kind === "addresses") { const data = await call("/api/account/addresses"); setAddresses(data.addresses ?? []); }
      if (kind === "wishlist") { const data = await call("/api/account/wishlist"); setWishlist(data.items ?? []); }
      setState("ready");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not load data."); setState("error"); }
  };
  // The load is an external session/database synchronization, not derived render state.
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, [kind]);
  const set = (key: string, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setMessage("");
    try { await call(kind === "profile" ? "/api/account/profile" : editingId ? `/api/account/addresses/${editingId}` : "/api/account/addresses", { method: kind === "profile" ? "PUT" : editingId ? "PATCH" : "POST", body: JSON.stringify(form) }); setMessage("Saved."); setEditingId(null); setForm(kind === "addresses" ? emptyAddress : form); await load(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not save."); }
  };
  const removeAddress = async (id: string) => { try { await call(`/api/account/addresses/${id}`, { method: "DELETE" }); setAddresses((current) => current.filter((item) => item.id !== id)); setMessage("Address removed."); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not remove address."); } };
  const makeDefault = async (id: string) => { try { await call(`/api/account/addresses/${id}`, { method: "PATCH", body: JSON.stringify({ is_default: true }) }); await load(); setMessage("Default address updated."); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not update address."); } };
  if (state === "loading") return <p className="account-empty">LOADING ACCOUNT DATA…</p>;
  if (kind === "wishlist") return <div className="account-management"><p className="eyebrow">WISHLIST</p>{message && <p role="status">{message}</p>}{wishlist.length ? <div className="saved-addresses">{wishlist.map((item) => item.products ? <article className="saved-address" key={item.product_id}><img src={item.products.primary_image_url} alt={item.products.image_alt} /><strong>{item.products.name}</strong><p>{formatPrice(item.products.price_paise)}<br />{item.products.is_active === false ? "Currently unavailable" : "Available to view"}</p><div><Link href={`/products/${item.products.slug}`}>CHOOSE SIZE / ADD TO BAG →</Link><button type="button" onClick={async () => { await call("/api/account/wishlist", { method: "DELETE", body: JSON.stringify({ product_id: item.product_id }) }); setWishlist((current) => current.filter((entry) => entry.product_id !== item.product_id)); }}>REMOVE</button></div></article> : null)}</div> : <div className="account-empty"><h2>Nothing<br /><i>saved.</i></h2><p>Save products from their detail page to keep them synced to your account.</p></div>}</div>;
  const profileFields = [["first_name", "First name"], ["last_name", "Last name"], ["phone", "Phone"]];
  const addressFields = [["name", "Recipient name"], ["phone", "Contact number"], ["address_line_1", "House / street"], ["address_line_2", "Address line 2"], ["landmark", "Landmark"], ["city", "City"], ["state", "State"], ["postal_code", "PIN code"], ["country", "Country"]];
  return <div className="account-management"><form className="account-form" onSubmit={submit}>{(kind === "profile" ? profileFields : addressFields).map(([key, label]) => <label key={key}>{label}<input value={String(form[key] ?? "")} onChange={(event) => set(key, event.target.value)} required={kind === "profile" ? key !== "phone" : !["address_line_2", "landmark"].includes(key)} /></label>)}{kind === "addresses" && <label className="checkbox-line"><input type="checkbox" checked={Boolean(form.is_default)} onChange={(e) => set("is_default", e.target.checked)} /> Set as default shipping address</label>}<button type="submit">{editingId ? "UPDATE ADDRESS" : `SAVE ${kind.toUpperCase()}`} →</button>{message && <p role="status">{message}</p>}</form>{kind === "profile" && <p className="account-meta">Email and account identity are managed by Supabase Auth. To change them, use a provider verification flow.</p>}{kind === "addresses" && <div className="saved-addresses">{addresses.map((item) => <div className="saved-address" key={item.id}><strong>{item.name}</strong>{item.is_default && <small>DEFAULT</small>}<p>{item.address_line_1}{item.address_line_2 ? <><br />{item.address_line_2}</> : null}{item.landmark ? <><br />Near {item.landmark}</> : null}<br />{item.city}, {item.state} {item.postal_code}<br />{item.country}</p><div><button type="button" onClick={() => { setEditingId(item.id); setForm(item); }}>EDIT</button>{!item.is_default && <button type="button" onClick={() => void makeDefault(item.id)}>MAKE DEFAULT</button>}<button type="button" onClick={() => void removeAddress(item.id)}>DELETE</button></div></div>)}</div>}</div>;
}
