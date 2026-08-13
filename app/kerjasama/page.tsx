import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kerjasama · Rangkuman",
  description:
    "Kerjasama Rangkuman — rangkuman bisnis & ekonomi Indonesia untuk investor ritel & profesional, dikurasi dari 64 sumber media.",
  openGraph: {
    title: "Kerjasama · Rangkuman",
    description:
      "Recap saham harian untuk investor ritel Indonesia, dikurasi dari 64 sumber media.",
    url: "https://rangkuman.news/kerjasama",
    siteName: "Rangkuman",
    locale: "id_ID",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Kerjasama Rangkuman" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kerjasama · Rangkuman",
    description: "Recap saham harian untuk investor ritel Indonesia.",
    images: ["/og-default.png"],
  },
};

export { default } from "./KerjasamaPage";