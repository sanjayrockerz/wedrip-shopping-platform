import Link from "next/link";
import { CheckoutForm } from "@/components/checkout-form";
export default function CheckoutPage() { return <main className="account-page"><Link className="account-wordmark" href="/bag">← BAG</Link><p className="eyebrow">CHECKOUT</p><h1>Almost<br /><i>there.</i></h1><CheckoutForm /></main>; }
