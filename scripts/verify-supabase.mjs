import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = {};
for (const line of fs.readFileSync(".env", "utf8").split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match) env[match[1]] = match[2].replace(/^"|"$/g, "");
}
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) throw new Error("Missing public Supabase configuration.");
const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const { data, error } = await client.from("products").select("id,slug").eq("is_active", true).limit(1);
if (error) {
  console.log(JSON.stringify({ connected: true, schemaReady: false, url, error: error.message }));
  process.exit(0);
}
console.log(JSON.stringify({ connected: true, schemaReady: true, url, activeProductCountSample: data?.length ?? 0 }));
