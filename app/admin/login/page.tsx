import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ returnTo?: string }> }) {
  const { returnTo } = await searchParams;
  const safeReturnTo = returnTo?.startsWith("/admin") && !returnTo.startsWith("//") ? returnTo : "/admin";
  return <main className="account-page"><Link className="account-wordmark" href="/">WE<span>O</span>DRIP</Link><p className="eyebrow">STAFF ACCESS</p><h1>Admin<br /><i>sign in.</i></h1><AuthForm mode="login" returnTo={safeReturnTo} /><p className="account-switch">Customer account? <Link href="/login">Sign in here</Link></p></main>;
}
