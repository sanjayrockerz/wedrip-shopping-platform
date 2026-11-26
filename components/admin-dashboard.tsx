"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";
import { supabaseBrowserClient } from "@/lib/supabase/client";

type Period = { verified_amount_paise: number; units_sold: number; verified_order_count: number };
type Operations = { pending_payment_review_count: number; held_payment_count: number; processing_count: number; delivered_count: number; cancelled_count: number; failed_email_count: number; failed_whatsapp_count: number; pending_notification_count: number; finance_review_count: number; oldest_pending_payment_at: string | null; expired_checkout_count: number; confirmed_awaiting_shipper_count: number; assigned_awaiting_processing_count: number; stuck_processing_notification_count: number };
type Report = { time_zone: string; week_start: string; week_end: string; as_of: string; weekly: Period; lifetime: Period; operations: Operations };
type OperationalCard = [label: string, value: number, href: string];

export function AdminDashboard() {
  const [report, setReport] = useState<Report | null>(null);
  const [operational, setOperational] = useState<{ designs_awaiting_review: number; low_stock_variants: number } | null>(null);
  const [message, setMessage] = useState("Loading verified reporting data…");
  const [refreshing, setRefreshing] = useState(false);
  const load = async () => {
    setRefreshing(true);
    const token = (await supabaseBrowserClient?.auth.getSession())?.data.session?.access_token;
    const response = await fetch("/api/admin/dashboard", { headers: { authorization: `Bearer ${token}` }, cache: "no-store" });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) { setMessage(body.error ?? "Reporting data is unavailable."); setRefreshing(false); return; }
    setReport(body.report); setOperational(body.operational); setMessage(""); setRefreshing(false);
  };
  useEffect(() => { void load(); }, []);
  const number = (value: number) => new Intl.NumberFormat("en-IN").format(value);
  if (!report) return <section className="admin-panel dashboard-loading"><div className="admin-panel-head"><div><p className="admin-kicker">FINANCE / LIVE</p><h2>Business performance</h2></div><button type="button" onClick={() => void load()} disabled={refreshing}>{refreshing ? "Refreshing…" : "Try again"}</button></div><p className="admin-empty" role="status">{message}</p></section>;
  const op = report.operations;
  const operationalCards: OperationalCard[] = [["Payment reviews", op.pending_payment_review_count, "/admin/payments"], ["Held payments", op.held_payment_count, "/admin/payments"], ["Processing orders", op.processing_count, "/admin/orders"], ["Awaiting shipper", op.confirmed_awaiting_shipper_count, "/admin/orders"], ["Failed email", op.failed_email_count, "/admin/notifications"], ["Failed WhatsApp", op.failed_whatsapp_count, "/admin/notifications"], ["Finance review", op.finance_review_count, "/admin/orders"], ["Low stock variants", operational?.low_stock_variants ?? 0, "/admin/inventory"]];
  return <div className="dashboard-workspace"><section className="admin-panel dashboard-report"><div className="admin-panel-head dashboard-panel-head"><div><p className="admin-kicker">FINANCE / VERIFIED EVENTS</p><h2>Business performance</h2><small>Week: {new Date(report.week_start).toLocaleDateString("en-IN", { timeZone: report.time_zone })} – {new Date(report.week_end).toLocaleDateString("en-IN", { timeZone: report.time_zone })} · IST</small></div><button className="dashboard-refresh" type="button" onClick={() => void load()} disabled={refreshing}>{refreshing ? "Refreshing…" : "Refresh"}</button></div><div className="dashboard-financial"><article className="dashboard-primary-card"><span>Weekly verified sales</span><strong>{formatPrice(report.weekly.verified_amount_paise)}</strong><small>Collected and verified this week</small></article><article className="dashboard-primary-card"><span>Lifetime verified sales</span><strong>{formatPrice(report.lifetime.verified_amount_paise)}</strong><small>Collected and verified to date</small></article><article><span>Weekly units sold</span><strong>{number(report.weekly.units_sold)}</strong></article><article><span>Lifetime units sold</span><strong>{number(report.lifetime.units_sold)}</strong></article><article><span>Weekly verified orders</span><strong>{number(report.weekly.verified_order_count)}</strong></article><article><span>Lifetime verified orders</span><strong>{number(report.lifetime.verified_order_count)}</strong></article></div><p className="admin-report-asof">Verified bank-matched sales only · Last refreshed {new Date(report.as_of).toLocaleTimeString("en-IN", { timeZone: report.time_zone, hour: "2-digit", minute: "2-digit" })} IST</p></section><section className="admin-panel dashboard-attention"><div className="admin-panel-head"><div><p className="admin-kicker">OPERATIONS / MONITORING</p><h2>Needs attention</h2></div><span className="dashboard-attention-summary">{number(operationalCards.reduce((sum, [, value]) => sum + value, 0))} open signals</span></div><div className="dashboard-attention-grid">{operationalCards.map(([label, value, href]) => <Link className="dashboard-op-card" href={href} key={label}><span>{label}</span><strong>{number(value)}</strong><small>Open workspace →</small></Link>)}</div>{op.oldest_pending_payment_at && <p className="admin-report-asof">Oldest payment review: {new Date(op.oldest_pending_payment_at).toLocaleString("en-IN", { timeZone: report.time_zone })} IST</p>}</section></div>;
}
