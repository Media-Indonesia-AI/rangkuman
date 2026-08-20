"use client";

/**
 * Static "Preview pesan" card — visual constraint to give the
 * user a sense of what the WhatsApp message will look like
 * before they opt in. Pure presentation, no props. Renders a
 * fixed sample story so the visual rhythm matches the rest of
 * the app's editorial cards; live data will land here once
 * the preview-API exists.
 */

import { MessageCircle } from "lucide-react";

export function MessagePreviewCard() {
  return (
    <section className="rounded-lg border border-border bg-bg-secondary p-4">
      <div className="mb-2 flex items-center gap-1.5">
        <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" aria-hidden />
        <p className="label">Preview pesan</p>
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-bg-secondary">
        <div className="h-1.5 w-full bg-cat-global" aria-hidden />
        <div className="space-y-2 p-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[9.5px] font-semibold uppercase tracking-widest text-cat-global">
              GLOBAL
            </span>
            <span className="font-mono text-[9.5px] text-text-faint">
              1 jam lalu
            </span>
          </div>
          <p className="font-serif text-[14.5px] font-bold leading-snug text-text-primary">
            The Fed pangkas suku bunga 25 bps — sinyal dovish untuk
            pasar Asia.
          </p>
          <p className="line-clamp-3 text-[11.5px] leading-[1.5] text-text-secondary">
            The Fed pangkas suku bunga acuan dari 5,50% ke 5,25%
            setelah FOMC September. Powell: &ldquo;ekonomi solid,
            tapi kami lihat tekanan di tenaga kerja&rdquo;.
            IHSG rebound 0,87%, rupiah terapresiasi 0,4%.
          </p>
          <div className="flex items-center justify-between border-t border-border pt-2 font-mono text-[9.5px] text-text-muted">
            <span>Reuters · Bloomberg · Kontan</span>
            <span>2 mnt baca</span>
          </div>
        </div>
      </div>
      <p className="mt-3 font-mono text-[10.5px] text-text-faint">
        Pesan dikirim via WhatsApp Business API. Tarif operator
        berlaku untuk pesan masuk.
      </p>
    </section>
  );
}