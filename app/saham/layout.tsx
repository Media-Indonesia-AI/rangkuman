import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saham · Rangkuman",
  description:
    "Recap saham harian dari 11 sumber: BBCA, BBRI, BMRI, dan 30+ emiten LQ45. Ringkasan + sentimen + daftar media.",
  openGraph: {
    title: "Saham · Rangkuman",
    description:
      "Recap saham harian dari 11 sumber untuk 30+ emiten LQ45. Ringkasan + sentimen + daftar media.",
    url: "https://rangkuman.news/saham/",
    siteName: "Rangkuman",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Saham · Rangkuman",
    description: "Recap saham harian dari 11 sumber.",
  },
};

export default function SahamLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
