import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saham · Rangkuman",
  description:
    "Recap saham harian dari 64 sumber: BBCA, BBRI, BMRI, dan 30+ emiten LQ45. Ringkasan + sentimen + daftar media.",
  openGraph: {
    title: "Saham · Rangkuman",
    description:
      "Recap saham harian dari 64 sumber untuk 30+ emiten LQ45. Ringkasan + sentimen + daftar media.",
    url: "https://rangkuman.news/saham/",
    siteName: "Rangkuman",
    locale: "id_ID",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Rangkuman Saham" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Saham · Rangkuman",
    description: "Recap saham harian dari 64 sumber.",
    images: ["/og-default.png"],
  },
};

export default function SahamLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
