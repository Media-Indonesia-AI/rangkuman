import type { Metadata } from "next";
import { POLICY_TOPICS } from "@/lib/mock/policy-tracker";

export function generateStaticParams() {
  return POLICY_TOPICS.map((t) => ({ slug: t.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const topic = POLICY_TOPICS.find((t) => t.slug === params.slug);
  if (!topic) return { title: "Topik tidak ditemukan · Rangkuman" };
  return {
    title: `${topic.topic} · Kebijakan · Rangkuman`,
    description: topic.brief,
    openGraph: {
      title: `${topic.topic} · Tracker Kebijakan Rangkuman`,
      description: topic.brief,
      url: `https://rangkuman.news/kebijakan/${topic.slug}/`,
      siteName: "Rangkuman",
      locale: "id_ID",
      type: "article",
    },
  };
}

export { default } from "./KebijakanDetailPage";