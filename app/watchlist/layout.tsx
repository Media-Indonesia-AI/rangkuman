import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Watchlist · Rangkuman",
  description: "Pantau emiten favorit lo. Ringkasan harian + berita penting, semua di satu tempat.",
  openGraph: {
    title: "Watchlist · Rangkuman",
    description: "Pantau emiten favorit lo. Ringkasan harian + berita penting.",
    url: "https://rangkuman.news/watchlist",
    siteName: "Rangkuman",
    locale: "id_ID",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Watchlist" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Watchlist · Rangkuman",
    description: "Pantau emiten favorit lo. Ringkasan harian + berita penting.",
    images: ["/og-default.png"],
  },
};

export default function WatchlistLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
