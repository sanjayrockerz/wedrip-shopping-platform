import fs from "node:fs";

export const TARGET_PROJECT_REF = "flbdevgqhfosbaaswwbf";
export const TARGET_HOST = `${TARGET_PROJECT_REF}.supabase.co`;

export function loadProjectEnv() {
  const env = {};
  for (const filename of [".env", ".env.local", ".env.development.local", ".env.test.local"]) {
    if (!fs.existsSync(filename)) continue;
    for (const line of fs.readFileSync(filename, "utf8").replace(/^\uFEFF/, "").split(/\r?\n/)) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match) env[match[1]] = match[2].replace(/^"|"$/g, "");
    }
  }
  for (const [key, value] of Object.entries(process.env)) if (value !== undefined) env[key] = value;
  return env;
}

export function assertApprovedTarget(url, { allowLocal = false } = {}) {
  let host;
  try { host = new URL(url).hostname; } catch { throw new Error("Invalid Supabase URL."); }
  if (allowLocal && ["localhost", "127.0.0.1"].includes(host)) return host;
  if (host !== TARGET_HOST) throw new Error(`Refusing operation against unapproved Supabase host: ${host}`);
  return host;
}
