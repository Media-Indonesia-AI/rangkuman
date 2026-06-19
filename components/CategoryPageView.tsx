import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TopTicker } from "@/components/TopTicker";
import { StoryHero } from "@/components/StoryHero";
import { StoryEditorial } from "@/components/StoryEditorial";
import { StoryCompact } from "@/components/StoryCompact";
import { GradientDivider } from "@/components/GradientDivider";
import { MacroIndicators } from "@/components/MacroIndicators";
import { PolicyTracker } from "@/components/PolicyTracker";
import { WorldIndices } from "@/components/WorldIndices";
import {
  CATEGORY_CONFIG,
  getStoriesByCategory,
  type Category,
} from "@/lib/mock/highlights";
import {
  EKONOMI_INDICATORS,
  GLOBAL_INDICES,
} from "@/lib/mock/category-widgets";

interface CategoryPageViewProps {
  category: Category;
}

/** Map of which widget to render per category. Bisnis has no widget. */
const CATEGORY_WIDGET: Partial<Record<Category, React.ReactNode>> = {
  ekonomi: <MacroIndicators indicators={EKONOMI_INDICATORS} />,
  kebijakan: <PolicyTracker />,
  global: <WorldIndices indices={GLOBAL_INDICES} />,
};

const WIDGET_LABEL: Partial<Record<Category, string>> = {
  ekonomi: "Indikator Makro",
  kebijakan: "Tracker Kebijakan",
  global: "Bursa Global",
};

export function CategoryPageView({ category }: CategoryPageViewProps) {
  const cfg = CATEGORY_CONFIG[category];
  const stories = getStoriesByCategory(category);
  const lead = stories[0];
  const secondary = stories.slice(1, 4); // 3-col grid
  const more = stories.slice(4); // compact list

  return (
    <>
      <TopTicker />
      <Navbar />

      <main className="relative z-10 mx-auto max-w-4xl px-4 pb-16 pt-3 sm:px-6 sm:pt-5 lg:max-w-6xl lg:px-8">
        {/* FIX 4: Sr-only H1 for SEO — visible heading is the category H2 below */}
        <h1 className="sr-only">
          Rangkuman &mdash; Kategori: {cfg.label}
        </h1>

        {/* 1. HERO — lead story */}
        {lead && (
          <section aria-label={`Cerita utama ${cfg.label}`} className="mt-4">
            <StoryHero highlight={lead} />
          </section>
        )}

        {/* 2. CATEGORY WIDGET — deals / indicators / calendar */}
        {CATEGORY_WIDGET[category] && (
          <section aria-label={WIDGET_LABEL[category]} className="mt-4">
            {CATEGORY_WIDGET[category]}
          </section>
        )}

        {/* 3. 3-col editorial grid — secondary stories */}
        {secondary.length > 0 && (
          <section aria-label={`Cerita ${cfg.label} lainnya`} className="mt-8">
            <div className="mb-3 flex items-end justify-between border-b border-border-strong pb-1.5">
              <h3 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
                Sedang terjadi · {cfg.label}
              </h3>
              <span className="font-mono text-[10px] text-text-faint">
                Top {secondary.length} · 1 jam terakhir
              </span>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {secondary.map((h) => (
                <StoryEditorial key={h.id} highlight={h} />
              ))}
            </div>
          </section>
        )}

        <GradientDivider spacing="my-8" />

        {/* 4. Compact list — more stories */}
        {more.length > 0 && (
          <section aria-label={`Lebih banyak ${cfg.label}`} className="mt-2">
            <div className="mb-2 flex items-end justify-between border-b border-border-strong pb-1.5">
              <h3 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
                Lebih banyak · {cfg.label}
              </h3>
              <span className="font-mono text-[10px] text-text-faint">
                {more.length} cerita tambahan
              </span>
            </div>
            <div>
              {more.map((h, i) => (
                <StoryCompact key={h.id} highlight={h} rank={5 + i} />
              ))}
            </div>
          </section>
        )}

        <GradientDivider spacing="my-8" />

        {/* Footer */}
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
