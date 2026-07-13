import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Komoditas · Rangkuman",
  description:
    "Harga batu bara, nikel, CPO, minyak dunia — apa yang lo perlu tahu tiap pagi. Dikurasi dari 64 sumber.",
  openGraph: {
    title: "Komoditas · Rangkuman",
    description: "Harga batu bara, nikel, CPO, minyak — intinya aja.",
    url: "https://rangkuman.news/komoditas/",
    siteName: "Rangkuman",
    locale: "id_ID",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Rangkuman Komoditas" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Komoditas · Rangkuman",
    description: "Harga batu bara, nikel, CPO, minyak.",
    images: ["/og-default.png"],
  },
};

export { default } from "./KomoditasPage";