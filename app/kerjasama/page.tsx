import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kerjasama · Rangkuman",
  description:
    "Kerjasama Rangkuman — rangkuman bisnis & ekonomi Indonesia untuk investor ritel & profesional, dikurasi dari 11 sumber media.",
  openGraph: {
    title: "Kerjasama · Rangkuman",
    description:
      "Recap saham harian untuk investor ritel Indonesia, dikurasi dari 11 sumber media.",
    url: "https://rangkuman.news/kerjasama",
    siteName: "Rangkuman",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kerjasama · Rangkuman",
    description: "Recap saham harian untuk investor ritel Indonesia.",
  },
};

export { default } from "./KerjasamaPage";