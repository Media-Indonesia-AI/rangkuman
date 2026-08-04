import Link from "next/link";
import { ArrowRight, Globe2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GradientDivider } from "@/components/GradientDivider";
import { MarketSnapshot, type MetricCard } from "@/components/MarketSnapshot";
import { getStoriesByCategory } from "@/lib/mock/highlights";
import { GLOBAL_INDICES } from "@/lib/mock/category-widgets";

// Pick the 3 most "iconic" indices + USD/IDR for the snapshot widget
const INDEX_BY_ID = Object.fromEntries(GLOBAL_INDICES.map((i) => [i.id, i]));
const SPX = INDEX_BY_ID["ix-spx"];
const HSI = INDEX_BY_ID["ix-hangseng"];
const NIKKEI = INDEX_BY_ID["ix-nikkei"];

const GLOBAL_METRICS: MetricCard[] = [
  {
    id: "spx",
    label: "S&P 500",
    value: SPX.value,
    change: SPX.change,
  },
  {
    id: "hsi",
    label: "Hang Seng",
    value: HSI.value,
    change: HSI.change,
  },
  {
    id: "nikkei",
    label: "Nikkei 225",
    value: NIKKEI.value,
    change: NIKKEI.change,
  },
  {
    id: "usdidr",
    label: "USD/IDR",
    value: "16.320",
    change: -0.40,
  },
];

export default function GlobalPage() {
  const stories = getStoriesByCategory("global");
  const lead = stories[0];
  const sedangTerjadi = stories.slice(1, 5); // 4 cards
  const ceritaLain = stories.slice(5); // rest
  return (
    <>
      <Navbar />

      <main className="relative z-10 mx-auto max-w-3xl px-4 pb-16 pt-3 sm:px-6 sm:pt-5 md:max-w-4xl lg:max-w-6xl lg:px-8">
        {/* Sr-only H1 for SEO */}
        <h1 className="sr-only">
          Rangkuman &mdash; Global: Berita Dunia yang Relevan Buat Indonesia
        </h1>

        {/* 🔥 LAYER 1: SOROTAN — 1 big card */}
        {lead && (
          <section aria-label="Sorotan" className="mt-4">
            <SectionHeader
              icon="🔥"
              title="Sorotan"
              subtitle="Cerita paling penting hari ini"
              count="1 cerita"
            />
            <FeaturedGlobalCard story={lead} />
          </section>
        )}

        {/* Bursa Global widget — between Sorotan and Sedang Terjadi */}
        <MarketSnapshot
          metrics={GLOBAL_METRICS}
          title="Bursa Global"
          subtitle="3 indeks utama + USD/IDR · update terakhir 1 jam lalu"
          className="mt-5"
        />

        {/* 📋 LAYER 2: SEDANG TERJADI — 4 cards in 2-col */}
        {sedangTerjadi.length > 0 && (
          <section aria-label="Sedang terjadi" className="mt-8">
            <SectionHeader
              icon="📋"
              title="Sedang Terjadi"
              subtitle="Cerita penting lainnya"
              count={`Top ${sedangTerjadi.length} · 1 jam terakhir`}
            />
            <div className="grid gap-2.5 sm:grid-cols-2">
              {sedangTerjadi.map((s) => (
                <GlobalStoryCard key={s.id} story={s} />
              ))}
            </div>
          </section>
        )}

        {/* 📚 LAYER 3: CERITA LAIN — 3-col grid (compact, no summary) */}
        {ceritaLain.length > 0 && (
          <section aria-label="Cerita lain" className="mt-8">
            <SectionHeader
              icon="📚"
              title="Cerita Lain"
              subtitle="Berita tambahan hari ini"
              count={`${ceritaLain.length} cerita`}
            />
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {ceritaLain.map((s) => (
                <GlobalStoryCard key={s.id} story={s} compact />
              ))}
            </div>
          </section>
        )}

        <GradientDivider spacing="my-8" />

        {/* Lihat indeks lengkap */}
        <section className="mt-2">
          <h2 className="mb-3 inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
            <Globe2 className="h-3 w-3" aria-hidden />
            Indeks Global
          </h2>
          <div className="rounded-lg border border-border bg-bg-secondary">
            <ul className="divide-y divide-border">
              {GLOBAL_INDICES.map((idx) => {
                const isUp = idx.change >= 0;
                return (
                  <li
                    key={idx.id}
                    className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-text-primary">
                        {idx.name}
                      </p>
                      <p className="text-[10px] text-text-faint">
                        {idx.region} · {idx.context}
                      </p>
                    </div>
                    <div className="text-right font-mono text-[12px] font-semibold tabular-nums text-text-primary">
                      {idx.value}
                    </div>
                    <div
                      className={`text-right font-mono text-[11px] font-semibold tabular-nums ${
                        isUp ? "text-cat-saham" : "text-cat-kebijakan"
                      }`}
                    >
                      {isUp ? "+" : ""}
                      {idx.change.toFixed(2)}%
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* About footer */}
        <div className="mt-8 flex flex-col items-center gap-2 border-t border-border pt-5 sm:flex-row sm:justify-between">
          <p className="font-mono text-[10.5px] text-text-muted">
            © 2026 Rangkuman · Jakarta ·{" "}
            <span className="text-text-secondary">Baca lebih sedikit, tahu lebih banyak.</span>
          </p>
          <Link
            href="/tentang"
            className="group inline-flex items-center gap-1 font-mono text-[10.5px] font-semibold uppercase tracking-widest text-text-muted transition-colors hover:text-brand"
          >
            About Rangkuman
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
  count,
}: {
  icon: string;
  title: string;
  subtitle: string;
  count: string;
}) {
  return (
    <div className="mb-3 flex items-end justify-between border-b border-border-strong pb-1.5">
      <div>
        <h2 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
          <span className="mr-1" aria-hidden>
            {icon}
          </span>
          {title}
        </h2>
        <p className="mt-0.5 text-[11px] text-text-muted">{subtitle}</p>
      </div>
      <span className="font-mono text-[10px] text-text-faint">{count}</span>
    </div>
  );
}

function FeaturedGlobalCard({ story }: { story: ReturnType<typeof getStoriesByCategory>[number] }) {
  return (
    <article className="group relative overflow-hidden rounded-lg border border-border-strong bg-bg-secondary">
      <Link
        href={`/crypto/detail/${story.id}`}
        className="block"
      >
        {/* Gradient header */}
        <div
          className="relative h-28 w-full overflow-hidden sm:h-32 bg-hero-global"
          aria-hidden
        >
          <div className="absolute inset-0 opacity-50 pattern-chart-line" />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-globe-2 absolute -right-4 -top-4 h-32 w-32 rotate-12 text-white/[0.06] sm:-right-6 sm:-top-6 sm:h-40 sm:w-40"
            aria-hidden
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 0 0 0 20" />
            <path d="M2 12h20" />
          </svg>
          <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-bg-secondary to-transparent" />
          <div className="absolute left-3 top-3 flex items-center gap-1.5 sm:left-4 sm:top-4">
            <span className="inline-flex items-center gap-1 rounded border border-white/20 bg-black/30 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
              Global
            </span>
            <span className="inline-flex items-center gap-1 rounded border border-white/20 bg-black/30 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-white/90 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              LIVE
            </span>
          </div>
        </div>
        <div className="px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
          <h3 className="font-mono text-[22px] font-bold leading-[1.1] tracking-tight text-text-primary transition-colors group-hover:text-text-primary sm:text-[28px] sm:leading-[1.08] lg:text-[32px] lg:leading-[1.05]">
            {story.title}
          </h3>
          <p className="mt-2 max-w-2xl text-[12.5px] leading-relaxed text-text-secondary sm:text-[13.5px]">
            {story.summary}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 border-t border-border pt-2.5 font-mono text-[10px] text-text-muted">
            <span>{story.timeAgo}</span>
            {story.flag && (
              <>
                <span className="text-text-faint">·</span>
                <span className="text-[12px]" aria-hidden>
                  {story.flag}
                </span>
              </>
            )}
            <span className="text-text-faint">·</span>
            <span className="font-bold tabular-nums text-cat-global">
              {story.sourceCount}
            </span>
            <span>sumber</span>
            <span className="text-text-faint">·</span>
            <span>{story.readTime}</span>
            <span className="ml-auto inline-flex items-center gap-1 rounded border border-current/30 bg-current/5 px-2 py-0.5 text-[10px] font-semibold text-text-primary transition-all hover:bg-current/10">
              Baca cerita
              <ArrowRight className="h-2.5 w-2.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

function GlobalStoryCard({
  story,
  compact = false,
}: {
  story: ReturnType<typeof getStoriesByCategory>[number];
  compact?: boolean;
}) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-bg-secondary transition-all hover:border-border-strong">
      <Link href={`/crypto/detail/${story.id}`} className="flex h-full flex-col">
        <div
          className="relative flex h-1.5 w-full bg-hero-global"
          aria-hidden
        />
        <div className="flex flex-1 flex-col gap-2 p-3.5 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 font-mono text-[9.5px] font-semibold uppercase tracking-widest text-cat-global">
              Global
            </span>
            <span className="font-mono text-[9.5px] text-text-faint">
              {story.timeAgo}
            </span>
          </div>
          <h3 className="font-mono text-[16.5px] font-bold leading-[1.2] tracking-tight text-text-primary sm:text-[18px]">
            {story.title}
          </h3>
          {!compact && (
            <p className="line-clamp-2 text-[12px] leading-snug text-text-secondary">
              {story.summary}
            </p>
          )}
          <div className="mt-auto" />
          <div className="flex items-center justify-between gap-2 border-t border-border pt-2 font-mono text-[9.5px] text-text-muted">
            <span className="line-clamp-1">
              {story.flag && (
                <span className="mr-1 text-[11px]" aria-hidden>
                  {story.flag}
                </span>
              )}
              <span className="font-bold tabular-nums text-cat-global">
                {story.sourceCount}
              </span>
              <span> sumber</span>
              <span className="mx-1">·</span>
              <span>{story.readTime}</span>
            </span>
            <ArrowRight className="h-3 w-3 text-text-faint transition-all group-hover:translate-x-0.5 group-hover:text-text-secondary" aria-hidden />
          </div>
        </div>
      </Link>
    </article>
  );
}
