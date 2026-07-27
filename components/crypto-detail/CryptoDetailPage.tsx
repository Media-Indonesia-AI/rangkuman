import type { Highlight } from "@/lib/mock/highlights";
import type { MarketSnapshotItem } from "@/components/MarketSnapshotCompact";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CryptoDetailBreadcrumb } from "./CryptoDetailBreadcrumb";
import { CryptoDetailHeader } from "./CryptoDetailHeader";
import { CryptoDetailSummary } from "./CryptoDetailSummary";
import { CryptoDetailTags } from "./CryptoDetailTags";
import { CryptoDetailKeyData } from "./CryptoDetailKeyData";
import { CryptoDetailTimeline } from "./CryptoDetailTimeline";
import { CryptoDetailSources } from "./CryptoDetailSources";
import { CryptoDetailTickers } from "./CryptoDetailTickers";
import { CryptoDetailSidebar } from "./CryptoDetailSidebar";
import { CryptoDetailBackLink } from "./CryptoDetailBackLink";

interface CategoryConfig {
  label: string;
  colorClass: string;
}

export interface CryptoDetailPageProps {
  story: Highlight;
  primary: CategoryConfig;
  /** De-duplicated list of affected category configs (including `primary`). */
  affected: CategoryConfig[];
  markets: MarketSnapshotItem[];
  related: Highlight[];
}

/**
 * `/crypto/detail/[id]` detail page — thin orchestrator that composes the
 * small widgets in `components/crypto-detail/`. All data fetching &
 * resolution (story lookup by id, related stories, sidebar markets,
 * category config mapping) lives in the route entry
 * `app/crypto/detail/[id]/page.tsx` so this component stays purely
 * presentational and free of `notFound()` / `generateStaticParams`
 * / `generateMetadata` noise.
 *
 * Layout: sticky right rail (`lg:col-span-4`) + main column
 * (`lg:col-span-8`). On smaller breakpoints the sidebar stacks below.
 */
export function CryptoDetailPage({
  story,
  primary,
  affected,
  markets,
  related,
}: CryptoDetailPageProps) {
  return (
    <>
      <Navbar />

      <main className="relative z-10 mx-auto max-w-5xl px-4 pb-16 pt-3 sm:px-6 sm:pt-5 lg:max-w-6xl lg:px-8">
        {/* sr-only H1 — story title is the page context, brand is the H1 */}
        <h1 className="sr-only">
          Rangkuman &mdash; Cerita: {story.title}
        </h1>

        <CryptoDetailBreadcrumb rank={story.rank} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {/* MAIN COLUMN */}
          <article className="min-w-0 lg:col-span-8">
            <CryptoDetailHeader
              story={story}
              primary={primary}
              affected={affected}
            />

            <CryptoDetailSummary summary={story.summary} />
            <CryptoDetailTags tags={story.tags} />
            <CryptoDetailKeyData points={story.keyData ?? []} />

            <CryptoDetailTimeline
              events={story.events}
              sourceCount={story.sourceCount}
            />

            <CryptoDetailSources
              sources={story.sources}
              count={story.sourceCount}
            />

            <CryptoDetailTickers tickers={story.tickers ?? []} />
          </article>

          {/* SIDEBAR (sticky on lg+) */}
          <CryptoDetailSidebar
            markets={markets}
            related={related}
            storyId={story.id}
          />
        </div>

        <CryptoDetailBackLink
          categorySlug={primary.label.toLowerCase()}
          categoryLabel={primary.label}
        />
      </main>
      <Footer />
    </>
  );
}