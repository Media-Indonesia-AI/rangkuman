"use client";

import { useState, useRef, useEffect } from "react";
import { Share2, Link2, MessageCircle, Send, X, Check } from "lucide-react";
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

export function ShareButton({
  url,
  title,
  variant = "compact",
  tone = "light",
  ariaLabel = "Bagikan",
}: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.dispatchEvent(
        new CustomEvent("berita-investor:toast", { detail: "Link disalin!" }),
      );
      setTimeout(() => {
        setCopied(false);
        setOpen(false);
      }, 1200);
    } catch {
      // Fallback for older browsers / non-secure contexts.
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
          new CustomEvent("berita-investor:toast", { detail: "Gagal menyalin link" }),
        );
      }
      document.body.removeChild(ta);
      setOpen(false);
    }
  };

  const handleWhatsApp = () => {
    const text = `${title} - ${url}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
    setOpen(false);
  };

  const handleTelegram = () => {
    const text = `${title} - ${url}`;
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
    setOpen(false);
  };

  const sizeClasses = variant === "compact" ? "h-7 w-7" : "h-8 px-2.5";
  const iconSize = variant === "compact" ? "h-3.5 w-3.5" : "h-3.5 w-3.5";
  const baseTone =
    tone === "light"
      ? "border-white/10 bg-white/5 text-white/80 hover:border-white/30 hover:bg-white/10 hover:text-white"
      : "border-border bg-bg-tertiary text-text-secondary hover:border-border-strong hover:text-text-primary";

  return (
    <div className="relative">
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

      {open && (
        <div
          ref={popoverRef}
          role="menu"
          aria-label="Opsi share"
          className="absolute right-0 top-full z-50 mt-1.5 w-44 overflow-hidden rounded-md border border-border-strong bg-bg-primary shadow-2xl shadow-black/40"
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
          <button
            type="button"
            role="menuitem"
            onClick={handleCopy}
            className="flex w-full items-center gap-2 px-2.5 py-2 text-left transition-colors hover:bg-bg-tertiary"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-bullish" aria-hidden />
            ) : (
              <Link2 className="h-3.5 w-3.5 text-text-secondary" aria-hidden />
            )}
            <span className="text-[12.5px] text-text-primary">
              {copied ? "Tersalin!" : "Copy link"}
            </span>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={handleWhatsApp}
            className="flex w-full items-center gap-2 px-2.5 py-2 text-left transition-colors hover:bg-bg-tertiary"
          >
            <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" aria-hidden />
            <span className="text-[12.5px] text-text-primary">WhatsApp</span>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={handleTelegram}
            className="flex w-full items-center gap-2 px-2.5 py-2 text-left transition-colors hover:bg-bg-tertiary"
          >
            <Send className="h-3.5 w-3.5 text-[#26A5E4]" aria-hidden />
            <span className="text-[12.5px] text-text-primary">Telegram</span>
          </button>
        </div>
      )}
    </div>
  );
}
