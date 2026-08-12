/**
 * Newsletter subscription — localStorage-backed mock.
 * Keeps an array of subscribed emails, plus a base count for the headline
 * "X investors sudah subscribe" that ticks up every signup.
 */

import { STORAGE_EVENT, STORAGE_KEYS } from "./storageKeys";

// Local aliases — kept short because the rest of the file uses
// them ~15 times. The canonical key strings live in
// `lib/storageKeys.ts` so this file stays a single-source-of-truth
// consumer rather than a co-equal definer.
const STORAGE_KEY = STORAGE_KEYS.newsletter;
const DISMISS_KEY = STORAGE_KEYS.newsletterDismissed;
/** Re-show the floating pill after this many hours have passed. */
const DISMISS_HOURS = 24;

/** Number of "existing" subscribers baked into the headline. We start the
 *  dynamic count from 0 — the base is purely decorative so the number
 *  always feels lively. */
const BASE_COUNT = 12_400;

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key } }));
  } catch {
    /* noop */
  }
}

export interface SubscriberEntry {
  email: string;
  /** ISO timestamp of subscription. */
  subscribedAt: string;
}

function readList(): SubscriberEntry[] {
  const list = readJson<SubscriberEntry[]>(STORAGE_KEY);
  return Array.isArray(list) ? list : [];
}

function writeList(list: SubscriberEntry[]): void {
  writeJson(STORAGE_KEY, list);
}

export function getSubscribers(): SubscriberEntry[] {
  return readList();
}

export function getTotalSubscribers(): number {
  return BASE_COUNT + readList().length;
}

export function isSubscribed(email: string): boolean {
  const e = email.trim().toLowerCase();
  return readList().some((s) => s.email.toLowerCase() === e);
}

export function subscribeEmail(email: string): { ok: boolean; reason?: string } {
  const trimmed = email.trim();
  if (!trimmed || !trimmed.includes("@") || !trimmed.includes(".")) {
    return { ok: false, reason: "Format email gak valid" };
  }
  const list = readList();
  const e = trimmed.toLowerCase();
  if (list.some((s) => s.email.toLowerCase() === e)) {
    return { ok: false, reason: "Email udah terdaftar" };
  }
  list.push({ email: trimmed, subscribedAt: new Date().toISOString() });
  writeList(list);
  return { ok: true };
}

export function unsubscribeEmail(email: string): void {
  const e = email.trim().toLowerCase();
  const list = readList();
  const next = list.filter((s) => s.email.toLowerCase() !== e);
  writeList(next);
}

export const NEWSLETTER_BASE = BASE_COUNT;

// ─── DISMISS PILL STATE ─────────────────────────────────────────

/** Is the floating pill currently dismissed by the user? */
export function isPillDismissed(): boolean {
  const raw = readJson<{ until: string }>(DISMISS_KEY);
  if (!raw?.until) return false;
  return new Date(raw.until).getTime() > Date.now();
}

/** Mark the pill as dismissed for the next DISMISS_HOURS hours. */
export function dismissPill(): void {
  const until = new Date(Date.now() + DISMISS_HOURS * 60 * 60 * 1000).toISOString();
  writeJson(DISMISS_KEY, { until });
}
