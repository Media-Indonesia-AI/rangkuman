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
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Syarat & Ketentuan" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Syarat & Ketentuan · Rangkuman",
    description: "Aturan main penggunaan layanan.",
    images: ["/og-default.png"],
  },
};

export { default } from "./SyaratKetentuanPage";