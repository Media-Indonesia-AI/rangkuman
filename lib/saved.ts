"use client";

/**
 * Saved/bookmark storage. Keeps a list of item IDs the user has bookmarked.
 * Items can be either a stock ticker (e.g. "BBCA") or a news story ID
 * (e.g. "story-2026-06-07-ekonomi-0"). Each entry also stores the kind and
 * the ISO date it was saved, so we can show newest first on /saved.
 */

const STORAGE_KEY = "berita-investor-saved";

export type SavedItemKind = "stock" | "story" | "coin";

export interface SavedItem {
  /** Unique id: stock ticker or story id */
  id: string;
  /** Distinguishes stock vs story */
  kind: SavedItemKind;
  /** ISO timestamp (ms) the user saved it. Used for sort-by-newest. */
  savedAt: number;
  /** When the item itself was published (ISO yyyy-mm-dd). Display only. */
  publishedAt: string;
}

function readAll(): SavedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (it: unknown): it is SavedItem =>
        typeof it === "object" &&
        it !== null &&
        typeof (it as SavedItem).id === "string" &&
        typeof (it as SavedItem).kind === "string" &&
        typeof (it as SavedItem).savedAt === "number",
    );
  } catch {
    return [];
  }
}

function writeAll(items: SavedItem[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("berita-investor:saved-changed"));
  } catch {
    // Quota exceeded or private mode — silent fail.
  }
}

export function getSaved(): SavedItem[] {
  return readAll();
}

export function isSaved(id: string): boolean {
  return readAll().some((it) => it.id === id);
}

export function saveItem(id: string, kind: SavedItemKind, publishedAt: string): void {
  const all = readAll();
  if (all.some((it) => it.id === id)) return;
  all.unshift({ id, kind, savedAt: Date.now(), publishedAt });
  writeAll(all);
}

export function unsaveItem(id: string): void {
  const all = readAll();
  writeAll(all.filter((it) => it.id !== id));
}

export function toggleSaved(id: string, kind: SavedItemKind, publishedAt: string): boolean {
  if (isSaved(id)) {
    unsaveItem(id);
    return false;
  }
  saveItem(id, kind, publishedAt);
  return true;
}

export function getSavedCount(): number {
  return readAll().length;
}
