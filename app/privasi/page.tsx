import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kebijakan Privasi · Rangkuman",
  description:
    "Kebijakan privasi Rangkuman — bagaimana kami mengelola data pribadi lo, cookie, dan storage lokal.",
  openGraph: {
    title: "Kebijakan Privasi · Rangkuman",
    description: "Bagaimana kami mengelola data pribadi & storage lokal lo.",
    url: "https://rangkuman.news/privasi",
    siteName: "Rangkuman",
    locale: "id_ID",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Kebijakan Privasi" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kebijakan Privasi · Rangkuman",
    description: "Bagaimana kami mengelola data pribadi lo.",
    images: ["/og-default.png"],
  },
};

export { default } from "./PrivasiPage";