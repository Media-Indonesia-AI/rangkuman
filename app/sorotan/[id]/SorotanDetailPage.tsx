import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Tag, Newspaper, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StoryTimeline } from "@/components/StoryTimeline";
import { KeyDataBlock } from "@/components/KeyDataBlock";
import { MarketSnapshotCompact } from "@/components/MarketSnapshotCompact";
import { RelatedStoriesList } from "@/components/RelatedStoriesList";
import { ShareButton } from "@/components/ShareButton";
import { SavedButton } from "@/components/SavedButton";
import {
  CATEGORY_CONFIG,
  TODAY_HIGHLIGHTS,
  STORIES_BY_CATEGORY,
  getRelatedStories,
  type Highlight,
} from "@/lib/mock/highlights";
import { EKONOMI_INDICATORS } from "@/lib/mock/category-widgets";
import { cn } from "@/lib/utils";

interface PageProps {
  params: { id: string };
}

/** Flatten all stories (top + per-category) so the dynamic route handles all IDs. */
const ALL_STORIES: Highlight[] = [
  ...TODAY_HIGHLIGHTS,
  ...Object.values(STORIES_BY_CATEGORY).flat(),
];

const HERO_GRADIENT: Record<string, string> = {
  saham: "bg-hero-saham",
  bisnis: "bg-hero-bisnis",
  ekonomi: "bg-hero-ekonomi",
  kebijakan: "bg-hero-kebijakan",
  global: "bg-hero-global",
  komoditas: "bg-hero-komoditas",
};

export default function SorotanDetailPage({ params }: PageProps) {
  const story = ALL_STORIES.find((h) => h.id === params.id);
  if (!story) notFound();

  const primary = CATEGORY_CONFIG[story.category];
  const affected = story.affectedCategories
    .map((c) => CATEGORY_CONFIG[c])
    .filter((cfg, i, self) => self.findIndex((x) => x.label === cfg.label) === i);

  const related = getRelatedStories(story, 3);
  // First 6 macro indicators for sidebar
  const sidebarMarkets = EKONOMI_INDICATORS.slice(0, 6).map((m) => ({
    id: m.id,
    label: m.label,
    value: m.value,
    change: m.change,
    changeUnit: (m.changeUnit ?? "%") as "%" | "bps" | "",
  }));

  return (
    <>
      <Navbar />

      <main className="relative z-10 mx-auto max-w-5xl px-4 pb-16 pt-3 sm:px-6 sm:pt-5 lg:max-w-6xl lg:px-8">
        {/* FIX 4: Sr-only H1 for SEO — story title is the page context, brand is the H1 */}
        <h1 className="sr-only">
          Rangkuman &mdash; Cerita: {story.title}
        </h1>

        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-3 flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-widest text-text-muted"
        >
          <Link href="/" className="hover:text-text-secondary">
            Beranda
          </Link>
          <ChevronRight className="h-2.5 w-2.5" aria-hidden />
          <Link href="/" className="hover:text-text-secondary">
            Sorotan
          </Link>
          <ChevronRight className="h-2.5 w-2.5" aria-hidden />
          <span className="text-text-secondary">#{story.rank}</span>
        </nav>

        {/* 2-col layout: main content (8/12) + sidebar (4/12) on lg+ */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {/* MAIN COLUMN */}
          <article className="min-w-0 lg:col-span-8">
            {/* Header card with hero gradient + glass effect */}
            <header className="glass-card relative overflow-hidden rounded-xl border border-border-strong bg-bg-secondary p-5 sm:p-7">
              {/* Top hero gradient strip */}
              <div
                className={cn(
                  "absolute inset-x-0 top-0 h-1.5 opacity-90",
                  HERO_GRADIENT[story.category] ?? "bg-hero-saham",
                )}
                aria-hidden
              />
              {/* Faint pattern overlay */}
              <div className="pattern-dot-grid pointer-events-none absolute inset-0 opacity-30" aria-hidden />

              <div className="relative">
                {/* Category badges row */}
                <div className="mb-3 flex flex-wrap items-center gap-1.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded border bg-bg-tertiary px-2 py-0.5 font-mono text-[10.5px] font-semibold uppercase tracking-wider",
                      primary.colorClass,
                      "border-current/30",
                    )}
                  >
                    <Tag className="h-2.5 w-2.5" aria-hidden />
                    {primary.label}
                  </span>
                  {affected
                    .filter((c) => c.label !== primary.label)
                    .slice(0, 4)
                    .map((c) => (
                      <span
                        key={c.label}
                        className={cn(
                          "inline-flex items-center gap-1 rounded border border-current/20 bg-bg-tertiary/60 px-1.5 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-wider",
                          c.colorClass,
                        )}
                      >
                        {c.label}
                      </span>
                    ))}
                  <span className="ml-auto font-mono text-[10.5px] text-text-faint">
                    Rank #{story.rank} · {story.timeAgo}
                  </span>
                </div>

                {/* Title (FIX 4: H1 → H2 since sr-only H1 is page H1) */}
                <h2 className="font-serif text-[24px] font-bold leading-tight tracking-tight text-text-primary sm:text-[36px] sm:leading-[1.1]">
                  {story.title}
                </h2>

                {/* Meta line */}
                <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10.5px] text-text-muted">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" aria-hidden />
                    {story.readTime} baca
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Newspaper className="h-3 w-3" aria-hidden />
                    {story.sourceCount} sumber
                  </span>
                  <span>·</span>
                  <span className="line-clamp-1">
                    {story.sources.slice(0, 3).join(", ")}
                    {story.sources.length > 3 && ` +${story.sources.length - 3}`}
                  </span>
                </div>

                {/* Action row */}
                <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
                  <ShareButton
                    title={story.title}
                    url={`https://rangkuman.news/sorotan/${story.id}`}
                  />
                  <SavedButton
                    id={story.id}
                    kind="story"
                    publishedAt={new Date().toISOString().slice(0, 10)}
                    variant="default"
                  />
                </div>
              </div>
            </header>

            {/* Summary section */}
            <section aria-label="Apa yang terjadi" className="mt-6">
              <h2 className="label mb-2 text-text-secondary">Apa yang terjadi</h2>
              <p className="text-[14.5px] leading-relaxed text-text-primary sm:text-[15px]">
                {story.summary}
              </p>
            </section>

            {/* Data Kunci — 3 big numbers callout (only if story has keyData) */}
            {story.keyData && story.keyData.length > 0 && (
              <div className="mt-4">
                <KeyDataBlock points={story.keyData} />
              </div>
            )}

            {/* Tags */}
            {story.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                {story.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded border border-border bg-bg-tertiary px-2 py-0.5 font-mono text-[10.5px] text-text-secondary"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Timeline — only on lg+ does it stay in main col, on smaller it spans full width below */}
            <section aria-label="Timeline" className="mt-7">
              <div className="mb-3 flex items-end justify-between border-b border-border-strong pb-2">
                <div>
                  <h2 className="label text-text-secondary">Timeline</h2>
                  <h3 className="text-[15px] font-bold tracking-tight text-text-primary sm:text-[16px]">
                    {story.events.length} peristiwa dari {story.sources.length} media
                  </h3>
                </div>
                <span className="font-mono text-[10.5px] text-text-faint">
                  Kronologis
                </span>
              </div>

              <StoryTimeline events={story.events} />
            </section>

            {/* Sources list */}
            <section aria-label="Daftar sumber" className="mt-8">
              <div className="mb-2 flex items-end justify-between border-b border-border-strong pb-2">
                <div>
                  <h2 className="label text-text-secondary">Sumber</h2>
                  <h3 className="text-[15px] font-bold tracking-tight text-text-primary sm:text-[16px]">
                    {story.sourceCount} media meliput cerita ini
                  </h3>
                </div>
              </div>
              <ul className="space-y-1">
                {story.sources.map((src) => (
                  <li
                    key={src}
                    className="flex items-center justify-between border-b border-border/50 py-1.5"
                  >
                    <span className="text-[12.5px] text-text-primary">{src}</span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
                      media
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Tickers affected */}
            {story.tickers && story.tickers.length > 0 && (
              <section aria-label="Saham terkait" className="mt-6">
                <h2 className="label mb-2 text-text-secondary">Saham terkait</h2>
                <div className="flex flex-wrap items-center gap-1.5">
                  {story.tickers.map((t) => {
                    const href = `/stock/${t}`;
                    return (
                      <Link
                        key={t}
                        href={href}
                        className="group inline-flex items-center gap-1 rounded border border-cat-saham-line bg-cat-saham-soft px-2.5 py-1 font-mono text-[11px] font-semibold text-cat-saham transition-colors hover:bg-cat-saham-soft/70"
                      >
                        {t}
                        <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden />
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </article>

          {/* SIDEBAR (sticky on lg+) */}
          <aside className="min-w-0 space-y-4 lg:col-span-4">
            <div className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:pr-1">
              <MarketSnapshotCompact
                items={sidebarMarkets}
                label="Pasar Hari Ini"
                meta="real-time"
              />
              {related.length > 0 && (
                <RelatedStoriesList
                  stories={related}
                  excludeId={story.id}
                  className="mt-4"
                  variant="featured"
                />
              )}
            </div>
          </aside>
        </div>

        {/* Back to sorotan — full width below grid */}
        <div className="mt-8 flex flex-col items-center gap-2 border-t border-border pt-5 sm:flex-row sm:justify-between">
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-text-muted transition-colors hover:text-text-secondary"
          >
            <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" aria-hidden />
            Lihat sorotan lain
          </Link>
          <p className="text-[11px] text-text-muted">
            Cerita ini bagian dari{" "}
            <Link href={primary.slug} className="font-medium text-text-secondary hover:text-brand">
              topikan {primary.label}
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}