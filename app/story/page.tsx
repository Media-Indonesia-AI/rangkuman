import type { Metadata } from "next";
import StoryPage from "./StoryPage";

export const metadata: Metadata = {
  title: "Stock Story · Rangkuman",
  description:
    "Cerita perkembangan emiten pilihan dalam jangka panjang: akuisisi, transformasi digital, ekspansi, dan lain-lain.",
  openGraph: {
    title: "Stock Story · Rangkuman",
    description: "Cerita perkembangan emiten dalam jangka panjang.",
    url: "https://rangkuman.news/story/",
    siteName: "Rangkuman",
    locale: "id_ID",
    type: "website",
  },
};

// Thin route entry — re-exports the client component from
// `./StoryPage`. Mirrors the pattern used by `app/stock/[kode]/
// page.tsx → ./StockDetailPage` and `app/story/[id]/page.tsx →
// ./StoryDetailPage`.
export default function Page() {
  return <StoryPage />;
}
