"use client";

/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { supabaseBrowserClient } from "@/lib/supabase/client";

export function AdminNotifications() {
  const [rows, setRows] = useState<any[]>([]);
  const [message, setMessage] = useState("Loading notifications…");
  const load = async () => {
    const token = (await supabaseBrowserClient?.auth.getSession())?.data.session?.access_token;
    const response = await fetch("/api/admin/notifications", { headers: { authorization: `Bearer ${token}` }, cache: "no-store" });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return setMessage(body.error ?? "Could not load notifications.");
    setRows(body.notifications ?? []); setMessage("");
  };
  useEffect(() => { void load(); }, []);
  const retry = async (id: string) => {
    const token = (await supabaseBrowserClient?.auth.getSession())?.data.session?.access_token;
    const response = await fetch("/api/admin/notifications", { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify({ id }) });
    if (!response.ok) setMessage((await response.json().catch(() => ({}))).error ?? "Retry could not be scheduled."); else { setMessage("Retry scheduled."); void load(); }
  };
  return <section className="admin-panel"><div className="admin-panel-head"><div><p className="admin-kicker">OUTBOX / DELIVERY</p><h2>Notification events</h2></div></div><p className="admin-empty">External email and WhatsApp delivery is disabled. Events remain queued for approved provider activation.</p>{message && <p role="status">{message}</p>}<div className="admin-table">{rows.map((row) => <div className="admin-row" key={row.id}><span><strong>{row.business_event_id}</strong><br />{row.channel} · {row.recipient_scope ?? "SYSTEM"}</span><span>{row.status}<br />Attempts: {row.attempt_count}</span><span>{row.failure_reason ?? row.provider_message_id ?? "—"}</span>{["FAILED", "TERMINALLY_FAILED"].includes(row.status) && <button type="button" onClick={() => void retry(row.id)}>RETRY</button>}</div>)}</div></section>;
}
