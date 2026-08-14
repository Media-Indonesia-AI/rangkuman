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
  },
  twitter: {
    card: "summary_large_image",
    title: "Kontak · Rangkuman",
    description: "Hubungi tim Rangkuman.",
  },
};

export { default } from "./KontakPage";