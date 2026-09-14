/**
 * Split a plain-text string into segments, where each URL is a separate
 * `{ url }` segment and the surrounding prose is a string segment.
 *
 * Pure / server-renderable — no React, no DOM, no client-only deps.
 * Used by `<LinkifiedText>` to turn `HeadlineDetail.summary` (and any
 * other prose that may contain inline URLs) into linkified JSX.
 *
 * Robustness notes:
 * - The regex uses a two-character-class form: greedy body match, then
 *   one final non-punctuation guard. This naturally keeps trailing `.`,
 *   `,`, `;`, `:`, `!`, `?`, `)`, `]`, `}`, `"`, `'` out of the URL
 *   without a separate strip-and-validate loop.
 * - URLs without a scheme (e.g. `www.example.com`) are NOT matched in
 *   v1 — the API has only shipped `https://` URLs to date.
 * - Empty / whitespace-only inputs return `[]` and render as a no-op.
 */
export type LinkifySegment = string | { url: string };

/** Match `http(s)://…` URLs whose final character is not a common
 *  trailing punctuation char. Exposed for tests and for callers that
 *  want to detect URL presence without parsing. */
export const URL_PATTERN =
  /(https?:\/\/[^\s<>"'`{}|\\^]+[^\s<>"'`{}|\\^`.,:;!?)\]}])/g;

export function linkifyText(text: string): LinkifySegment[] {
  if (!text) return [];

  const segments: LinkifySegment[] = [];
  let cursor = 0;

  for (const match of text.matchAll(URL_PATTERN)) {
    const start = match.index ?? 0;
    const url = match[0];

    if (start > cursor) {
      segments.push(text.slice(cursor, start));
    }
    segments.push({ url });
    cursor = start + url.length;
  }

  if (cursor < text.length) {
    segments.push(text.slice(cursor));
  }
  return segments;
}

/**
 * True when `value` is a fully-qualified `http(s)` URL the `URL`
 * constructor can parse. Bare hostnames (`market.bisnis.com`),
 * protocol-relative URLs (`//evil.com/x`), non-http schemes
 * (`javascript:`, `data:`, `mailto:`), and empty / whitespace
 * input all return false — the news-app surface only ever opens
 * http(s) article links, so non-http schemes must not be treated
 * as navigable URLs.
 *
 * Use this as the gate before mounting an external `<a>` click
 * target, so a malformed or hostile `source_url` doesn't end up
 * in the rendered `href`.
 */
export function isUrl(value: string): boolean {
  const trimmed = value?.trim();
  if (!trimmed) return false;
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return false;
  }
  return parsed.protocol === "http:" || parsed.protocol === "https:";
}

/**
 * Normalize a publisher `source_url` into a safe `<a href>` value.
 *
 * - Already an http(s) URL → returned as-is.
 * - Anything else non-empty → `https://` is prepended (the wire
 *   often hands us bare hostnames like `market.bisnis.com`).
 * - Empty / whitespace-only input → `""`, so the anchor's `href`
 *   is a no-op and the click does nothing. Pairs with `isUrl`
 *   for the "should we even render this link?" decision upstream.
 *
 * Bare-hostname prepending is intentionally lossy: we don't try
 * to parse-and-rebuild the value, just slap a scheme on it. A
 * truly garbage value (`"foo bar baz"`) still becomes
 * `https://foo bar baz` — `isUrl` is the right gate for catching
 * those, not this helper.
 */
export function articleHref(sourceUrl: string): string {
  const trimmed = sourceUrl?.trim();
  if (!trimmed) return "";
  return isUrl(trimmed) ? trimmed : `https://${trimmed}`;
}