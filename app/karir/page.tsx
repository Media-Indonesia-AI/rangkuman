import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Karir · Rangkuman",
  description: "Lowongan & peluang kontribusi di Rangkuman. Bergabung dengan tim yang merangkum pasar modal Indonesia.",
  openGraph: {
    title: "Karir · Rangkuman",
    description: "Lowongan & peluang kontribusi di Rangkuman.",
    url: "https://rangkuman.news/karir",
    siteName: "Rangkuman",
    locale: "id_ID",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Karir" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Karir · Rangkuman",
    description: "Lowongan & peluang kontribusi di Rangkuman.",
    images: ["/og-default.png"],
  },
};

export { default } from "./KarirPage";