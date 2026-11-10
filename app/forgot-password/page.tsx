import Link from "next/link"; import { AuthForm } from "@/components/auth-form";
export default function ForgotPassword() { return <main className="account-page"><Link className="account-wordmark" href="/">WE<span>O</span>DRIP</Link><p className="eyebrow">ACCOUNT RECOVERY</p><h1>Reset<br /><i>access.</i></h1><AuthForm mode="forgot" /></main>; }
