"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Check, Link2, MessageCircle, Send, Share2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  /** Full URL to share (e.g. "https://rangkuman.news/stock/BBCA"). */
  url: string;
  /** Title/text used for WhatsApp & Telegram. */
  title: string;
  /** Variant affects padding — "compact" for card overlays, "default" for standalone. */
  variant?: "compact" | "default";
  /** Color theme: "light" for dark backgrounds (default), "dark" for light backgrounds. */
  tone?: "light" | "dark";
  /** Accessible label override. */
  ariaLabel?: string;
}

interface PopoverPos {
  top: number;
  left: number;
  /** Which side of the trigger the popover landed on — flips
   *  the entry animation direction and the pointer arrow. */
  placement: "top" | "bottom";
}

const POPOVER_WIDTH = 176; // w-44
const POPOVER_GAP = 6; // mt-1.5
const VIEWPORT_EDGE = 8;

/**
 * Trigger + overlay share menu.
 *
 * The popover is rendered through `createPortal(...)` into
 * `document.body` so it escapes the calling card's stacking
 * context entirely. Card content (including the footer's
 * `Lihat recap ↗` Link at the same z-10 as the action group)
 * can never paint over the popover — the popover sits at
 * `z-[100]` in the document's root stacking context.
 *
 * Positioning is computed from the trigger's `getBoundingClientRect()`:
 *
 *   - **Vertical auto-flip.** Default placement is *below* the
 *     trigger. If the popover would cross the viewport's bottom
 *     edge, it flips to *above* the trigger instead. The flip
 *     guard requires at least one viewport-edge of clearance
 *     before flipping — if neither side has room, we stay below
 *     and accept the clip (better than landing on top of the
 *     trigger).
 *   - **Horizontal clamp.** Right-anchored to the trigger's right
 *     edge, then clamped to a viewport gutter so the popover
 *     never sits flush against the scrollbar or off the left
 *     edge.
 *   - **Reposition on scroll/resize.** The popover stays glued
 *     to the trigger while the page moves.
 *
 * `useLayoutEffect` runs the first position computation
 * synchronously after DOM mutations so the popover doesn't flash
 * at the wrong `top` between mount and measure.
 */
export function ShareButton({
  url,
  title,
  variant = "compact",
  tone = "light",
  ariaLabel = "Bagikan",
}: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<PopoverPos>({
    top: 0,
    left: 0,
    placement: "bottom",
  });
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // createPortal needs `document` — gate SSR.
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.dispatchEvent(
        new CustomEvent("berita-investor:toast", { detail: "Link disalin!" }),
      );
      window.setTimeout(() => {
        setCopied(false);
        setOpen(false);
      }, 1200);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        window.dispatchEvent(
          new CustomEvent("berita-investor:toast", { detail: "Link disalin!" }),
        );
      } catch {
        window.dispatchEvent(
          new CustomEvent("berita-investor:toast", {
            detail: "Gagal menyalin link",
          }),
        );
      }
      document.body.removeChild(ta);
      setOpen(false);
    }
  }, [url]);

  const handleWhatsApp = useCallback(() => {
    const text = `${title}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
    setOpen(false);
  }, [title, url]);

  const handleTelegram = useCallback(() => {
    const text = `${title}`;
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
    setOpen(false);
  }, [title, url]);

  const computePos = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    // Use the live-rendered popover height when available; fall
    // back to a sensible default (header + icon row) for the
    // very first compute before useLayoutEffect measures the node.
    const popH = popoverRef.current?.offsetHeight ?? 76;
    const margin = POPOVER_GAP;

    // Vertical: default below, flip above if it would overflow
    // the viewport's bottom edge.
    let top = rect.bottom + margin;
    let placement: "top" | "bottom" = "bottom";
    if (top + popH > window.innerHeight - VIEWPORT_EDGE) {
      const aboveTop = rect.top - popH - margin;
      if (aboveTop > VIEWPORT_EDGE) {
        top = aboveTop;
        placement = "top";
      }
    }
    // Clamp the above case against the viewport's top edge — a
    // card flush with the viewport's top would otherwise plant
    // the popover off-screen.
    if (top < VIEWPORT_EDGE) top = VIEWPORT_EDGE;

    // Horizontal: right-anchor on the trigger, clamp into the
    // viewport with a small gutter.
    let left = rect.right - POPOVER_WIDTH;
    if (left < VIEWPORT_EDGE) left = VIEWPORT_EDGE;
    if (left + POPOVER_WIDTH > window.innerWidth - VIEWPORT_EDGE) {
      left = window.innerWidth - POPOVER_WIDTH - VIEWPORT_EDGE;
    }

    setPos({ top, left, placement });
  }, []);

  // First measurement goes through useLayoutEffect so the user
  // never sees the popover paint at `top: 0` (the state
  // initializer) before computePos lands.
  useLayoutEffect(() => {
    if (!open) return;
    computePos();
  }, [open, computePos]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (popoverRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    // Capture phase so we catch every ancestor's scroll too.
    window.addEventListener("scroll", computePos, true);
    window.addEventListener("resize", computePos);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", computePos, true);
      window.removeEventListener("resize", computePos);
    };
  }, [open, computePos]);

  const sizeClasses = variant === "compact" ? "h-7 w-7" : "h-8 px-2.5";
  const iconSize = "h-3.5 w-3.5";
  const baseTone =
    tone === "light"
      ? "border-white/20 bg-white/10 text-white/90 hover:border-white/40 hover:bg-white/15 hover:text-white"
      : "border-border bg-bg-tertiary text-text-secondary hover:border-border-strong hover:text-text-primary";

  const popover = open && (
    <div
      ref={popoverRef}
      role="menu"
      aria-label="Opsi share"
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        width: POPOVER_WIDTH,
      }}
      className={cn(
        "z-[100] overflow-hidden rounded-md border border-border-strong bg-bg-primary shadow-2xl animate-in fade-in duration-150",
        // Slide-in direction matches the chosen placement so the
        // popover appears to grow out of the trigger rather than
        // landing pre-positioned.
        pos.placement === "bottom"
          ? "slide-in-from-top-1"
          : "slide-in-from-bottom-1",
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-2.5 py-1.5">
        <span className="font-mono text-[9.5px] font-semibold uppercase tracking-widest text-text-muted">
          Bagikan
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Tutup"
          className="rounded p-0.5 text-text-faint transition-colors hover:bg-bg-tertiary hover:text-text-secondary"
        >
          <X className="h-3 w-3" aria-hidden />
        </button>
      </div>
      {/* Icon-only actions rendered as a single horizontal
          strip — three buttons share the row's width via
          `flex-1`. No dividers between cells; visual separation
          is provided by the `border-t` against the header above. */}
      <div className="flex border-t border-border">
        <button
          type="button"
          role="menuitem"
          onClick={handleCopy}
          aria-label={copied ? "Tersalin!" : "Copy link"}
          title={copied ? "Tersalin!" : "Copy link"}
          className="flex flex-1 items-center justify-center py-2 transition-colors hover:bg-bg-tertiary"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-bullish" aria-hidden />
          ) : (
            <Link2 className="h-3.5 w-3.5 text-text-secondary" aria-hidden />
          )}
        </button>
        <button
          type="button"
          role="menuitem"
          onClick={handleWhatsApp}
          aria-label="WhatsApp"
          title="WhatsApp"
          className="flex flex-1 items-center justify-center py-2 transition-colors hover:bg-bg-tertiary"
        >
          <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" aria-hidden />
        </button>
        <button
          type="button"
          role="menuitem"
          onClick={handleTelegram}
          aria-label="Telegram"
          title="Telegram"
          className="flex flex-1 items-center justify-center py-2 transition-colors hover:bg-bg-tertiary"
        >
          <Send className="h-3.5 w-3.5 text-[#26A5E4]" aria-hidden />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="relative inline-block">
        <button
          ref={triggerRef}
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          aria-label={ariaLabel}
          aria-haspopup="menu"
          aria-expanded={open}
          className={cn(
            "inline-flex items-center justify-center gap-1 rounded-md border transition-colors",
            sizeClasses,
            baseTone,
          )}
        >
          {variant === "compact" ? (
            <Share2 className={iconSize} aria-hidden />
          ) : (
            <>
              <Share2 className={iconSize} aria-hidden />
              <span className="font-mono text-[10.5px] font-semibold uppercase tracking-wider">
                Bagikan
              </span>
            </>
          )}
        </button>
      </div>
      {mounted && popover && createPortal(popover, document.body)}
    </>
  );
}
