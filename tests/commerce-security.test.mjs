import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("..", import.meta.url);
async function source(path) { return readFile(new URL(path, root), "utf8"); }
test("design routes enforce ownership and private signed downloads", async () => {
  const upload = await source("app/api/orders/[id]/designs/route.ts");
  const download = await source("app/api/designs/[id]/download/route.ts");
  assert.match(upload, /eq\("user_id", auth\.user\.id\)/);
  assert.match(upload, /upsert:\s*false/);
  assert.match(download, /signedDesignUrl/);
  assert.doesNotMatch(download, /storage_path:\s*design/);
});
test("admin mutations use centralized authorization", async () => {
  for (const file of ["products/route.ts", "inventory/route.ts", "discounts/route.ts", "customers/route.ts", "audit/route.ts"]) {
    assert.match(await source(`app/api/admin/${file}`), /requireAdmin/);
  }
});
test("order transitions are explicit and inventory is non-negative", async () => {
  const route = await source("app/api/admin/orders/[id]/route.ts");
  const migration = await source("supabase/migrations/20260911_commerce_transaction.sql");
  assert.match(route, /Invalid transition/);
  assert.match(migration, /stock_quantity integer check \(stock_quantity is null or stock_quantity >= 0\)/);
  assert.match(migration, /for update of pv/);
});
