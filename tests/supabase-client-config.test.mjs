import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const clientModules = [
  "components/admin-customer-detail.tsx",
  "components/admin-design-detail.tsx",
  "components/admin-designs.tsx",
  "components/admin-discount-manager.tsx",
  "components/admin-operations.tsx",
];

test("client Supabase modules use the canonical publishable-key browser client", async () => {
  const sources = await Promise.all(clientModules.map((file) => readFile(file, "utf8")));
  for (const source of sources) {
    assert.match(source, /supabaseBrowserClient/);
    assert.doesNotMatch(source, /NEXT_PUBLIC_SUPABASE_ANON_KEY/);
  }
});

test("the environment template declares both public and server Supabase configuration", async () => {
  const source = await readFile(".env.example", "utf8");
  for (const name of [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_URL",
    "SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_SECRET_KEY",
  ]) assert.match(source, new RegExp(`^${name}=`, "m"));
});
