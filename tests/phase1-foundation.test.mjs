import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test, { after } from "node:test";
import { createServer } from "vite";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const vite = await createServer({ appType: "custom", configFile: false, root, resolve: { alias: { "@": root }, conditions: ["development", "browser"] }, server: { middlewareMode: true, hmr: false } });
const { discountInput, shipperInput } = await vite.ssrLoadModule("/lib/admin-validation.ts");
after(() => vite.close());

test("percentage discounts enforce the Phase 1 business rule", () => {
  assert.equal(discountInput.safeParse({ code: "WEDRIP10", discount_type: "PERCENTAGE", discount_value: 10 }).success, true);
  assert.equal(discountInput.safeParse({ code: "bad", discount_type: "PERCENTAGE", discount_value: 10 }).success, false);
  assert.equal(discountInput.safeParse({ code: "WEDRIP100", discount_type: "PERCENTAGE", discount_value: 100 }).success, false);
  assert.equal(discountInput.safeParse({ code: "WEDRIP10", discount_type: "FIXED", discount_value: 10 }).success, false);
});

test("shipper input is bounded and supports verified readiness states", () => {
  assert.equal(shipperInput.safeParse({ name: "Primary Shipper", email: "ops@example.com", contact_status: "VERIFIED", is_active: true, is_default: true }).success, true);
  assert.equal(shipperInput.safeParse({ name: "x" }).success, false);
});

test("protected page and privileged secret seams exist", async () => {
  const adminPage = await readFile(`${root}/app/admin/page.tsx`, "utf8");
  const accountPage = await readFile(`${root}/app/account/page.tsx`, "utf8");
  const adminSecret = await readFile(`${root}/lib/supabase/admin.ts`, "utf8");
  assert.match(adminPage, /getServerAdmin/);
  assert.match(accountPage, /getServerUser/);
  assert.match(adminSecret, /server-only/);
});
