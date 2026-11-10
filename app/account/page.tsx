import Link from "next/link";
import { AccountDashboard } from "@/components/account-dashboard";
export default function Account() { return <main className="account-page account-home"><Link className="account-wordmark" href="/">WE<span>O</span>DRIP</Link><p className="eyebrow">CUSTOMER ACCOUNT</p><h1>Your<br /><i>account.</i></h1><AccountDashboard /></main>; }
