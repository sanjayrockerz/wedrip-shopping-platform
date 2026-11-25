import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin-dashboard";
import { getServerAdmin } from "@/lib/auth-server";

const nav = [["Dashboard", "/admin"], ["Products", "/admin/products"], ["Inventory", "/admin/inventory"], ["Orders", "/admin/orders"], ["Payments", "/admin/payments"], ["Customers", "/admin/customers"], ["Discounts", "/admin/discounts"], ["Shippers", "/admin/shippers"], ["Designs", "/admin/designs"], ["Audit", "/admin/audit"], ["Notifications", "/admin/notifications"], ["Settings", "/admin/settings"]];

export default async function Admin() {
  if (!(await getServerAdmin(["SUPER_ADMIN", "ADMIN", "ORDER_MANAGER"]))) redirect("/login?returnTo=/admin");
  return <main className="admin-shell"><aside className="admin-sidebar"><Link className="admin-logo" href="/admin">WE<span>O</span>DRIP <small>OPERATIONS</small></Link><nav aria-label="Admin navigation">{nav.map(([label, href]) => <Link href={href} key={href} className={href === "/admin" ? "active" : ""}>{label}</Link>)}</nav><Link className="admin-store-link" href="/">← STOREFRONT</Link></aside><section className="admin-content"><header className="admin-header"><div><p className="admin-kicker">OVERVIEW / LIVE</p><h1>Dashboard</h1></div><span className="admin-status">LIVE DATA ONLY</span></header><AdminDashboard /><section className="admin-panel"><div className="admin-panel-head"><div><p className="admin-kicker">OPERATIONS</p><h2>Open workspaces</h2></div></div><div className="admin-table"><Link className="admin-row" href="/admin/orders"><span>Orders</span><span>Fulfillment state and payment</span><span>→</span></Link><Link className="admin-row" href="/admin/designs"><span>Designs</span><span>Proof and approval queue</span><span>→</span></Link><Link className="admin-row" href="/admin/inventory"><span>Inventory</span><span>Stock adjustments</span><span>→</span></Link></div></section></section></main>;
}
