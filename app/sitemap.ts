import type { MetadataRoute } from "next";
import { catalog } from "@/lib/catalog";

const base = "https://wedrip-editorial.chalant-app.chatgpt.site";
export default function sitemap(): MetadataRoute.Sitemap { return [{ url: base, changeFrequency: "weekly", priority: 1 }, { url: `${base}/collections/drop-001`, changeFrequency: "weekly", priority: .9 }, ...catalog.map((product) => ({ url: `${base}/products/${product.slug}`, changeFrequency: "weekly" as const, priority: .8 }))]; }
