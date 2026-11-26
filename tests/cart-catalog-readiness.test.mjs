import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("published catalog products seed checkout-backed variants", async () => {
  const sql = await readFile(new URL("../supabase/migrations/20261126002900_seed_catalog_variants.sql", import.meta.url), "utf8");
  assert.match(sql, /insert into public\.product_variants/i);
  assert.match(sql, /cross join.*S.*M.*L.*XL/is);
  assert.match(sql, /stock_quantity, active/i);
});

test("authenticated customers cannot silently add a local-only fallback item", async () => {
  const source = await readFile(new URL("../components/bag-actions.tsx", import.meta.url), "utf8");
  assert.match(source, /session && variant\.id\.startsWith\("local-"\)/);
  assert.match(source, /not configured for account checkout/i);
});
