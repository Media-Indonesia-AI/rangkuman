import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer · Rangkuman",
  description:
    "Disclaimer Rangkuman — keterbatasan tanggung jawab, batasan penggunaan konten, dan risiko investasi.",
  openGraph: {
    title: "Disclaimer · Rangkuman",
    description: "Keterbatasan tanggung jawab & batasan penggunaan konten Rangkuman.",
    url: "https://rangkuman.news/disclaimer",
    siteName: "Rangkuman",
    locale: "id_ID",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Disclaimer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Disclaimer · Rangkuman",
    description: "Keterbatasan tanggung jawab & batasan penggunaan.",
    images: ["/og-default.png"],
  },
};

export { default } from "./DisclaimerPage";
