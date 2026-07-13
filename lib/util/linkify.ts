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