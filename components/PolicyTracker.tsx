import Link from "next/link";
import { Scale, ArrowRight, Clock } from "lucide-react";
import { POLICY_TOPICS, getPolicyStatusMeta, type PolicyTopic } from "@/lib/mock/policy-tracker";
import { cn } from "@/lib/utils";

interface PolicyTrackerProps {
  className?: string;
  /** Optional filter: only show topics with these statuses. */
  filterStatus?: PolicyTopic["currentStatus"][];
  /** Limit number of topics shown. */
  limit?: number;
}

/**
 * PolicyTracker — trending Indonesian policy topics with status & timeline.
 *
 * Replaces the old "Kalender Regulasi" widget on /kebijakan/.
 *
 * Each card shows:
 * - Status badge (color-coded: draft / dpr / public_hearing / approved / delayed / rejected)
 * - Topic title + 1-line brief
 * - Mini horizontal timeline (last 3 events, color-coded dots)
 * - Affected sector tags
 * - Story count + "Lihat cerita" link
 */
export function PolicyTracker({ className, filterStatus, limit }: PolicyTrackerProps) {
  let topics = [...POLICY_TOPICS].sort(
    (a, b) => new Date(b.timeline[0]?.date ?? 0).getTime() - new Date(a.timeline[0]?.date ?? 0).getTime(),
  );

  if (filterStatus && filterStatus.length > 0) {
    topics = topics.filter((t) => filterStatus.includes(t.currentStatus));
  }

  if (limit && limit > 0) {
    topics = topics.slice(0, limit);
  }

  return (
    <section
      aria-label="Tracker kebijakan"
      className={cn("rounded-lg border border-border-strong bg-bg-secondary/40", className)}
    >
      <div className="flex items-center justify-between border-b border-border-strong px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <Scale className="h-3.5 w-3.5 text-cat-kebijakan" aria-hidden />
          <h3 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
            Tracker Kebijakan
          </h3>
        </div>
        <span className="font-mono text-[9.5px] uppercase tracking-widest text-text-faint">
          Topik yang lagi dibahas
        </span>
      </div>

      <ul>
        {topics.map((topic, i) => (
          <PolicyTrackerCard
            key={topic.id}
            topic={topic}
            isLast={i === topics.length - 1}
          />
        ))}
      </ul>

      {topics.length === 0 && (
        <div className="px-4 py-8 text-center text-[12px] text-text-faint">
          Belum ada topik kebijakan yang lagi dibahas.
        </div>
      )}
    </section>
  );
}

function PolicyTrackerCard({ topic, isLast }: { topic: PolicyTopic; isLast: boolean }) {
  const statusMeta = getPolicyStatusMeta(topic.currentStatus);
  const timelineToShow = topic.timeline.slice(0, 3);

  return (
    <li
      className={cn(
        "px-4 py-3.5 transition-colors hover:bg-bg-tertiary/30",
        !isLast && "border-b border-border/60",
      )}
    >
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:gap-4">
        {/* Left column: status + topic + brief */}
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider",
                statusMeta.color,
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", statusMeta.dot)} aria-hidden />
              {statusMeta.label}
            </span>
            <span className="font-mono text-[9.5px] text-text-faint">
              · {topic.storyCount} cerita
            </span>
            <span className="font-mono text-[9.5px] text-text-faint">·</span>
            <span className="inline-flex items-center gap-0.5 font-mono text-[9.5px] text-text-faint">
              <Clock className="h-2.5 w-2.5" aria-hidden />
              {topic.lastUpdateTimeAgo}
            </span>
          </div>

          <h4 className="text-[14.5px] font-semibold leading-snug text-text-primary">
            {topic.topic}
          </h4>
          <p className="mt-1 text-[12.5px] leading-snug text-text-secondary">
            {topic.brief}
          </p>

          {/* Mini timeline */}
          <div className="mt-2.5 flex items-center gap-1.5">
            <span className="font-mono text-[9px] uppercase tracking-widest text-text-faint">
              Timeline
            </span>
            <div className="flex flex-1 items-center gap-0.5 overflow-hidden">
              {timelineToShow.map((evt, idx) => {
                const evtMeta = getPolicyStatusMeta(evt.status);
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-0.5"
                    title={`${evt.label} — ${evt.timeAgo}`}
                  >
                    <span
                      className={cn("h-1.5 w-1.5 rounded-full", evtMeta.dot)}
                      aria-hidden
                    />
                    {idx < timelineToShow.length - 1 && (
                      <span className="h-px w-3 bg-border" aria-hidden />
                    )}
                  </div>
                );
              })}
            </div>
            <span className="hidden font-mono text-[9.5px] text-text-muted sm:inline">
              {timelineToShow[0]?.label} · {timelineToShow[0]?.timeAgo}
            </span>
          </div>

          {/* Affected sectors */}
          <div className="mt-2 flex flex-wrap items-center gap-1">
            {topic.affectedSectors.slice(0, 4).map((sector) => (
              <span
                key={sector}
                className="rounded border border-border bg-bg-tertiary/50 px-1.5 py-0.5 font-mono text-[9.5px] text-text-muted"
              >
                {sector}
              </span>
            ))}
          </div>
        </div>

        {/* Right column: CTA link */}
        <div className="flex shrink-0 items-center sm:flex-col sm:items-end sm:gap-1">
          <Link
            href={`/kebijakan/${topic.slug}`}
            className="inline-flex items-center gap-1 font-mono text-[10.5px] font-semibold uppercase tracking-widest text-cat-kebijakan transition-colors hover:text-text-primary"
          >
            Lihat cerita
            <ArrowRight className="h-3 w-3" aria-hidden />
          </Link>
          <span className="hidden font-mono text-[9px] text-text-faint sm:inline">
            Update tiap hari
          </span>
        </div>
      </div>
    </li>
  );
}

/** Compact list — used for sidebar or smaller contexts. */
export function PolicyTrackerCompact({ limit = 4 }: { limit?: number }) {
  const topics = POLICY_TOPICS.slice(0, limit);

  return (
    <ul className="space-y-2">
      {topics.map((topic) => {
        const meta = getPolicyStatusMeta(topic.currentStatus);
        return (
          <li key={topic.id} className="flex items-start gap-2.5">
            <span
              className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", meta.dot)}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <Link
                href={`/kebijakan/${topic.slug}`}
                className="text-[12.5px] font-medium leading-snug text-text-primary transition-colors hover:text-cat-kebijakan"
              >
                {topic.topic}
              </Link>
              <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[9.5px] text-text-faint">
                <span className="uppercase tracking-widest">{meta.label}</span>
                <span>·</span>
                <span>{topic.storyCount} cerita</span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
