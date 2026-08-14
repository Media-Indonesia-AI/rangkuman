/**
 * Cap `text` at `maxChars` characters, breaking at the last word
 * boundary and appending "…" if truncated. Designed for the
 * `og:description` / Twitter `description` fields where Telegram,
 * WhatsApp, X, LinkedIn, and Slack each clip the preview to a
 * roughly 160-character sweet spot. Without clamping, the social
 * preview renders clipped mid-word (e.g. "...3,50-3,75 per…") and
 * reads as broken.
 *
 * The 160-char default matches Telegram / WhatsApp's tighter end
 * of the spectrum — X and LinkedIn tolerate a bit more, but a
 * single helper limit keeps cross-platform previews consistent.
 * Callers that want a different ceiling can pass `maxChars`.
 *
 * Used by the `generateMetadata` exports in:
 *   - `app/sorotan/detail/[id]/page.tsx`
 *   - `app/story/[id]/page.tsx`
 *   - `app/stock/[kode]/page.tsx`
 *   - `app/stock/[kode]/[recapDate]/page.tsx`
 *   - `app/sektor/[slug]/page.tsx`
 *
 * The word-boundary break (`lastIndexOf(" ")`) keeps the ellipsis
 * from landing mid-token. If the input has no spaces inside the
 * cap (e.g. one very long word), we fall back to a hard slice so
 * the output is still bounded — slightly ugly but never longer
 * than `maxChars + 1` (the appended `…`).
 */
export function clampDescription(text: string, maxChars = 160): string {
  if (text.length <= maxChars) return text;
  const slice = text.slice(0, maxChars);
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice).trimEnd() + "…";
}