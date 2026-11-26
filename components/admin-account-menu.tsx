"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseBrowserClient } from "@/lib/supabase/client";

export function AdminAccountMenu({ email }: { email?: string | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const signOut = async () => {
    if (!supabaseBrowserClient) return;
    setBusy(true);
    await supabaseBrowserClient.auth.signOut();
    router.push("/admin/login");
  };
  return <div className="admin-account-menu"><span>{email ?? "Administrator"}</span><button type="button" onClick={() => void signOut()} disabled={busy}>{busy ? "SIGNING OUT" : "LOG OUT"}</button></div>;
}
