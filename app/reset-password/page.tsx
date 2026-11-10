"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { supabaseBrowserClient } from "@/lib/supabase/client";
const supabase = supabaseBrowserClient;
export default function ResetPassword() { const [password, setPassword] = useState(""); const [message, setMessage] = useState(""); const submit = async (event: React.FormEvent) => { event.preventDefault(); if (!supabase) return setMessage("Account service is not configured yet."); const { error } = await supabase.auth.updateUser({ password }); setMessage(error?.message ?? "Password updated. You can sign in now."); }; return <main className="account-page"><Link className="account-wordmark" href="/">WE<span>O</span>DRIP</Link><p className="eyebrow">ACCOUNT RECOVERY</p><h1>New<br /><i>password.</i></h1><form className="auth-form" onSubmit={submit}><label>New password<input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} /></label><button type="submit">UPDATE PASSWORD</button>{message && <p role="status">{message}</p>}</form></main>; }
