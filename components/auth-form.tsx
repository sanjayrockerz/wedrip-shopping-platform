"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabaseBrowserClient } from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";

export function AuthForm({ mode, returnTo = "/" }: { mode: "login" | "signup" | "forgot"; returnTo?: string }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true); setMessage("");
    if (!supabaseBrowserClient) {
      setMessage("Account service is not configured yet."); setBusy(false); return;
    }

    const result = mode === "signup"
      ? await supabaseBrowserClient.auth.signUp({ email, password, options: { data: { first_name: firstName, last_name: lastName, full_name: `${firstName} ${lastName}`.trim() }, emailRedirectTo: `${window.location.origin}/account` } })
      : mode === "forgot"
        ? await supabaseBrowserClient.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` })
        : await supabaseBrowserClient.auth.signInWithPassword({ email, password });

    setBusy(false);
    if (result.error) {
      setMessage(result.error.message.replace("Invalid login credentials", "Email or password is incorrect."));
      return;
    }

    if (mode === "forgot") { setMessage("If that email exists, a reset link is on its way."); return; }

    // Supabase returns a session immediately when email confirmations are disabled
    // (the local/test-friendly configuration). In that mode, continue through the
    // same onboarding path as a normal login instead of incorrectly asking the
    // customer to check an inbox.
    const session = "session" in result.data ? (result.data as { session: Session | null }).session : null;
    const immediateToken = session?.access_token;
    const token = immediateToken ?? (await supabaseBrowserClient.auth.getSession()).data.session?.access_token;
    if (mode === "signup" && !token) {
      setMessage("Check your inbox to verify your email, then sign in here.");
      return;
    }

    const guest = localStorage.getItem("wedrip-bag");
    if (token && guest) {
      try {
        const items = JSON.parse(guest).map((item: Record<string, unknown>) => item.variant_id?.toString().startsWith("local-") ? { ...item, variant_id: undefined } : item);
        const response = await fetch("/api/cart/merge", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${token}` }, body: JSON.stringify({ items }) });
        if (response.ok) localStorage.removeItem("wedrip-bag");
        else setMessage("Signed in, but your bag could not be synced. It is still saved on this device.");
      } catch { setMessage("Signed in, but your bag could not be synced. It is still saved on this device."); }
    }
    const safeReturnTo = returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/";
    window.location.assign(safeReturnTo);
  };

  return <form className="auth-form" onSubmit={submit}>{mode === "signup" && <><label>First name<input required value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" /></label><label>Last name<input required value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" /></label></>}<label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>{mode !== "forgot" && <label>Password<input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} /></label>}<button type="submit" disabled={busy}>{busy ? "PLEASE WAIT" : mode === "login" ? "SIGN IN" : mode === "signup" ? "CREATE ACCOUNT" : "SEND RESET LINK"}</button>{message && <p role="status">{message}</p>}{mode === "login" && <Link href="/forgot-password">FORGOT PASSWORD?</Link>}{mode !== "login" && <Link href="/login">ALREADY HAVE AN ACCOUNT? SIGN IN</Link>}</form>;
}
