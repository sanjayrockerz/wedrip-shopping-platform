import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminCustomerDetail } from "@/components/admin-customer-detail";
import { AdminDesignDetail } from "@/components/admin-design-detail";
import { AdminDesigns } from "@/components/admin-designs";
import { AdminDiscountManager } from "@/components/admin-discount-manager";
import { AdminOperations } from "@/components/admin-operations";
import { AdminOrders } from "@/components/admin-orders";
import { AdminProductManager } from "@/components/admin-product-manager";
import { AdminShippers } from "@/components/admin-shippers";
import { AdminPayments } from "@/components/admin-payments";
import { AdminNotifications } from "@/components/admin-notifications";
import { getServerAdmin } from "@/lib/auth-server";
const liveSections = new Set(["inventory", "customers", "audit"]);
const nav = [["Dashboard", "/admin"], ["Products", "/admin/products"], ["Inventory", "/admin/inventory"], ["Orders", "/admin/orders"], ["Payments", "/admin/payments"], ["Customers", "/admin/customers"], ["Discounts", "/admin/discounts"], ["Shippers", "/admin/shippers"], ["Designs", "/admin/designs"], ["Audit", "/admin/audit"], ["Notifications", "/admin/notifications"], ["Settings", "/admin/settings"]];
export default async function AdminSection({ params }: { params: Promise<{ section: string[] }> }) { if (!(await getServerAdmin(["SUPER_ADMIN", "ADMIN", "ORDER_MANAGER"]))) redirect("/login?returnTo=/admin"); const { section } = await params; const title = section.join(" / ").replaceAll("-", " "); const key = section[0]; const content = key === "payments" ? <AdminPayments /> : key === "notifications" ? <AdminNotifications /> : key === "products" ? <AdminProductManager id={section[1] === "new" ? undefined : section[1]} create={section[1] === "new"} /> : key === "orders" ? <AdminOrders orderId={section[1]} /> : key === "designs" && section[1] ? <AdminDesignDetail id={section[1]} /> : key === "designs" ? <AdminDesigns /> : key === "discounts" && section[1] ? <AdminDiscountManager id={section[1] === "new" ? undefined : section[1]} create={section[1] === "new"} /> : key === "discounts" ? <AdminOperations section={key} /> : key === "shippers" ? <AdminShippers /> : key === "customers" && section[1] ? <AdminCustomerDetail id={section[1]} /> : liveSections.has(key) ? <AdminOperations section={key} /> : <section className="admin-panel admin-empty-state"><h2>{title} is ready for live data.</h2><p>This operational view is intentionally empty until persisted records are configured.</p><Link href="/admin">BACK TO DASHBOARD</Link></section>;
 return <main className="admin-shell"><aside className="admin-sidebar"><Link className="admin-logo" href="/admin">WE<span>O</span>DRIP <small>OPERATIONS</small></Link><nav aria-label="Admin navigation">{nav.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}</nav><Link className="admin-store-link" href="/">← STOREFRONT</Link></aside><section className="admin-content"><header className="admin-header"><div><p className="admin-kicker">ADMIN / OPERATIONS</p><h1>{title}</h1></div><span className="admin-status">SERVER AUTHORIZED</span></header>{content}</section></main>; }
