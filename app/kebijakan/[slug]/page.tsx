import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ArrowRight,
  Clock,
  Tag,
  Newspaper,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Hourglass,
  FileEdit,
  Eye,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TopTicker } from "@/components/TopTicker";
import {
  POLICY_TOPICS,
  getPolicyStatusMeta,
  type PolicyStatus,
} from "@/lib/mock/policy-tracker";
import { getStoriesForTopic, type PolicyStory } from "@/lib/mock/policy-stories";
import { cn } from "@/lib/utils";

const STATUS_ICON: Record<PolicyStatus, React.ComponentType<{ className?: string }>> = {
  draft: FileEdit,
  dpr: Eye,
  public_hearing: AlertCircle,
  approved: CheckCircle2,
  delayed: Hourglass,
  rejected: XCircle,
};

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

export default function PolicyDetailPage({ params }: { params: { slug: string } }) {
  const topic = POLICY_TOPICS.find((t) => t.slug === params.slug);
  if (!topic) notFound();

  const stories = getStoriesForTopic(topic.slug);
  const statusMeta = getPolicyStatusMeta(topic.currentStatus);
  const otherTopics = POLICY_TOPICS.filter((t) => t.id !== topic.id).slice(0, 4);

  return (
    <>
      <TopTicker />
      <Navbar />

      <main className="relative z-10 mx-auto max-w-4xl px-4 pb-16 pt-3 sm:px-6 sm:pt-5 lg:max-w-6xl lg:px-8">
        {/* Sr-only H1 for SEO */}
        <h1 className="sr-only">{topic.topic} — Tracker Kebijakan</h1>

        {/* Back link */}
        <div className="mb-3">
          <Link
            href="/kebijakan"
            className="inline-flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-widest text-text-muted transition-colors hover:text-text-primary"
          >
            <ChevronLeft className="h-3 w-3" aria-hidden />
            Kembali ke Tracker Kebijakan
          </Link>
        </div>

        {/* HERO */}
        <section className="mb-6 rounded-lg border border-border-strong bg-bg-secondary/40 p-4 sm:p-5">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider",
                statusMeta.color,
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", statusMeta.dot)} aria-hidden />
              {statusMeta.label}
            </span>
            <span className="font-mono text-[10px] text-text-faint">
              · Diperbarui {topic.lastUpdateTimeAgo}
            </span>
          </div>

          <h2 className="text-[24px] font-bold leading-tight tracking-tight text-text-primary sm:text-[28px]">
            {topic.topic}
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-text-secondary sm:text-[15px]">
            {topic.brief}
          </p>

          {/* Stats row */}
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border/60 pt-3 text-[11.5px]">
            <div className="flex items-center gap-1.5">
              <Newspaper className="h-3.5 w-3.5 text-text-faint" aria-hidden />
              <span className="font-mono text-text-secondary">
                <span className="font-bold text-text-primary">{stories.length || topic.storyCount}</span> cerita
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-text-faint" aria-hidden />
              <span className="font-mono text-text-secondary">
                Update tiap hari
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-text-faint" aria-hidden />
              <span className="font-mono text-text-secondary">
                {topic.affectedSectors.length} sektor terdampak
              </span>
            </div>
          </div>

          {/* Sector tags */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {topic.affectedSectors.map((sector) => (
              <span
                key={sector}
                className="rounded border border-border bg-bg-tertiary/50 px-2 py-0.5 font-mono text-[10px] text-text-muted"
              >
                {sector}
              </span>
            ))}
          </div>
        </section>

        {/* 2-COL: Timeline (main) + Sidebar */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* MAIN: Timeline + Stories */}
          <div className="lg:col-span-2 space-y-6">
            {/* Full Timeline */}
            <section aria-label="Timeline kebijakan">
              <SectionHeader title="Timeline" subtitle="Perjalanan status kebijakan" />
              <ol className="relative space-y-0 rounded-lg border border-border-strong bg-bg-secondary/30 p-4">
                {topic.timeline.map((evt, idx) => {
                  const evtMeta = getPolicyStatusMeta(evt.status);
                  const StatusIcon = STATUS_ICON[evt.status];
                  const isLast = idx === topic.timeline.length - 1;

                  return (
                    <li key={idx} className="relative flex gap-3 pb-4 last:pb-0">
                      {/* Vertical line + dot */}
                      <div className="relative flex flex-col items-center">
                        <span
                          className={cn(
                            "z-10 flex h-7 w-7 items-center justify-center rounded-full border-2",
                            "border-bg-secondary",
                            evtMeta.dot,
                          )}
                          aria-hidden
                        >
                          <StatusIcon className="h-3 w-3 text-white" />
                        </span>
                        {!isLast && (
                          <span
                            className="absolute left-1/2 top-7 h-full w-px -translate-x-1/2 bg-border"
                            aria-hidden
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pt-0.5">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <span className="text-[14px] font-semibold leading-snug text-text-primary">
                            {evt.label}
                          </span>
                          <span
                            className={cn(
                              "rounded border px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider",
                              evtMeta.color,
                            )}
                          >
                            {evtMeta.label}
                          </span>
                        </div>
                        <p className="mt-0.5 font-mono text-[10.5px] text-text-faint">
                          {evt.date} · {evt.timeAgo}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>

            {/* Related Stories */}
            <section aria-label="Cerita terkait">
              <SectionHeader
                title="Cerita Terkait"
                subtitle={`${stories.length || topic.storyCount} liputan tentang topik ini`}
              />
              {stories.length > 0 ? (
                <ul className="space-y-0 rounded-lg border border-border-strong bg-bg-secondary/30 p-4">
                  {stories.map((story, idx) => (
                    <StoryItem key={story.id} story={story} isLast={idx === stories.length - 1} />
                  ))}
                </ul>
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-bg-secondary/30 p-6 text-center text-[12.5px] text-text-muted">
                  Belum ada cerita terkait.
                </div>
              )}
            </section>
          </div>

          {/* SIDEBAR: Other topics */}
          <aside className="space-y-4">
            <div className="rounded-lg border border-border-strong bg-bg-secondary/40 p-4">
              <h3 className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
                Topik Lainnya
              </h3>
              <ul className="space-y-2.5">
                {otherTopics.map((t) => {
                  const m = getPolicyStatusMeta(t.currentStatus);
                  return (
                    <li key={t.id}>
                      <Link
                        href={`/kebijakan/${t.slug}`}
                        className="group flex items-start gap-2"
                      >
                        <span
                          className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", m.dot)}
                          aria-hidden
                        />
                        <div className="min-w-0 flex-1">
                          <span className="block text-[12.5px] font-medium leading-snug text-text-primary transition-colors group-hover:text-cat-kebijakan">
                            {t.topic}
                          </span>
                          <span className="mt-0.5 block font-mono text-[9.5px] text-text-faint">
                            {m.label} · {t.storyCount} cerita
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <Link
                href="/kebijakan"
                className="mt-3 inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-cat-kebijakan transition-colors hover:text-text-primary"
              >
                Lihat semua topik
                <ArrowRight className="h-3 w-3" aria-hidden />
              </Link>
            </div>

            <div className="rounded-lg border border-border bg-bg-tertiary/50 p-4 text-[11.5px] leading-relaxed text-text-muted">
              <p className="font-semibold text-text-secondary">Tentang Tracker</p>
              <p className="mt-1.5">
                Status, timeline, dan cerita dikurasi tim redaksi dari 64 sumber.
                Update tiap hari, terutama saat ada rapat DPR atau perubahan regulasi.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-2 flex items-end justify-between border-b-2 border-text-primary pb-1.5">
      <div>
        <h3 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-0.5 text-[11px] text-text-faint">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function StoryItem({ story, isLast }: { story: PolicyStory; isLast: boolean }) {
  return (
    <li className={cn("py-2.5", !isLast && "border-b border-border/60")}>
      <article className="group">
        <div className="mb-1 flex flex-wrap items-center gap-1.5 font-mono text-[9.5px] text-text-muted">
          <span>{story.timeAgo}</span>
          <span>·</span>
          <span className="text-text-faint">{story.sources.slice(0, 2).join(", ")}{story.sources.length > 2 ? ` +${story.sources.length - 2}` : ""}</span>
        </div>
        <h4 className="text-[13.5px] font-semibold leading-snug text-text-primary transition-colors group-hover:text-cat-kebijakan sm:text-[14.5px]">
          {story.title}
        </h4>
        <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-text-secondary">
          {story.summary}
        </p>
      </article>
    </li>
  );
}
