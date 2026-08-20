/**
 * Shared constants for the top-up widgets.
 *
 *   - `RUPIAH_PER_KOIN` — coin-to-IDR rate. 1 koin costs Rp 3.000.
 *     Surfaced in the balance card and in the custom-input helper so
 *     the value of one koin is always in context when the user is
 *     entering arbitrary amounts. Bundle chips don't need it: their
 *     `coin_amount` comes straight from the API.
 *
 *   - `MIN_AMOUNT` / `MAX_AMOUNT` — Rp bounds on the custom-input
 *     field. MIN matches the smallest quick-pick chip (Rp 50.000);
 *     MAX is 10.000.000 minus the 11% PPN (10.000.000 - 11% =
 *     8.900.000) so a user can't type a base amount whose grand
 *     total exceeds the platform's per-transaction ceiling.
 *
 *   - `MIN_KOIN` / `MAX_KOIN` — coin-count equivalents of the Rp
 *     limits. MIN_KOIN is ceil'd so a user typing the smallest valid
 *     count actually meets the Rp minimum (16 × 3.000 = 48.000 <
 *     50.000, so the floor doesn't qualify). MAX_KOIN is floor'd
 *     for the opposite reason — keep both ends honest.
 *
 *   - `PPN_RATE` — Indonesian PPN (Pajak Pertambahan Nilai) rate.
 *     Effective 11% as of 2022; the same rate applies to most
 *     digital goods and services. Surfaced as a separate line item
 *     in the totals block so the user can see the tax breakdown,
 *     not just an opaque grand total.
 *
 *   - `PAYMENT_METHODS` — placeholder list until the payment gateway
 *     lands. Currently unused by the rendered UI (the "Metode
 *     Pembayaran" section was deferred) but kept as a stable shape
 *     for when the radio group comes back.
 */

import { Banknote, Smartphone, type LucideIcon } from "lucide-react";

export const RUPIAH_PER_KOIN = 3_000;

export const MIN_AMOUNT = 50_000;
export const MAX_AMOUNT = 8_900_000;

export const MIN_KOIN = Math.ceil(MIN_AMOUNT / RUPIAH_PER_KOIN);
export const MAX_KOIN = Math.floor(MAX_AMOUNT / RUPIAH_PER_KOIN);

export const PPN_RATE = 0.11;

export interface PaymentMethodOption {
  id: string;
  label: string;
  Icon: LucideIcon;
}

export const PAYMENT_METHODS: ReadonlyArray<PaymentMethodOption> = [
  { id: "gopay", label: "GoPay", Icon: Smartphone },
  { id: "ovo", label: "OVO", Icon: Smartphone },
  { id: "dana", label: "DANA", Icon: Smartphone },
  { id: "va-bca", label: "Virtual Account BCA", Icon: Banknote },
];

/** Format an IDR amount using the Indonesian locale. */
export function formatIdr(n: number): string {
  return `Rp ${n.toLocaleString("id-ID")}`;
}