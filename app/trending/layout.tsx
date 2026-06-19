import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "20 Saham Trending · Rangkuman",
  description:
    "BBCA #1, TLKM #2, ANTM #3 — ranking dari volume berita.",
  openGraph: {
    title: "20 Saham Trending · Rangkuman",
    description: "BBCA #1, TLKM #2, ANTM #3 — ranking dari volume berita.",
    url: "https://rangkuman.news/trending",
    siteName: "Rangkuman",
    locale: "id_ID",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "20 Saham Trending" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "20 Saham Trending · Rangkuman",
    description: "BBCA #1, TLKM #2, ANTM #3 — ranking dari volume berita.",
    images: ["/og-default.png"],
  },
};

export default function TrendingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
