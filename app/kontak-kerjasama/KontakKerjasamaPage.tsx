import { InfoPage } from "@/components/InfoPage";
import { Mail } from "lucide-react";

/** Contact channels surfaced on `/kontak-kerjasama/`. Array shape
 *  (rather than a single const) so adding a new inbox is one line
 *  — drop a `{ title, detail }` entry and the card grid below
 *  picks it up. `title` is reserved for future use (e.g. "Redaksi
 *  & koreksi") when the team re-introduces the section header. */
const CHANNELS: { title: string; detail: string }[] = [
  { title: "Email umum", detail: "hello@rangkuman.news" },
];

export default function KontakKerjasamaPage() {
  return (
    <InfoPage
      eyebrow="Kontak & Kerjasama"
      icon={<Mail className="h-3.5 w-3.5 text-brand" aria-hidden />}
      title="Kontak & Kerjasama"
    >
      <div className="not-prose mt-5 grid gap-3 sm:grid-cols-3">
        {CHANNELS.map((ch) => (
          <div
            key={ch.title}
            className="rounded-lg border border-border bg-bg-secondary p-4"
          >
            <a
              href={`mailto:${ch.detail}`}
              className="mt-1 block break-all font-mono text-[11.5px] text-brand hover:underline"
            >
              {ch.detail}
            </a>
          </div>
        ))}
      </div>
    </InfoPage>
  );
}
