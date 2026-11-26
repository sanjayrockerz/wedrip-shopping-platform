import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin-dashboard";
import { AdminSidebar } from "@/components/admin-sidebar";
import { getServerAdmin } from "@/lib/auth-server";

export default async function Admin() {
  const auth = await getServerAdmin(["SUPER_ADMIN", "ADMIN"]);
  if (!auth) redirect("/admin/login?returnTo=/admin");
  const today = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" }).format(new Date());
  return <main className="admin-shell"><AdminSidebar email={auth.user.email} /><section className="admin-content"><header className="admin-header"><div><p className="admin-kicker">OVERVIEW / LIVE DATA</p><h1>Overview</h1><p className="admin-header-context">Verified commerce performance · {today}</p></div><span className="admin-status">LIVE DATA ONLY</span></header><AdminDashboard /><section className="admin-panel admin-workspaces"><div className="admin-panel-head"><div><p className="admin-kicker">QUICK ACCESS</p><h2>Open workspaces</h2></div></div><div className="admin-table"><Link className="admin-row" href="/admin/orders"><span>Orders</span><span>Fulfilment state and payment</span><span>→</span></Link><Link className="admin-row" href="/admin/designs"><span>Designs</span><span>Proof and approval queue</span><span>→</span></Link><Link className="admin-row" href="/admin/inventory"><span>Inventory</span><span>Stock adjustments</span><span>→</span></Link></div></section></section></main>;
}
