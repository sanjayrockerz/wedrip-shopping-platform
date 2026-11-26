import assert from "node:assert/strict";
import test, { after } from "node:test";
import { createServer } from "vite";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const vite = await createServer({ appType: "custom", configFile: false, root, resolve: { alias: { "@": root } }, server: { middlewareMode: true, hmr: false } });
const { validateMergeBody, readBoundedJson, MAX_MERGE_BYTES } = await vite.ssrLoadModule("/lib/cart-merge-validation.ts");
after(() => vite.close());
const item = { product_id: "00000000-0000-4000-8000-000000000001", variant_id: "00000000-0000-4000-8000-000000000002", quantity: 2 };

test("validates quantity and bounded line counts", () => {
  assert.equal(validateMergeBody({ items: [{ ...item, quantity: 0 }] }), null);
  assert.equal(validateMergeBody({ items: [{ ...item, quantity: 21 }] }), null);
  assert.equal(validateMergeBody({ items: Array(51).fill(item) }), null);
  assert.equal(validateMergeBody({ items: [{ ...item, variant_id: "invalid" }] }), null);
});
test("combines duplicate lines and rejects conflicting product IDs and excessive totals", () => {
  assert.equal(validateMergeBody({ items: [item, item] })[0].quantity, 4);
  assert.equal(validateMergeBody({ items: [item, { ...item, quantity: 19 }] }), null);
  assert.equal(validateMergeBody({ items: [item, { ...item, product_id: "00000000-0000-4000-8000-000000000003" }] }), null);
});
test("accepts legacy local variant lines when product and size are present", () => {
  const legacy = { product_id: item.product_id, size: "M", quantity: 1 };
  assert.deepEqual(validateMergeBody({ items: [legacy] }), [{ productId: item.product_id, variantId: "", size: "M", quantity: 1 }]);
});
test("rejects oversized request streams even without content-length", async () => {
  const stream = new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(MAX_MERGE_BYTES + 1)); controller.close(); } });
  await assert.rejects(() => readBoundedJson(new Request("http://localhost/", { method: "POST", body: stream, duplex: "half" })));
});
test("cart merge rejects anonymous requests before processing input", async () => {
  const { POST } = await vite.ssrLoadModule("/app/api/cart/merge/route.ts");
  const response = await POST(new Request("http://localhost/api/cart/merge", { method: "POST", body: "{}" }));
  assert.equal(response.status, 401);
});
