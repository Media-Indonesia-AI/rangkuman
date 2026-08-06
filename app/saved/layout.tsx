import type { Metadata } from "next";
import { SavedClientShell } from "./SavedClientShell";

export const metadata: Metadata = {
  title: "Berita Tersimpan · Rangkuman",
  description: "Koleksi berita yang lo simpan buat dibaca nanti.",
  openGraph: {
    title: "Berita Tersimpan · Rangkuman",
    description: "Koleksi berita yang lo simpan buat dibaca nanti.",
    url: "https://rangkuman.news/saved",
    siteName: "Rangkuman",
    locale: "id_ID",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Berita Tersimpan" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Berita Tersimpan · Rangkuman",
    description: "Koleksi berita yang lo simpan buat dibaca nanti.",
    images: ["/og-default.png"],
  },
};

/**
 * `/saved/` server layout. Same split as `/watchlist/` — the
 * server only owns the static metadata + OpenGraph image (for
 * social card unfurls) and delegates the visual chrome
 * (sidebar + content slot) to the client-side
 * `<SavedClientShell />`. Saved is local-only, so no auth gate.
 */
export default function SavedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SavedClientShell>{children}</SavedClientShell>;
}
