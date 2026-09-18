"use client";

interface NewsletterFloatingPillProps {
  className?: string;
}

/**
 * Floating "Kirim Berita ke WhatsApp" pill — DISABLED.
 *
 * The WhatsApp broadcast feature is currently hidden product-wide.
 * This component still mounts (it's referenced from the root layout)
 * but always renders `null` so callers don't have to know about the
 * flag and re-introducing the pill is a single revert away.
 *
 * Restore the original behaviour by reverting to the previous
 * implementation (see git history).
 */
export function NewsletterFloatingPill(_props: NewsletterFloatingPillProps) {
  return null;
}