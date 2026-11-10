import assert from "node:assert/strict";
import { createServer } from "vite";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const vite = await createServer({ appType: "custom", configFile: false, root, resolve: { alias: { "@": root } }, server: { middlewareMode: true } });
const { formatPrice, getFeaturedProducts, mapProductRow } = await vite.ssrLoadModule("/lib/products.ts");
const { getProductHref } = await vite.ssrLoadModule("/components/product-card.tsx");

after(async () => vite.close());

const row = (overrides = {}) => ({ id: "00000000-0000-4000-8000-000000000001", slug: "scene-01-heavy-tee", name: "Scene 01 / Heavy Tee", product_type: "T-Shirts", short_description: "The everyday uniform.", description: "A dense cotton study from Chennai.", price_paise: 249000, primary_image_url: "/images/wedrip-tee.png", image_alt: "WeDrip model wearing a heavyweight tee", visual_tone: "cream", material: "100% combed cotton", gsm: 240, is_featured: true, display_order: 1, ...overrides });

function fakeSupabase({ data = [], error = null } = {}) {
  const calls = [];
  const query = {
    select(columns) { calls.push(["select", columns]); return this; },
    eq(column, value) { calls.push(["eq", column, value]); return this; },
    order(column, options) { calls.push(["order", column, options]); return this; },
    limit(value) { calls.push(["limit", value]); return this; },
    then(resolve) { return Promise.resolve(resolve({ data, error })); },
  };
  return { calls, from(table) { calls.push(["from", table]); return query; } };
}

test("maps database rows to the strict frontend product model", () => {
  const product = mapProductRow(row());
  assert.equal(product.productType, "T-Shirts");
  assert.equal(product.pricePaise, 249000);
  assert.equal(product.primaryImageUrl, "/images/wedrip-tee.png");
  assert.equal(product.displayOrder, 1);
});

test("formats paise as Indian rupees", () => {
  assert.equal(formatPrice(249000), "₹2,490");
});

test("requests active featured products in display order with a limit", async () => {
  const client = fakeSupabase({ data: [row()] });
  const result = await getFeaturedProducts(client);
  assert.equal(result.error, null);
  assert.equal(result.products[0].slug, "scene-01-heavy-tee");
  assert.deepEqual(client.calls[0], ["from", "products"]);
  assert.match(client.calls[1][1], /price_paise/);
  assert.deepEqual(client.calls.slice(2, 5), [["eq", "is_active", true], ["eq", "is_featured", true], ["order", "display_order", { ascending: true }]]);
  assert.deepEqual(client.calls[5], ["limit", 12]);
});

test("returns an intentional empty result", async () => {
  const result = await getFeaturedProducts(fakeSupabase());
  assert.deepEqual(result, { products: [], error: null });
});

test("returns a safe error result when Supabase fails", async () => {
  const result = await getFeaturedProducts(fakeSupabase({ error: new Error("private database detail") }));
  assert.deepEqual(result, { products: [], error: "Product database is temporarily unavailable" });
});

test("product cards link to the database slug", () => {
  assert.equal(getProductHref(mapProductRow(row())), "/products/scene-01-heavy-tee");
});
