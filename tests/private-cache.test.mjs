import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const privateRoutes = [
  "app/api/account/addresses/route.ts",
  "app/api/account/wishlist/route.ts",
  "app/api/orders/route.ts",
  "app/api/orders/[id]/route.ts",
  "app/api/admin/customers/[id]/route.ts",
  "app/api/admin/designs/route.ts",
  "app/api/admin/orders/route.ts",
];

test("private account and admin reads opt out of shared caching", async () => {
  for (const file of privateRoutes) {
    const source = await readFile(file, "utf8");
    assert.match(source, /Cache-Control/);
    assert.match(source, /private, no-store/);
  }
});
