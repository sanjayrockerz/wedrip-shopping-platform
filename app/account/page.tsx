import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountDashboard } from "@/components/account-dashboard";
import { getServerUser } from "@/lib/auth-server";
export default async function Account() { if (!(await getServerUser())) redirect("/login?returnTo=/account"); return <main className="account-page account-home"><Link className="account-wordmark" href="/">WE<span>O</span>DRIP</Link><p className="eyebrow">CUSTOMER ACCOUNT</p><h1>Your<br /><i>account.</i></h1><AccountDashboard /></main>; }
