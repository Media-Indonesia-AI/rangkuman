import type { Metadata } from "next";
import {
  TODAY_HIGHLIGHTS,
  STORIES_BY_CATEGORY,
  type Highlight,
} from "@/lib/mock/highlights";

/** Flatten all stories (top + per-category) so the dynamic route handles all IDs. */
const ALL_STORIES: Highlight[] = [
  ...TODAY_HIGHLIGHTS,
  ...Object.values(STORIES_BY_CATEGORY).flat(),
];

interface PageProps {
  params: { id: string };
}

export function generateStaticParams() {
  return ALL_STORIES.map((h) => ({ id: h.id }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const story = ALL_STORIES.find((h) => h.id === params.id);
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

export { default } from "./SorotanDetailPage";