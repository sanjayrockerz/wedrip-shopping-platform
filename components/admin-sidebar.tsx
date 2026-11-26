"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AdminAccountMenu } from "@/components/admin-account-menu";

const groups = [
  { label: "Overview", links: [["Dashboard", "/admin"]] },
  { label: "Commerce", links: [["Orders", "/admin/orders"], ["Payments", "/admin/payments"], ["Products", "/admin/products"], ["Inventory", "/admin/inventory"], ["Discounts", "/admin/discounts"]] },
  { label: "Operations", links: [["Customers", "/admin/customers"], ["Shippers", "/admin/shippers"], ["Notifications", "/admin/notifications"]] },
  { label: "Content", links: [["Designs", "/admin/designs"]] },
  { label: "System", links: [["Audit logs", "/admin/audit-logs"], ["Settings", "/admin/settings"]] },
];

export function AdminSidebar({ email }: { email?: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return <>
    <button className="admin-mobile-menu" type="button" aria-expanded={open} aria-controls="admin-navigation" onClick={() => setOpen((current) => !current)}>{open ? "Close menu" : "Menu"}</button>
    <aside className={`admin-sidebar ${open ? "is-open" : ""}`} id="admin-navigation">
      <div className="admin-sidebar-top"><Link className="admin-logo" href="/admin" onClick={() => setOpen(false)} aria-label="WeDrip admin dashboard">WEDRIP<span>OPERATIONS</span></Link><AdminAccountMenu email={email} /></div>
      <nav aria-label="Admin navigation">{groups.map((group) => <div className="admin-nav-group" key={group.label}><p>{group.label}</p>{group.links.map(([label, href]) => <Link href={href} key={href} className={pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`)) ? "active" : ""} onClick={() => setOpen(false)}>{label}</Link>)}</div>)}</nav>
      <Link className="admin-store-link" href="/" onClick={() => setOpen(false)}>← Storefront</Link>
    </aside>
  </>;
}
