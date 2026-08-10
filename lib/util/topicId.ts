import type { StoryTopic } from "@/lib/api";

/**
 * Resolve the `topic_id` that drives the `/saham` page's Story
 * feed. Prefers the canonical `slug` match (URL-safe identifier,
 * stable across renames), then a case-insensitive `name` match.
 * If neither lands on a topic, the first entry in the list wins
 * as a resilience fallback so the page still renders even before
 * a "saham" topic is registered.
 *
 * Return shape: `null` only when the topics list is empty (still
 * loading or backend returned nothing). Every other path returns
 * a string id — callers should pass it through as
 * `topicId={sahamTopicId ?? undefined}` so an in-flight fetch
 * (id is `null`) leaves the underlying request on its cross-topic
 * slot until topics land.
 *
 * Mirror of `findCryptoTopicId` — keep the two helpers in
 * lockstep so the page-level contracts stay symmetric.
 */
export function findSahamTopicId(
  topics: readonly StoryTopic[],
): string | null {
  // 1. Canonical slug match — preferred since slugs are stable,
  //    URL-friendly identifiers the backend exposes as the
  //    authoritative foreign key reference.
  const slugHit = topics.find((t) => t.slug === "saham");
  if (slugHit) return slugHit.id;

  // 2. Case-insensitive name match — covers backends that ship
  //    `name: "Saham"` / `"SAHAM"` while the slug is something
  //    else (e.g. `"saham-indonesia"`).
  const nameHit = topics.find(
    (t) => t.name.trim().toLowerCase() === "saham",
  );
  if (nameHit) return nameHit.id;

  // 3. First-topic fallback — keeps the page rendering even if
  //    no "saham"-tagged topic exists in the dataset yet. The
  //    caller treats any non-null id as "fetch with this filter";
  //    we'd rather show *something* than wait forever.
  return topics[0]?.id ?? null;
}

/**
 * Resolve the `topic_id` that drives the `/crypto` page's live
 * headline feed. Same slug → name → first-fallback chain as
 * `findSahamTopicId` but anchored to the "crypto" topic.
 */
export function findCryptoTopicId(
  topics: readonly StoryTopic[],
): string | null {
  // 1. Canonical slug match — preferred since slugs are stable,
  //    URL-friendly identifiers the backend exposes as the
  //    authoritative foreign key reference.
  const slugHit = topics.find((t) => t.slug === "crypto");
  if (slugHit) return slugHit.id;

  // 2. Case-insensitive name match — covers backends that ship
  //    `name: "Crypto"` / `"crypto"` / `"CRYPTO"` while the slug
  //    is something else (e.g. `"crypto-market"`).
  const nameHit = topics.find(
    (t) => t.name.trim().toLowerCase() === "crypto",
  );
  if (nameHit) return nameHit.id;

  // 3. First-topic fallback — keeps the page rendering even if
  //    no "crypto"-tagged topic exists in the dataset yet. The
  //    caller treats any non-null id as "fetch with this filter";
  //    we'd rather show *something* than wait forever.
  return topics[0]?.id ?? null;
}
