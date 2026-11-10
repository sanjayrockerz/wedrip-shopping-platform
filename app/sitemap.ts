import type { MetadataRoute } from "next";
import { collection, getFeaturedProducts } from "@/lib/products";

const base = "https://wedrip-editorial.vercel.app";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> { const { products } = await getFeaturedProducts(); return [{ url: base, changeFrequency: "weekly", priority: 1 }, { url: `${base}/collections/${collection.slug}`, changeFrequency: "weekly", priority: .9 }, ...products.map((product) => ({ url: `${base}/products/${product.slug}`, changeFrequency: "weekly" as const, priority: .8 }))]; }
