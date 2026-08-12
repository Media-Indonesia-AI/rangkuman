import { ImageResponse } from "next/og";
import { loadHeadlineById } from "@/lib/api/cache";

export const runtime = "nodejs";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };
export const alt = "Rangkuman story preview";

// Brand palette pulled from app/globals.css so the rendered card
// matches the rest of the app's dark theme.
const BRAND = "#F7931A";
const BG = "#0A0A0B";
const BG_SOFT = "#131316";
const TEXT_PRIMARY = "#FAFAFA";
const TEXT_MUTED = "#A1A1AA";
const BORDER = "#27272A";

/** Truncate text to `maxChars` characters, breaking at the last
 *  word boundary, and append "…" if truncated. Avoids runtime CSS
 *  `line-clamp` because @vercel/og (the engine behind
 *  `next/og`'s `ImageResponse`) only supports a subset of CSS. */
function clamp(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const slice = text.slice(0, maxChars);
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice).trimEnd() + "…";
}

/**
 * Dynamic OG / Twitter card route at `/og/[id]/`.
 *
 * Telegram, WhatsApp, Facebook, X (Twitter), LinkedIn, and Slack
 * all fetch a shared URL and look for `og:title`, `og:description`,
 * and `og:image` `<meta>` tags to render the link preview. The
 * upstream backend doesn't ship a per-story thumbnail in the
 * wire format (`HeadlineDetail` only carries title + summary +
 * keywords + topics), so this route renders a story-specific
 * 1200x630 PNG on demand with the brand chrome + title + summary.
 *
 * `next/og`'s `ImageResponse` runs Satori under the hood and is
 * built into Next.js 14 — no extra dependencies. Styling must be
 * inline (no Tailwind, no CSS modules) because Satori only
 * understands a subset of CSS applied as `style={...}` props.
 *
 * Failure modes:
 *   - API unreachable / headline not found → fall through to a
 *     generic "Cerita dari Rangkuman" card so the share preview
 *     never errors out (a broken OG image makes some scrapers
 *     drop the preview entirely).
 *   - Title or summary longer than the card can fit → clamp to
 *     ~140 chars for the title and ~200 for the summary at the
 *     last word boundary so we never overflow the 1200x630 frame.
 *
 * Cache headers aren't set explicitly — the OG scrapers re-fetch
 * each share, so we want a fresh render every time. (The
 * `loadHeadlineById` request-level cache dedups simultaneous
 * scrapers hitting the same URL.)
 */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  let title = "Cerita dari Rangkuman";
  let summary =
    "Rangkuman bisnis & ekonomi Indonesia dari 64 sumber, dikurasi tiap hari.";
  let category: string | null = null;
  try {
    const detail = await loadHeadlineById(params.id);
    if (detail.title) title = detail.title;
    if (detail.summary) summary = detail.summary;
    const firstTopic = detail.topics?.[0]?.name;
    if (firstTopic) category = firstTopic.toUpperCase();
  } catch {
    // API unreachable / 404 — fall through with the default
    // title and summary so the share preview still renders.
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: BG,
          color: TEXT_PRIMARY,
          fontFamily: "system-ui, sans-serif",
          padding: 64,
        }}
      >
        {/* Top row: brand mark + site */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: BRAND,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0A0A0B",
              fontWeight: 800,
              fontSize: 26,
            }}
          >
            R
          </div>
          <span style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.5 }}>
            Rangkuman
          </span>
          <span
            style={{
              fontSize: 24,
              color: TEXT_MUTED,
              marginLeft: "auto",
              fontFamily: "monospace",
            }}
          >
            rangkuman.news
          </span>
        </div>

        {/* Category badge — hidden if the headline has no topics. */}
        {category && (
          <div style={{ display: "flex", marginTop: 44 }}>
            <div
              style={{
                display: "flex",
                padding: "8px 16px",
                background: BG_SOFT,
                border: `1px solid ${BORDER}`,
                borderRadius: 6,
                color: BRAND,
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: 2,
              }}
            >
              {category}
            </div>
          </div>
        )}

        {/* Title */}
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 64,
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: -1,
            color: TEXT_PRIMARY,
          }}
        >
          {clamp(title, 140)}
        </div>

        {/* Summary */}
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 28,
            lineHeight: 1.45,
            color: TEXT_MUTED,
            fontWeight: 400,
          }}
        >
          {clamp(summary, 200)}
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: "auto",
            paddingTop: 28,
            borderTop: `1px solid ${BORDER}`,
            color: TEXT_MUTED,
            fontSize: 22,
            fontFamily: "monospace",
          }}
        >
          <span>Rangkuman · bisnis &amp; ekonomi Indonesia</span>
          <span style={{ marginLeft: "auto" }}>
            Baca lebih sedikit, tahu lebih banyak
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
