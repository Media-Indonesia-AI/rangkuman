import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pedoman Media Siber · Rangkuman",
  description: "Pedoman Media Siber Rangkuman — standar editorial, etika peliputan, dan koreksi yang kami pegang.",
  openGraph: {
    title: "Pedoman Media Siber · Rangkuman",
    description: "Standar editorial & etika peliputan Rangkuman.",
    url: "https://rangkuman.news/pedoman-media-siber",
    siteName: "Rangkuman",
    locale: "id_ID",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Pedoman Media Siber" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pedoman Media Siber · Rangkuman",
    description: "Standar editorial & etika peliputan.",
    images: ["/og-default.png"],
  },
};

export { default } from "./PedomanMediaSiberPage";