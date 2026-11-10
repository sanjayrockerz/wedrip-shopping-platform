import type { Metadata } from "next";
import "./globals.css";

const origin = "https://wedrip-editorial.vercel.app";
export const metadata: Metadata = {
  metadataBase: new URL(origin),
  applicationName: "WeDrip",
  title: { default: "WeDrip — Wear the Scene", template: "%s — WeDrip" },
  description: "Creator-led objects and wearable worlds, made in Chennai, India.",
  keywords: ["WeDrip", "streetwear", "Chennai", "India", "creator-led objects"],
  alternates: { canonical: "/" },
  openGraph: { title: "WeDrip — Wear the Scene", description: "Creator-led objects and wearable worlds, made in Chennai, India.", url: origin, siteName: "WeDrip", type: "website", images: [{ url: "/images/wedrip-hero.png", width: 1587, height: 991, alt: "WeDrip Drop 001 campaign" }] },
  twitter: { card: "summary_large_image", title: "WeDrip — Wear the Scene", description: "Creator-led objects and wearable worlds, made in Chennai, India.", images: ["/images/wedrip-hero.png"] },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

const themeScript = `(() => { try { const stored = localStorage.getItem('wedrip-theme'); const theme = stored || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); document.documentElement.dataset.theme = theme; } catch (_) {} })()`;
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" suppressHydrationWarning><body><script dangerouslySetInnerHTML={{ __html: themeScript }} />{children}</body></html>; }
