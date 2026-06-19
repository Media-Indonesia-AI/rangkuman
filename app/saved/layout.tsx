import type { Metadata } from "next";

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

export default function SavedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
