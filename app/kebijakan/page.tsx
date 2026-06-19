import type { Metadata } from "next";
import { CategoryPageView } from "@/components/CategoryPageView";

export const metadata: Metadata = {
  title: "Kebijakan · Rangkuman",
  description:
    "Rangkuman regulasi & kebijakan Indonesia: UU, PP, Permendag, POJK, pajak, kebijakan pemerintah — dikurasi dari 64 sumber.",
  openGraph: {
    title: "Kebijakan · Rangkuman",
    description: "Regulasi, UU, PP, Permendag, POJK, pajak, kebijakan pemerintah — intinya aja.",
    url: "https://rangkuman.news/kebijakan/",
    siteName: "Rangkuman",
    locale: "id_ID",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Rangkuman Kebijakan" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kebijakan · Rangkuman",
    description: "Rangkuman regulasi & kebijakan Indonesia.",
    images: ["/og-default.png"],
  },
};

export default function KebijakanPage() {
  return <CategoryPageView category="kebijakan" />;
}
