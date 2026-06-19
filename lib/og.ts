import type { Metadata } from "next";

const SITE_URL = "https://rangkuman.news";
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
