import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ekonomi · Rangkuman",
  description:
    "Rangkuman berita ekonomi Indonesia: inflasi, suku bunga, APBN, pertumbuhan, perdagangan, fiskal — dikurasi dari 64 sumber.",
  openGraph: {
    title: "Ekonomi · Rangkuman",
    description: "Inflasi, suku bunga, APBN, pertumbuhan, perdagangan, fiskal — intinya aja.",
    url: "https://rangkuman.news/ekonomi/",
    siteName: "Rangkuman",
    locale: "id_ID",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Rangkuman Ekonomi" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ekonomi · Rangkuman",
    description: "Rangkuman berita ekonomi Indonesia.",
    images: ["/og-default.png"],
  },
};

export { default } from "./EkonomiPage";
