import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CryptoDetailPage } from "@/components/crypto-detail";
import type { MarketSnapshotItem } from "@/components/MarketSnapshotCompact";
import { EKONOMI_INDICATORS } from "@/lib/mock/category-widgets";
import {
  CATEGORY_CONFIG,
  getAllStories,
  getHighlightById,
  getRelatedStories,
} from "@/lib/mock/highlights";

interface PageProps {
  params: { id: string };
}

export function generateStaticParams() {
  return getAllStories().map((h) => ({ id: h.id }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const story = getHighlightById(params.id);
  if (!story) return { title: "Sorotan tidak ditemukan" };
  return {
    title: `${story.title} — Rangkuman`,
    description: story.summary,
    openGraph: {
      title: story.title,
      description: story.summary,
      type: "article",
      publishedTime: new Date().toISOString(),
    },
  };
}

export default function CryptoDetailRoutePage({ params }: PageProps) {
  const story = getHighlightById(params.id);
  if (!story) notFound();

  // Map each affected Category to its display config (label + color),
  // deduped so a story that lists the same category twice still only
  // shows one chip in the badge row.
  const primary = CATEGORY_CONFIG[story.category];
  const affected = story.affectedCategories
    .map((c) => CATEGORY_CONFIG[c])
    .filter(
      (cfg, i, self) => self.findIndex((x) => x.label === cfg.label) === i,
    );

  const related = getRelatedStories(story, 3);

  // First 6 macro indicators for the right-rail sidebar. Imported
  // `MarketSnapshotItem` directly (instead of indexed access through
  // `CryptoDetailPageProps["markets"]`) so the type is unambiguous
  // and doesn't depend on TS 4.5+ `import { type X }` syntax in
  // nested import statements.
  const markets: MarketSnapshotItem[] = EKONOMI_INDICATORS.slice(0, 6).map(
    (m) => ({
      id: m.id,
      label: m.label,
      value: m.value,
      change: m.change,
      changeUnit: (m.changeUnit ?? "%") as "%" | "bps" | "",
    }),
  );

  return (
    <CryptoDetailPage
      story={story}
      primary={primary}
      affected={affected}
      markets={markets}
      related={related}
    />
  );
}