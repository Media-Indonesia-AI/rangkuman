import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Masuk · Rangkuman",
  description: "Masuk untuk menyimpan berita, mengikuti watchlist, dan dapat notifikasi cerita penting.",
  openGraph: {
    title: "Masuk · Rangkuman",
    description: "Masuk untuk menyimpan berita, mengikuti watchlist, dan dapat notifikasi cerita penting.",
    url: "https://rangkuman.news/login",
    siteName: "Rangkuman",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Masuk · Rangkuman",
    description: "Masuk untuk menyimpan berita dan mengikuti watchlist.",
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
