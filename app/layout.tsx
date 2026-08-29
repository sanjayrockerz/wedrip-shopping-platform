import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WeDrip — Wear the Scene",
  description: "Creator-led objects and wearable worlds, made in India.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
