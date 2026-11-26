import { createClient } from "@supabase/supabase-js";
import { assertApprovedTarget, loadProjectEnv } from "./load-env.mjs";

const env = loadProjectEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) throw new Error("Missing public Supabase configuration.");
assertApprovedTarget(url);
const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const { data, error } = await client.from("products").select("id,slug").eq("is_active", true).limit(1);
if (error) {
  console.log(JSON.stringify({ connected: true, schemaReady: false, target_project: true, error: error.message }));
  process.exit(0);
}
console.log(JSON.stringify({ connected: true, schemaReady: true, target_project: true, activeProductCountSample: data?.length ?? 0 }));
