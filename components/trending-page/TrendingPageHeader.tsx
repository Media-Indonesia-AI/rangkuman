import { Flame } from "lucide-react";

/**
 * Header strip for the `/trending` page — brand `Flame` icon,
 * the section label, the section title (h1), and the editorial
 * sub-description. Pure presentational; takes no props.
 *
 * The `<h1>` is intentionally here (not in the page orchestrator)
 * because SEO crawlers see the rendered HTML structure and the
 * heading belongs to *this* page's content rather than to the
 * page shell — keeping it next to the visible header copy means
 * future copy tweaks don't accidentally separate the two.
 */
export function TrendingPageHeader() {
  return (
    <header className="mb-5 border-b border-border-strong pb-3">
      <div className="mb-1 flex items-center gap-1.5">
        <Flame className="h-3.5 w-3.5 text-brand" aria-hidden />
        <span className="label text-text-secondary">Trending saham</span>
        <span className="font-mono text-[10.5px] text-text-muted">
          · 20 teratas · dikurasi harian
        </span>
      </div>
      <h1 className="text-[24px] font-bold leading-tight tracking-tight text-text-primary sm:text-[30px]">
        Saham paling banyak dibicarakan
      </h1>
      <p className="mt-1 text-[12.5px] leading-[1.55] text-text-secondary">
        Ranking diurutin berdasarkan jumlah artikel dari Recap saham harian untuk investor 
        ritel Indonesia. Dikurasi dari Bloomberg Technoz, Emitennews, CNBC Indonesia, Investor Daily, 
        Katadata, Bisnis.com, Kontan, CryptoNews, The Block, Cointelegraph, dan Decrypt. 
        Update setiap sesi perdagangan.
      </p>
    </header>
  );
}
