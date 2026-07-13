import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bisnis · Rangkuman",
  description:
    "Rangkuman berita bisnis Indonesia: akuisisi, startup, UMKM, korporasi, PHK, ekspansi, funding — dikurasi dari 64 sumber.",
  openGraph: {
    title: "Bisnis · Rangkuman",
    description: "Akuisisi, startup, UMKM, korporasi, PHK, ekspansi, funding — intinya aja.",
    url: "https://rangkuman.news/bisnis/",
    siteName: "Rangkuman",
    locale: "id_ID",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Rangkuman Bisnis" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bisnis · Rangkuman",
    description: "Rangkuman berita bisnis Indonesia.",
    images: ["/og-default.png"],
  },
};

export { default } from "./BisnisPage";
