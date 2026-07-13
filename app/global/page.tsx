import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Global · Rangkuman",
  description:
    "Berita dunia yang relevan buat Indonesia: Fed, geopolitik, commodity, trade war — dikurasi dari 64 sumber.",
  openGraph: {
    title: "Global · Rangkuman",
    description: "Berita global yang relevan buat Indonesia.",
    url: "https://rangkuman.news/global/",
    siteName: "Rangkuman",
    locale: "id_ID",
    type: "website",
    images: [
      { url: "/og-default.png", width: 1200, height: 630, alt: "Global Rangkuman" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Global · Rangkuman",
    description: "Berita global yang relevan buat Indonesia.",
    images: ["/og-default.png"],
  },
};

export { default } from "./GlobalPage";