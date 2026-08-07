"use client";

import { LoginPromptOverlay } from "@/components/LoginPromptOverlay";

interface SorotanDetailSummaryProps {
  /** 1-2 sentence summary, rendered as the lead paragraph. */
  summary: string;
}

/**
 * "Apa yang terjadi" section — the lead paragraph that tells the
 * reader the gist of the story in one breath.
 *
 * Auth-gated: when the visitor isn't signed in, the
 * `<LoginPromptOverlay />` lays a blurred card over the section.
 * `relative min-h-[…]` on the wrapper gives the overlay a sensible
 * bounding box so the blur + card sit nicely above the lead
 * paragraph instead of collapsing to a 1px strip.
 */
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
      <LoginPromptOverlay title="Masuk dulu untuk baca ringkasan cerita" />
    </section>
  );
}