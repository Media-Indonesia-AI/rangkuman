import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontak · Rangkuman",
  description: "Hubungi tim Rangkuman — untuk pertanyaan, masukan, kerja sama, atau pelaporan konten.",
  openGraph: {
    title: "Kontak · Rangkuman",
    description: "Hubungi tim Rangkuman untuk pertanyaan & masukan.",
    url: "https://rangkuman.news/kontak",
    siteName: "Rangkuman",
    locale: "id_ID",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Kontak" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kontak · Rangkuman",
    description: "Hubungi tim Rangkuman.",
    images: ["/og-default.png"],
  },
};

export { default } from "./KontakPage";