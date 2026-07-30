import type { Metadata } from "next";

/**
 * Canonical public site origin. Single source of truth for any
 * component that needs to assemble a fully-qualified absolute URL
 * (Open Graph, share links, mailto targets, etc.).
 *
 * Reads `window.location.origin` at module load when running on
 * the client, so dev tunnels (`http://192.168.0.105:8080/`),
 * staging hosts, and production all report the right host
 * without changing source. Falls back to the production origin
 * when there's no `window` (SSR / Node-side metadata builders
 * and OG crawler responses), so server-rendered Twitter cards
 * and Open Graph tags continue to emit the real absolute URL
 * even though they can't introspect the request host there.
 */
export const SITE_URL =
  typeof window !== "undefined"
    ? window.location.origin
    : "https://rangkuman.news";

/** Display name shown in OG / Twitter card metadata. */
const SITE_NAME = "Rangkuman";

const LOCALE = "id_ID";

interface BuildOgInput {
  /** Page title (without site suffix). */
  title: string;
  /** Page description. */
  description: string;
  /** Page path, e.g. "/trending". */
  path: string;
  /** Open Graph type. Defaults to "website". */
  type?: "website" | "article";
  /** Alt text for the OG image. */
  imageAlt?: string;
}

/**
 * Build a complete Metadata object with Open Graph + Twitter card tags
 * for any page on Rangkuman. Centralises OG image, dimensions,
 * locale, and site name so they stay consistent.
 */
export function buildPageMetadata({
  title,
  description,
  path,
  type = "website",
  imageAlt = SITE_NAME,
}: BuildOgInput): Metadata {
  return {
    title,
    description,
    openGraph: {
      type,
      locale: LOCALE,
      url: `${SITE_URL}${path}`,
      siteName: SITE_NAME,
      title,
      description,
      images: [
        {
          url: "/og-default.png",
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-default.png"],
    },
  };
}
