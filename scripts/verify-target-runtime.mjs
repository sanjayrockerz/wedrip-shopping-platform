import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = {};
for (const line of fs.readFileSync(".env.local", "utf8").replace(/^\uFEFF/, "").split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match) env[match[1]] = match[2];
}
const host = new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname;
const publicClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } });
const privateClient = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
const publicResult = await publicClient.from("products").select("id").limit(1);
const privateResult = await privateClient.from("admin_users").select("user_id").limit(1);
console.log(JSON.stringify({ target_host: host, public_query_ok: !publicResult.error, private_query_ok: !privateResult.error, public_error: publicResult.error?.message ?? null, private_error: privateResult.error?.message ?? null, payment_enabled: env.WEDRIP_PAYMENT_ENABLED === "true", fulfilment_notifications_enabled: env.WEDRIP_FULFILMENT_NOTIFICATIONS_ENABLED === "true" }));
