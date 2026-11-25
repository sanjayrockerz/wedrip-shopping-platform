import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = new URL("../supabase/migrations/", import.meta.url);
const names = (await readdir(root)).filter((name) => /^(20261125000001_|20261125000[2-7]00_)/.test(name)).sort();

test("Phase 1 migrations are domain ordered and complete", () => {
  assert.deepEqual(names, [
    "20261125000001_auth_profile.sql",
    "20261125000200_customer_integrity.sql",
    "20261125000300_admin_permissions.sql",
    "20261125000400_catalog_pricing.sql",
    "20261125000500_discount_constraints.sql",
    "20261125000600_shippers.sql",
    "20261125000700_audit_rpc.sql",
  ]);
});

test("Phase 1 migrations keep privileged SQL server-side and bounded", async () => {
  const sql = await Promise.all(names.map((name) => readFile(join(fileURLToPath(root), name), "utf8")));
  const combined = sql.join("\n");
  assert.doesNotMatch(combined, /SUPABASE_SERVICE_ROLE_KEY|service_role/i);
  assert.match(combined, /security definer/i);
  assert.match(combined, /set search_path = public/i);
  assert.match(combined, /revoke all on function public\.record_audit_event/i);
  assert.match(combined, /create unique index if not exists promos_code_lower_idx/i);
  assert.match(combined, /create trigger shippers_one_default/i);
});
