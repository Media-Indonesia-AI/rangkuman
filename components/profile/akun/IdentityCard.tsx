interface IdentityCardProps {
  /** Full name — first character used as the avatar initial. */
  name: string;
  /** Email shown below the name in muted type. */
  email: string;
}

/** Avatar + name + email card. Greets the user by name at the
 *  top of the Akun section; mirrors the avatar-bubble
 *  convention used in the sidebar / Navbar but at a larger size
 *  for emphasis. The initial is computed defensively — an empty
 *  name falls back to `?` so the avatar never renders blank. */
export function IdentityCard({ name, email }: IdentityCardProps) {
  const initial = (name.trim().charAt(0) || "?").toUpperCase();
  return (
    <section className="flex items-center gap-3 rounded-lg border border-border bg-bg-secondary p-4">
      <span
        aria-hidden
        className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand/20 text-[20px] font-bold text-brand"
      >
        {initial}
      </span>
      <div className="min-w-0">
        <p className="truncate text-[15px] font-bold text-text-primary">
          {name}
        </p>
        <p className="truncate text-[12px] text-text-muted">{email}</p>
      </div>
    </section>
  );
}
