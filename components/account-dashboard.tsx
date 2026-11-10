"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient, type User } from "@supabase/supabase-js";
import { LogOut, ArrowRight } from "lucide-react";
import { supabaseBrowserClient } from "@/lib/supabase/client";
const supabase = supabaseBrowserClient;
const links = [["PROFILE", "/account/profile"], ["ORDERS", "/account/orders"], ["DESIGNS", "/account/designs"], ["ADDRESSES", "/account/addresses"], ["WISHLIST", "/account/wishlist"]];
export function AccountDashboard() { const [user, setUser] = useState<User | null>(null); useEffect(() => { supabase?.auth.getUser().then(({ data }) => setUser(data.user)); }, []); const logout = async () => { await supabase?.auth.signOut(); window.location.href = "/"; }; return <div className="account-dashboard"><div className="account-identity"><span className="eyebrow">SIGNED IN AS</span><h2>{user?.user_metadata?.full_name ?? user?.email ?? "Customer"}</h2><p>{user?.email ?? "Your Supabase customer account"}</p></div><nav className="account-nav" aria-label="Account navigation">{links.map(([label, href]) => <Link href={href} key={href}><span>{label}</span><ArrowRight size={17} /></Link>)}<button onClick={logout}><span>LOGOUT</span><LogOut size={17} /></button></nav></div>; }
