/**
 * Take the first meaningful letter(s) of a media outlet's name.
 *   "CNBC Indonesia"   -> "CI"
 *   "Bisnis.com"       -> "B"
 *   "Bloomberg"        -> "B"
 *   "Investing.com"    -> "I"
 *   "IPOT"             -> "I"
 */
export function initialsOf(name: string): string {
  const cleaned = name
    .replace(/[.,]/g, " ")
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  if (cleaned.length === 0) return "·";
  if (cleaned.length === 1) return cleaned[0].slice(0, 1).toUpperCase();
  return (cleaned[0][0] + cleaned[1][0]).toUpperCase();
}

/**
 * Reduce an article URL to the publisher's homepage
 * (`protocol://host`, no path / query / fragment). Lets a source-bar
 * chip open the publisher's landing page rather than the specific
 * article the recap was built from. Accepts both a full URL
 * (`https://www.bloomberg.com/news/2026-06-07/…`) and a bare
 * hostname (`market.bisnis.com`); the latter is normalized to
 * `https://` before parsing. Returns `undefined` for any input the
 * URL parser rejects, so the caller can drop the link rather than
 * ship a broken `href`.
 */
export function sourceHomepage(articleUrl: string): string | undefined {
  if (!articleUrl) return undefined;
  const normalized = /^https?:\/\//i.test(articleUrl)
    ? articleUrl
    : `https://${articleUrl}`;
  try {
    return new URL(normalized).origin;
  } catch {
    return undefined;
  }
}
