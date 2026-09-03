import { useCurrentUser } from "@/lib/hooks/useAuth";

interface HeadlineDetailTagsProps {
  /** Short tag strings (without the `#` prefix). */
  tags: string[];
}

/**
 * Tag chips strip shown beneath the summary. Each tag renders with a
 * leading `#`. Renders nothing when the tag list is empty so callers
 * don't need a separate guard.
 */
export function HeadlineDetailTags({ tags }: HeadlineDetailTagsProps) {
  const user = useCurrentUser();
  if (!user) return null;

  if (tags.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center rounded border border-border bg-bg-tertiary px-2 py-0.5 font-mono text-[10.5px] text-text-secondary"
        >
          #{tag}
        </span>
      ))}
    </div>
  );
}