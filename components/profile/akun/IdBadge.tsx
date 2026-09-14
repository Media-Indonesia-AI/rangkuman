interface IdBadgeProps {
  /** Opaque user ID rendered in mono muted type. */
  id: string;
}

/** Bottom-of-section "User ID: …" line. Useful for support
 *  inquiries ("here's my user ID"). The page guards on
 *  `user.id` being truthy before rendering — when the wire
 *  response omits the id (rare), this widget simply isn't
 *  mounted. */
export function IdBadge({ id }: IdBadgeProps) {
  return (
    <p className="font-mono text-[10.5px] text-text-faint">
      User ID: <span className="text-text-muted">{id}</span>
    </p>
  );
}
