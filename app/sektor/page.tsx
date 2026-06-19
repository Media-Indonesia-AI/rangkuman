import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TopTicker } from "@/components/TopTicker";
import { SektorSection } from "@/components/SektorSection";

export const metadata = {
  title: "Komoditas & Sektor · Rangkuman",
  description:
    "Harga batu bara, nikel, CPO dan saham per-sektor IHSG. Sentimen, saham unggulan, dan analisa per-sektor.",
  openGraph: {
    title: "Komoditas & Sektor · Rangkuman",
    description:
      "Harga batu bara, nikel, CPO dan saham per-sektor IHSG. Sentimen, saham unggulan, dan analisa per-sektor.",
    url: "https://rangkuman.news/sektor",
    siteName: "Rangkuman",
    locale: "id_ID",
    type: "website",
    images: [
      { url: "/og-default.png", width: 1200, height: 630, alt: "Komoditas & Sektor" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Komoditas & Sektor · Rangkuman",
    description: "Harga batu bara, nikel, CPO dan saham per-sektor IHSG.",
    images: ["/og-default.png"],
  },
};

export default function SektorPage() {
  return (
    <>
      <TopTicker />
      <Navbar />
      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6 sm:pt-5">
        <SektorSection />
      </main>
      <Footer />
    </>
  );
}
