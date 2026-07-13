import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tim Redaksi · Rangkuman",
  description: "Tim di balik Rangkuman — editor, jurnalis, dan engineer yang merangkum pasar modal Indonesia setiap hari.",
  openGraph: {
    title: "Tim Redaksi · Rangkuman",
    description: "Tim editor & engineer di balik Rangkuman.",
    url: "https://rangkuman.news/tim-redaksi",
    siteName: "Rangkuman",
    locale: "id_ID",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Tim Redaksi" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tim Redaksi · Rangkuman",
    description: "Tim editor & engineer di balik Rangkuman.",
    images: ["/og-default.png"],
  },
};

export { default } from "./TimRedaksiPage";