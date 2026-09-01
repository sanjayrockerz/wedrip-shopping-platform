import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://wedrip-editorial.chalant-app.chatgpt.site"),
  title: { default: "WeDrip - Wear the Scene", template: "%s - WeDrip" },
  description: "Creator-led objects and wearable worlds, made in India.",
  alternates: { canonical: "/" },
  openGraph: { title: "WeDrip - Wear the Scene", description: "Creator-led objects and wearable worlds, made in India.", type: "website", images: [{ url: "/images/wedrip-hero.png", width: 1587, height: 991, alt: "WeDrip Drop 001 campaign" }] },
  twitter: { card: "summary_large_image", title: "WeDrip - Wear the Scene", description: "Creator-led objects and wearable worlds, made in India.", images: ["/images/wedrip-hero.png"] },
  other: { "codex-preview": "development" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body className="antialiased">{children}</body></html>; }
