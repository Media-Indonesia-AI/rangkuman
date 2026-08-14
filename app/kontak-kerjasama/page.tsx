import type { Metadata } from "next";
import { clampDescription } from "@/lib/util/clampDescription";

export const metadata: Metadata = {
  title: "Kontak & Kerjasama · Rangkuman",
  description: clampDescription(
    "Kontak resmi Rangkuman: email untuk pertanyaan umum, koreksi redaksi, dan media partner. Plus info kerjasama & partnership untuk investor ritel, pendiri startup, & profesional.",
  ),
  alternates: { canonical: "/kontak-kerjasama/" },
  openGraph: {
    title: "Kontak & Kerjasama · Rangkuman",
    description:
      "Kontak resmi Rangkuman: email untuk pertanyaan umum, koreksi redaksi, dan media partner. Plus info kerjasama & partnership.",
    url: "https://rangkuman.news/kontak-kerjasama",
    siteName: "Rangkuman",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kontak & Kerjasama · Rangkuman",
    description:
      "Kontak resmi Rangkuman: email untuk pertanyaan umum, koreksi redaksi, dan media partner. Plus info kerjasama & partnership.",
  },
};

export { default } from "./KontakKerjasamaPage";