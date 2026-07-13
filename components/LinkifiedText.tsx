import { linkifyText, type LinkifySegment } from "@/lib/util/linkify";

interface LinkifiedTextProps {
  /** Plain text that may contain inline URLs. */
  text: string;
}

/**
 * Render a string with any inline `http(s)://…` URLs turned into
 * external anchors. Surrounding prose is emitted as `<span>` so the
 * caller can keep the existing `<p>` wrapper for typography.
 *
 * No `"use client"` directive — pure render with no hooks, safe to
 * import into either a server or client tree.
 *
 * Anchor styling follows the inline-text-link convention from
 * `components/InfoPage.tsx` (`text-brand underline-offset-2
 * hover:underline`). `break-all` keeps long URLs from overflowing
 * narrow viewports.
 */
export function LinkifiedText({ text }: LinkifiedTextProps) {
  const segments = linkifyText(text);

  return (
    <>
      {segments.map((seg, i) => {
        if (typeof seg === "string") {
          // String prose segments are emitted as <span> so the parent
          // <p> keeps a uniform child shape — no React warnings about
          // mixed text + element children across hydration.
          return <span key={i}>{seg}</span>;
        }
        return (
          <a
            key={i}
            href={seg.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand underline-offset-2 hover:underline break-all"
          >
            {seg.url}
          </a>
        );
      })}
    </>
  );
}

/** Re-exported for tests / consumers that want to introspect the
 *  parser shape without importing from `lib/util/linkify` directly. */
export type { LinkifySegment };