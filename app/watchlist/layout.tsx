import type { Metadata } from "next";
import { WatchlistClientShell } from "./WatchlistClientShell";

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
  },
  twitter: {
    card: "summary_large_image",
    title: "Watchlist · Rangkuman",
    description: "Pantau emiten favorit lo. Ringkasan harian + berita penting.",
  },
};

/**
 * `/watchlist/` server layout. The server route only owns the
 * static metadata + OpenGraph image (for social card unfurls) and
 * delegates the visual chrome (sidebar + auth gate + content slot)
 * to the client-side `<WatchlistClientShell />`. Keeping the
 * metadata export at the top level preserves the OG/SEO surface
 * that legacy links depend on.
 */
export default function WatchlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WatchlistClientShell>{children}</WatchlistClientShell>;
}
