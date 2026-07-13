import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daftar · Rangkuman",
  description: "Daftar akun Rangkuman untuk menyimpan watchlist saham, koleksi berita, dan mendapat recap personal.",
  openGraph: {
    title: "Daftar · Rangkuman",
    description: "Daftar akun Rangkuman untuk menyimpan watchlist saham dan koleksi berita.",
    url: "https://rangkuman.news/daftar",
    siteName: "Rangkuman",
    locale: "id_ID",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Daftar Rangkuman" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Daftar · Rangkuman",
    description: "Daftar akun Rangkuman untuk menyimpan watchlist saham.",
    images: ["/og-default.png"],
  },
};

export default function DaftarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}