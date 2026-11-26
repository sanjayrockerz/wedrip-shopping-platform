import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("payment-claim RPC enforces checkout expiry and evidence ownership", async () => {
  const sql = await readFile("supabase/migrations/20261125002300_payment_claim_security.sql", "utf8");
  assert.match(sql, /expires_at\s*<=\s*now\(\)/i);
  assert.match(sql, /p_storage_key\s+is\s+null\s+or\s+p_storage_key\s+not\s+like\s+v_user::text\s*\|\|\s+'\/'\s*\|\|\s*p_checkout_id::text/i);
  assert.match(sql, /image\/jpeg.*image\/png.*image\/webp/is);
  assert.match(sql, /p_size_bytes\s*>\s*10\s*\*\s*1024\s*\*\s*1024/i);
});
