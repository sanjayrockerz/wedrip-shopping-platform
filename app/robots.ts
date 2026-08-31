import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: "*", allow: "/" }, sitemap: "https://wedrip-editorial.chalant-app.chatgpt.site/sitemap.xml" }; }
