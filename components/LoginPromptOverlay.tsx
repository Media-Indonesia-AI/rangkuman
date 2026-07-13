"use client";

import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { useCurrentUser } from "@/lib/hooks/useAuth";

interface LoginPromptOverlayProps {
  /** Title shown above the message. */
  title?: string;
}

/**
 * Inline login overlay. Renders a blurred, semi-transparent layer with a
 * single "Login" button. Designed to sit inside a section (e.g. Top Movers)
 * via `absolute inset-0` positioning.
 *
 * Caller is responsible for wrapping the section in `relative` so the
 * overlay positions correctly.
 *
 * The prompt is non-dismissible: it remains visible as long as the user is
 * logged out and disappears only when authentication state changes.
 */
export function LoginPromptOverlay({
  title = "Silahkan Login terlebih dahulu untuk melihat fitur ini",
}: LoginPromptOverlayProps) {
  const router = useRouter();
  const user = useCurrentUser();

  if (user) return null;

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center rounded-lg bg-bg-primary/70 p-3 backdrop-blur-md"
      role="dialog"
      aria-modal="false"
      aria-label="Login untuk melihat data"
    >
      <div className="w-full max-w-xs rounded-lg border border-border bg-bg-secondary p-3 shadow-2xl">
        <div className="mb-3">
          <h3 className="text-[13px] font-bold leading-snug text-text-primary">
            {title}
          </h3>
        </div>

        <button
          type="button"
          onClick={() => router.push("/login")}
          className="flex w-full items-center justify-center gap-2 rounded border border-brand/30 bg-brand/10 px-2.5 py-2 text-[12px] font-semibold text-text-primary transition-colors hover:border-brand hover:bg-brand/20"
        >
          <LogIn className="h-3.5 w-3.5 shrink-0 text-brand" aria-hidden />
          <span>Login</span>
        </button>
      </div>
    </div>
  );
}
