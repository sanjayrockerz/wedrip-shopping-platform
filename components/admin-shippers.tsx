"use client";
import { useEffect, useState } from "react";
import { supabaseBrowserClient } from "@/lib/supabase/client";

type Shipper = { id: string; name: string; company: string | null; email: string | null; whatsapp_number: string | null; contact_status: string; is_active: boolean; is_default: boolean };
const empty = { name: "", company: "", email: "", whatsapp_number: "", contact_status: "UNVERIFIED", is_active: true, is_default: false };

export function AdminShippers() {
  const [rows, setRows] = useState<Shipper[]>([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [message, setMessage] = useState("Loading shippers…");
  const load = async () => {
    const token = (await supabaseBrowserClient?.auth.getSession())?.data.session?.access_token;
    const response = await fetch("/api/admin/shippers", { headers: { authorization: `Bearer ${token}` } });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return setMessage(body.error ?? "Shippers could not be loaded.");
    setRows(body.shippers ?? []); setMessage("");
  };
  // The load is an external session/database synchronization, not derived render state.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, []);
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setMessage("");
    const token = (await supabaseBrowserClient?.auth.getSession())?.data.session?.access_token;
    const response = await fetch(editing ? `/api/admin/shippers/${editing}` : "/api/admin/shippers", { method: editing ? "PATCH" : "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify(form) });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return setMessage(body.error ?? "Shipper could not be saved.");
    setForm(empty); setEditing(null); setMessage("Saved."); await load();
  };
  return <section className="admin-panel"><div className="admin-panel-head"><div><p className="admin-kicker">OPERATIONS / SHIPPERS</p><h2>Fulfilment contacts</h2></div></div><form className="account-form" onSubmit={save}><label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label><label>Company<input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></label><label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label><label>WhatsApp number<input value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} /></label><label>Status<select value={form.contact_status} onChange={(e) => setForm({ ...form, contact_status: e.target.value })}><option>UNVERIFIED</option><option>PENDING_TEST</option><option>VERIFIED</option><option>FAILED</option></select></label><label className="checkbox-line"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active</label><label className="checkbox-line"><input type="checkbox" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} /> Default shipper</label><button type="submit">{editing ? "SAVE SHIPPER" : "ADD SHIPPER"}</button>{message && <p role="status">{message}</p>}</form><div className="admin-table">{rows.map((row) => <div className="admin-row" key={row.id}><span><strong>{row.name}</strong><br />{row.company ?? ""}</span><span>{row.email ?? "No email"}<br />{row.whatsapp_number ?? "No WhatsApp"}</span><span>{row.contact_status} · {row.is_active ? "ACTIVE" : "INACTIVE"}{row.is_default ? " · DEFAULT" : ""}</span><button type="button" onClick={() => { setEditing(row.id); setForm({ name: row.name, company: row.company ?? "", email: row.email ?? "", whatsapp_number: row.whatsapp_number ?? "", contact_status: row.contact_status, is_active: row.is_active, is_default: row.is_default }); }}>EDIT</button></div>)}</div></section>;
}
