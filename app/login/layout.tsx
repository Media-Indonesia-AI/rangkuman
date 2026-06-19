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
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Masuk ke Rangkuman" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Masuk · Rangkuman",
    description: "Masuk untuk menyimpan berita dan mengikuti watchlist.",
    images: ["/og-default.png"],
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
