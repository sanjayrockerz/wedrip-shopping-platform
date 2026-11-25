"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabaseBrowserClient } from "@/lib/supabase/client";

type Variant = { id: string; product_id: string; sku: string | null; size: string; color: string | null; price_paise: number | null; stock_quantity: number | null; active: boolean };
type Product = { id: string; name: string; slug: string; product_type: string; short_description: string | null; description: string | null; price_paise: number; primary_image_url: string; image_alt: string; visual_tone: string | null; material: string | null; gsm: number | null; is_featured: boolean; display_order: number; is_active: boolean; product_variants?: Variant[] };
const empty: Partial<Product> = { name: "", slug: "", product_type: "", short_description: "", description: "", price_paise: 0, primary_image_url: "", image_alt: "", is_active: true };

async function token() { return (await supabaseBrowserClient?.auth.getSession())?.data.session?.access_token; }

export function AdminProductManager({ id, create = false }: { id?: string; create?: boolean }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<Partial<Product>>(empty);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("Loading products…");
  const load = async () => {
    const access = await token();
    const response = await fetch(id ? `/api/admin/products/${id}` : "/api/admin/products", { headers: { authorization: `Bearer ${access}` } });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) { setMessage(body.error ?? "Products could not be loaded."); return; }
    if (id) setForm(body.product); else setProducts(body.products ?? []);
    setMessage("");
  };
  // The load is an external session/database synchronization, not derived render state.
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, [id]);
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const access = await token();
    const response = await fetch(id ? `/api/admin/products/${id}` : "/api/admin/products", { method: id ? "PATCH" : "POST", headers: { authorization: `Bearer ${access}`, "content-type": "application/json" }, body: JSON.stringify(form) });
    const body = await response.json().catch(() => ({}));
    setMessage(response.ok ? "Saved." : body.error ?? "Product could not be saved.");
    if (response.ok && !id) window.location.assign(`/admin/products/${body.product.id}`);
  };
  const saveVariant = async (variant: Variant, price: string, active: boolean) => {
    const access = await token();
    const response = await fetch("/api/admin/variants", { method: "POST", headers: { authorization: `Bearer ${access}`, "content-type": "application/json" }, body: JSON.stringify({ id: variant.id, product_id: variant.product_id, size: variant.size, color: variant.color, sku: variant.sku, price_paise: Number(price), stock_quantity: variant.stock_quantity, active }) });
    const body = await response.json().catch(() => ({}));
    setMessage(response.ok ? "Variant price saved and audited." : body.error ?? "Variant could not be saved.");
    if (response.ok) void load();
  };
  const visible = useMemo(() => products.filter((product) => `${product.name} ${product.slug} ${product.product_type}`.toLowerCase().includes(query.toLowerCase())), [products, query]);
  if (id || create) return <section className="admin-panel"><form className="account-form" onSubmit={save}>{Object.entries(form).filter(([key]) => !["id", "created_at", "updated_at", "product_variants"].includes(key)).map(([key, value]) => <label key={key}>{key.replaceAll("_", " ")}<input type={key === "price_paise" || key === "gsm" || key === "display_order" ? "number" : key === "is_active" || key === "is_featured" ? "checkbox" : "text"} checked={key === "is_active" || key === "is_featured" ? Boolean(value) : undefined} value={key === "is_active" || key === "is_featured" ? undefined : String(value ?? "")} onChange={(event) => setForm({ ...form, [key]: key === "is_active" || key === "is_featured" ? event.target.checked : ["price_paise", "gsm", "display_order"].includes(key) ? Number(event.target.value) : event.target.value })} /></label>)}<button type="submit">SAVE PRODUCT</button>{message && <p role="status">{message}</p>}</form>{id && <div className="admin-table">{(form.product_variants ?? []).map((variant) => <div className="admin-row" key={variant.id}><span><strong>{variant.sku ?? "No SKU"}</strong><br />SIZE {variant.size}</span><span><input aria-label={`Price for size ${variant.size}`} type="number" min="1" defaultValue={variant.price_paise ?? form.price_paise ?? 0} /><small>{variant.stock_quantity === null ? "STOCK NOT CONFIGURED" : `${variant.stock_quantity} available`}</small></span><span><label className="checkbox-line"><input type="checkbox" defaultChecked={variant.active} /> Active</label><button type="button" onClick={(event) => { const row = event.currentTarget.closest(".admin-row"); const input = row?.querySelector("input[type=number]") as HTMLInputElement | null; const checkbox = row?.querySelector("input[type=checkbox]") as HTMLInputElement | null; void saveVariant(variant, input?.value ?? String(variant.price_paise ?? 0), checkbox?.checked ?? variant.active); }}>SAVE VARIANT</button></span></div>)}</div>}</section>;
  return <section className="admin-panel"><div className="admin-panel-head"><div><p className="admin-kicker">STORE / CATALOG</p><h2>Products</h2></div><Link href="/admin/products/new">NEW PRODUCT →</Link></div><input placeholder="Search products" value={query} onChange={(event) => setQuery(event.target.value)} />{message && <p className="admin-empty">{message}</p>}<div className="admin-table">{visible.map((product) => <Link className="admin-row" href={`/admin/products/${product.id}`} key={product.id}><span>{product.name}</span><span>{product.product_type}</span><span>{product.price_paise}</span><span>{product.is_active ? "ACTIVE" : "INACTIVE"}</span></Link>)}</div></section>;
}
