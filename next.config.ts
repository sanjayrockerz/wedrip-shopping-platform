import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // The storefront is also built for Cloudflare Workers, whose
    // `cloudflare:workers` module is unavailable to Vercel's type checker.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
