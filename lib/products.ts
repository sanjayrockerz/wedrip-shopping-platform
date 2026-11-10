import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  product_type: string;
  short_description: string | null;
  description: string | null;
  price_paise: number;
  primary_image_url: string;
  image_alt: string;
  visual_tone: string | null;
  material: string | null;
  gsm: number | null;
  is_featured: boolean;
  display_order: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  productType: string;
  shortDescription: string | null;
  description: string | null;
  pricePaise: number;
  primaryImageUrl: string;
  imageAlt: string;
  visualTone: string | null;
  material: string | null;
  gsm: number | null;
  isFeatured: boolean;
  displayOrder: number;
};

export type CatalogCategory = { name: string; slug: string; count: number; image: Product };
export type ProductVariant = { id: string; product_id: string; size: string; color: string | null; sku: string | null; price_paise: number | null; stock_quantity: number | null; active: boolean };

export const collection = { slug: "drop-001", name: "The Third Space", eyebrow: "DROP 001", description: "Limited objects for the places between scenes. Designed in Chennai, made to outlive the feed." };
export const PRODUCT_COLUMNS = "id,slug,name,product_type,short_description,description,price_paise,primary_image_url,image_alt,visual_tone,material,gsm,is_featured,display_order";

export function mapProductRow(row: ProductRow): Product {
  if (!row.id || !row.slug || !row.name || !row.product_type || !row.primary_image_url || !row.image_alt || !Number.isInteger(row.price_paise) || row.price_paise < 0) {
    throw new Error("Invalid product row");
  }
  return { id: row.id, slug: row.slug, name: row.name, productType: row.product_type, shortDescription: row.short_description, description: row.description, pricePaise: row.price_paise, primaryImageUrl: row.primary_image_url, imageAlt: row.image_alt, visualTone: row.visual_tone, material: row.material, gsm: row.gsm, isFeatured: row.is_featured, displayOrder: row.display_order };
}

export function formatPrice(pricePaise: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(pricePaise / 100);
}

export function getCategories(products: Product[]): CatalogCategory[] {
  const grouped = new Map<string, Product[]>();
  for (const product of products) grouped.set(product.productType, [...(grouped.get(product.productType) ?? []), product]);
  return [...grouped.entries()].map(([name, items]) => ({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), count: items.length, image: items[0] }));
}

type ProductQueryResult = { products: Product[]; error: string | null };

export async function getFeaturedProducts(client: SupabaseClient | null = getSupabaseServerClient()): Promise<ProductQueryResult> {
  if (!client) return { products: [], error: "Product database is not configured" };
  try {
    const { data, error } = await client.from("products").select(PRODUCT_COLUMNS).eq("is_active", true).eq("is_featured", true).order("display_order", { ascending: true }).limit(12);
    if (error) throw error;
    return { products: (data ?? []).map((row) => mapProductRow(row as ProductRow)), error: null };
  } catch {
    console.error("[products] Featured product query failed");
    return { products: [], error: "Product database is temporarily unavailable" };
  }
}

export async function getCatalogProducts(client: SupabaseClient | null = getSupabaseServerClient()): Promise<ProductQueryResult> {
  if (!client) return { products: [], error: "Product database is not configured" };
  try {
    const { data, error } = await client.from("products").select(PRODUCT_COLUMNS).eq("is_active", true).order("display_order", { ascending: true }).limit(100);
    if (error) throw error;
    return { products: (data ?? []).map((row) => mapProductRow(row as ProductRow)), error: null };
  } catch {
    console.error("[products] Catalog product query failed");
    return { products: [], error: "Product database is temporarily unavailable" };
  }
}

export async function getProductBySlug(slug: string, client: SupabaseClient | null = getSupabaseServerClient()): Promise<Product | null> {
  if (!client || !slug || slug.length > 160) return null;
  try {
    const { data, error } = await client.from("products").select(PRODUCT_COLUMNS).eq("slug", slug).eq("is_active", true).maybeSingle();
    if (error || !data) return null;
    return mapProductRow(data as ProductRow);
  } catch {
    console.error("[products] Product lookup failed");
    return null;
  }
}

export async function getProductVariants(productId: string, client: SupabaseClient | null = getSupabaseServerClient()): Promise<ProductVariant[]> {
  if (!client) return [];
  const { data } = await client.from("product_variants").select("id,product_id,size,color,sku,price_paise,stock_quantity,active").eq("product_id", productId).eq("active", true).order("size");
  return (data ?? []) as ProductVariant[];
}
