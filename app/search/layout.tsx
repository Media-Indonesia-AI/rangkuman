import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pencarian · Rangkuman",
  description:
    "Cari emiten dan topik pasar modal Indonesia. Rekapitulasi saham, sektor, dan cerita yang sedang tren.",
  openGraph: {
    title: "Pencarian · Rangkuman",
    description:
      "Cari emiten dan topik pasar modal Indonesia. Rekapitulasi saham, sektor, dan cerita yang sedang tren.",
    url: "https://rangkuman.news/search",
    siteName: "Rangkuman",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pencarian · Rangkuman",
    description: "Cari emiten dan topik pasar modal Indonesia.",
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
