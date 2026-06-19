/**
 * Take the first meaningful letter(s) of a media outlet's name.
 *   "CNBC Indonesia"   -> "CI"
 *   "Bisnis.com"       -> "B"
 *   "Bloomberg"        -> "B"
 *   "Investing.com"    -> "I"
 *   "IPOT"             -> "I"
 */
export function initialsOf(name: string): string {
  const cleaned = name
    .replace(/[.,]/g, " ")
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  if (cleaned.length === 0) return "·";
  if (cleaned.length === 1) return cleaned[0].slice(0, 1).toUpperCase();
  return (cleaned[0][0] + cleaned[1][0]).toUpperCase();
}
