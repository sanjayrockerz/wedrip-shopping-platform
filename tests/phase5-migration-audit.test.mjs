import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../supabase/migrations/", import.meta.url);
const names = (await readdir(root)).filter((name) => name.endsWith(".sql")).sort();
const phaseNames = names.filter((name) => /^202611250/.test(name)).sort();
const sources = await Promise.all(phaseNames.map(async (name) => [name, await readFile(new URL(name, root), "utf8")]));

test("Phase 1-5 migration inventory is chronological and complete", () => {
  assert.deepEqual(phaseNames.at(-1), "20261125002200_fulfilment_lint_cleanup.sql");
  assert.equal(new Set(phaseNames).size, phaseNames.length);
  assert.ok(phaseNames.includes("20261125001900_disable_legacy_order_rpc.sql"));
});

test("every Phase 1-5 SECURITY DEFINER function pins search_path", () => {
  for (const [name, sql] of sources) {
    if (/security\s+definer/i.test(sql)) assert.match(sql, /set\s+search_path\s*=/i, `${name} has an unpinned SECURITY DEFINER function`);
  }
});

test("legacy order bypass and sensitive financial writes are restricted", () => {
  const combined = sources.map(([, sql]) => sql).join("\n");
  assert.match(combined, /revoke execute on function public\.create_order_from_cart\(uuid, text\) from authenticated/);
  assert.match(combined, /revoke insert, update, delete on public\.monetary_events, public\.bank_verifications from authenticated/);
  assert.match(combined, /revoke all on function public\.get_admin_reporting_summary/);
});

test("SQL does not contain browser/service credentials", () => {
  const combined = sources.map(([, sql]) => sql).join("\n");
  assert.doesNotMatch(combined, /SUPABASE_SERVICE_ROLE_KEY|NEXT_PUBLIC_SUPABASE|BEGIN PRIVATE KEY/i);
});
