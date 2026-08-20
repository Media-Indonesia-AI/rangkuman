import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan · Rangkuman",
  description:
    "Syarat & Ketentuan penggunaan Rangkuman — aturan main, hak pengguna, dan batasan layanan.",
  openGraph: {
    title: "Syarat & Ketentuan · Rangkuman",
    description: "Aturan main & batasan layanan Rangkuman.",
    url: "https://rangkuman.news/syarat-ketentuan",
    siteName: "Rangkuman",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Syarat & Ketentuan · Rangkuman",
    description: "Aturan main penggunaan layanan.",
  },
};

export { default } from "./SyaratKetentuanPage";