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
import { AdminSidebar } from "@/components/admin-sidebar";
import { getServerAdmin } from "@/lib/auth-server";
import { ADMIN_ROLE_SETS } from "@/lib/admin";

const liveSections = new Set(["inventory", "customers", "audit"]);
const rolesForSection = (key: string) => key === "products" || key === "inventory" || key === "designs" ? ADMIN_ROLE_SETS.catalog : key === "orders" || key === "notifications" ? ADMIN_ROLE_SETS.operations : key === "payments" || key === "customers" || key === "discounts" || key === "shippers" || key === "audit-logs" || key === "settings" ? ADMIN_ROLE_SETS.finance : ADMIN_ROLE_SETS.dashboard;

export default async function AdminSection({ params }: { params: Promise<{ section: string[] }> }) {
  const { section } = await params;
  const title = section.join(" / ").replaceAll("-", " ");
  const key = section[0];
  const auth = await getServerAdmin([...rolesForSection(key)]);
  if (!auth) redirect(`/admin/login?returnTo=${encodeURIComponent(`/admin/${section.join("/")}`)}`);
  const content = key === "payments" ? <AdminPayments /> : key === "notifications" ? <AdminNotifications /> : key === "products" ? <AdminProductManager id={section[1] === "new" ? undefined : section[1]} create={section[1] === "new"} /> : key === "orders" ? <AdminOrders orderId={section[1]} /> : key === "designs" && section[1] ? <AdminDesignDetail id={section[1]} /> : key === "designs" ? <AdminDesigns /> : key === "discounts" && section[1] ? <AdminDiscountManager id={section[1] === "new" ? undefined : section[1]} create={section[1] === "new"} /> : key === "discounts" ? <AdminOperations section={key} /> : key === "shippers" ? <AdminShippers /> : key === "customers" && section[1] ? <AdminCustomerDetail id={section[1]} /> : liveSections.has(key) || key === "audit-logs" ? <AdminOperations section={key === "audit-logs" ? "audit" : key} /> : <section className="admin-panel admin-empty-state"><h2>{title} is ready for live data.</h2><p>This operational view is intentionally empty until persisted records are configured.</p><Link href="/admin">Back to admin</Link></section>;
  return <main className="admin-shell"><AdminSidebar email={auth.user.email} /><section className="admin-content"><header className="admin-header"><div><p className="admin-kicker">ADMIN / OPERATIONS</p><h1>{title}</h1></div><span className="admin-status">SERVER AUTHORIZED</span></header>{content}</section></main>;
}
