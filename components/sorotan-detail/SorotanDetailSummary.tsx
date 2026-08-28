"use client";

interface SorotanDetailSummaryProps {
  /** 1-2 sentence summary, rendered as the lead paragraph. */
  summary: string;
}

/** "Apa yang terjadi" section — the lead paragraph that tells the
 *  reader the gist of the story in one breath. */
export function SorotanDetailSummary({ summary }: SorotanDetailSummaryProps) {
  return (
    <section
      aria-label="Apa yang terjadi"
      className="relative mt-6 min-h-[160px]"
    >
      <h2 className="label mb-2 text-text-secondary">Apa yang terjadi</h2>
      <p className="text-[14.5px] leading-relaxed text-text-primary sm:text-[15px]">
        {summary}
      </p>
    </section>
  );
}