"use client";

import { useState, useEffect, type FormEvent } from "react";
import { X, Mail, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { subscribeEmail, isSubscribed as isSubscribedRaw } from "@/lib/newsletter";
import { cn } from "@/lib/utils";

interface NewsletterModalProps {
  open: boolean;
  onClose: () => void;
  /** Optional context shown above the form (e.g. "Recap BBCA tiap pagi"). */
  context?: string;
}

/** Reusable newsletter signup dialog used by the floating pill and inline CTAs. */
export function NewsletterModal({ open, onClose, context }: NewsletterModalProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  // Reset state on open
  useEffect(() => {
    if (!open) return;
    setError(null);
    setLoading(false);
    // Check current subscription
    if (typeof window !== "undefined") {
      try {
        const stored = window.localStorage.getItem("beritainvestor:newsletter");
        if (stored) {
          const list = JSON.parse(stored);
          if (Array.isArray(list) && list.length > 0) {
            setEmail(list[list.length - 1].email);
            setSubscribed(true);
          }
        }
      } catch {
        /* noop */
      }
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setTimeout(() => {
      const res = subscribeEmail(email);
      if (res.ok) {
        setSubscribed(true);
      } else {
        setError(res.reason ?? "Gagal subscribe");
      }
      setLoading(false);
    }, 350);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-bg-primary/80 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Subscribe newsletter"
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-t-lg border border-border bg-bg-secondary shadow-2xl sm:rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-brand-soft px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-brand/20 text-brand">
              {subscribed ? (
                <CheckCircle2 className="h-4 w-4" aria-hidden />
              ) : (
                <Mail className="h-4 w-4" aria-hidden />
              )}
            </div>
            <div>
              <h3 className="text-[14px] font-bold leading-tight text-text-primary">
                {subscribed ? "Kamu sudah subscribe" : "Langganan Berita Gratis"}
              </h3>
              <p className="font-mono text-[10px] text-text-muted">
                {context ?? "5 saham yang perlu kamu tahu, jam 6 WIB"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="inline-flex h-7 w-7 items-center justify-center rounded text-text-faint transition-colors hover:bg-bg-secondary hover:text-text-primary"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          {subscribed ? (
            <div className="space-y-3 text-center">
              <div className="rounded-md border border-bullish-line bg-bullish-soft p-3">
                <p className="font-mono text-[13px] font-semibold text-bullish">
                  🎉 Cek inbox kamu besok jam 6 WIB!
                </p>
                <p className="mt-1 font-mono text-[10.5px] text-text-muted">
                  Recap pertama akan dikirim ke {email}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 items-center rounded-md border border-border bg-bg-card px-4 text-[12.5px] font-semibold text-text-primary transition-colors hover:border-border-strong"
              >
                Oke, tutup
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label
                  htmlFor="newsletter-email"
                  className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-widest text-text-muted"
                >
                  Email kamu
                </label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-faint"
                    aria-hidden
                  />
                  <input
                    id="newsletter-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kamu@email.com"
                    autoComplete="email"
                    required
                    className="h-10 w-full rounded-md border border-border bg-bg-input pl-8 pr-3 text-[13px] text-text-primary placeholder:text-text-faint focus:border-brand focus:outline-none"
                  />
                </div>
              </div>

              {error && (
                <p className="rounded-md border border-bearish-line bg-bearish-soft px-2.5 py-1.5 font-mono text-[11px] text-bearish">
                  ⚠ {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "flex w-full items-center justify-center gap-1.5 rounded-md bg-brand py-2.5 text-[13px] font-semibold text-bg-primary transition-colors hover:bg-brand-hover disabled:opacity-60",
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                    Subscribe…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" aria-hidden />
                    Subscribe — gratis
                  </>
                )}
              </button>

              <p className="text-center font-mono text-[10px] text-text-muted">
                12.400+ investor sudah subscribe · Gak spam, unsubscribe kapan aja
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
