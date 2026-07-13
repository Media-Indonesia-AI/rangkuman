import { getStockByKode, stocks } from "@/lib/mock/stocks";
import { getRecapsForStock } from "@/lib/mock/recaps";

interface PageProps {
  params: { kode: string };
}

export function generateStaticParams(): { kode: string }[] {
  return stocks.map((s) => ({ kode: s.kode }));
}

export function generateMetadata({ params }: PageProps) {
  const stock = getStockByKode(params.kode);
  if (!stock) return { title: "Saham tidak ditemukan · Rangkuman" };
  const recaps = getRecapsForStock(params.kode);
  const today = recaps[0];
  const articleCount = today?.jumlahBerita ?? 0;
  const mediaCount = today?.sumber.length ?? 0;
  const title = `${params.kode} — ${stock.nama} · Rangkuman`;
  const desc = `${params.kode} dividen interim Rp 215/saham, yield ${stock.dividendYield.toFixed(1)}%. ${articleCount} artikel dari ${mediaCount} media.`;
  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url: `https://rangkuman.news/stock/${params.kode}`,
      type: "article",
      images: [{ url: "/og-default.png", width: 1200, height: 630, alt: params.kode }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: ["/og-default.png"],
    },
  };
}

export { default } from "./StockDetailPage";