import Link from "next/link";
import { InfoPage } from "@/components/InfoPage";
import { Briefcase, Heart, Zap, MapPin } from "lucide-react";

const OPEN_ROLES = [
  {
    title: "Editor Pasar Modal",
    location: "Jakarta / Remote",
    type: "Full-time",
    summary: "Rangkum berita harian, verifikasi fakta, label sentimen. Wajib paham IHSG, suka baca prospectus, dan teliti soal angka.",
  },
  {
    title: "Data Engineer (NLP)",
    location: "Jakarta / Remote",
    type: "Full-time",
    summary: "Bangun pipeline agregasi & summarization dari 64 media. Stack: Python, Postgres, LLM. Pengalaman NLP production jadi nilai plus.",
  },
  {
    title: "Frontend Engineer",
    location: "Jakarta / Hybrid",
    type: "Full-time",
    summary: "Next.js + TypeScript + Tailwind. Fokus ke dashboard yang cepet & accessible. Wajib perhatian sama detail spacing.",
  },
  {
    title: "Kontributor Lepas — Makro",
    location: "Remote (Indonesia)",
    type: "Part-time / freelance",
    summary: "Liputan khusus & analisis tematik. Bayar per artikel. Cocok untuk jurnalis, ekonom, atau analis yang hobi nulis.",
  },
];

const PERKS = [
  { icon: Heart, title: "Asuransi kesehatan", description: "BPJS + private, cover keluarga inti." },
  { icon: Zap, title: "Flexible hours", description: "Hasil yang penting, bukan jam duduk. WFA 2 hari/minggu." },
  { icon: Briefcase, title: "Equity / profit sharing", description: "Setelah 1 tahun, lo pegang saham perusahaan." },
  { icon: MapPin, title: "Office di BEI", description: "Gedung Bursa Efek Indonesia, Sudirman. Lantai 12." },
];

export default function KarirPage() {
  return (
    <InfoPage
      eyebrow="Karir"
      icon={<Briefcase className="h-3.5 w-3.5 text-brand" aria-hidden />}
      title="Karir di Rangkuman"
      description="Kami tim kecil yang pengen tumbuh bareng. Lagi hiring untuk peran penuh & kontribusi lepas — cek posisi terbuka di bawah."
      lastUpdated="2026-06-09"
      related={[
        { label: "Tim Redaksi", href: "/tim-redaksi", description: "Kenalan dengan tim saat ini" },
        { label: "Tentang", href: "/tentang", description: "Visi & misi kami" },
        { label: "Kontak", href: "/kontak", description: "Kirim lamaran & pertanyaan" },
      ]}
    >
      <h2>Posisi terbuka</h2>

      <div className="not-prose mt-4 space-y-3">
        {OPEN_ROLES.map((role) => (
          <div
            key={role.title}
            className="rounded-lg border border-border bg-bg-secondary p-4"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-[14px] font-semibold text-text-primary">{role.title}</h3>
              <div className="flex items-center gap-2 font-mono text-[10.5px] text-text-muted">
                <span>{role.type}</span>
                <span aria-hidden>·</span>
                <span>{role.location}</span>
              </div>
            </div>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-text-secondary">
              {role.summary}
            </p>
            <div className="mt-2.5">
              <Link
                href={`mailto:karir@rangkuman.news?subject=Melamar: ${encodeURIComponent(role.title)}`}
                className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-brand transition-colors hover:text-brand-hover"
              >
                Kirim lamaran →
              </Link>
            </div>
          </div>
        ))}
      </div>

      <h2 className="not-prose">&nbsp;</h2>
      <h2>Kenapa kerja di sini</h2>
      <div className="not-prose mt-4 grid gap-3 sm:grid-cols-2">
        {PERKS.map((perk) => (
          <div
            key={perk.title}
            className="rounded-lg border border-border bg-bg-secondary p-3.5"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand/15 text-brand">
              <perk.icon className="h-4 w-4" aria-hidden />
            </span>
            <p className="mt-2 text-[13px] font-semibold text-text-primary">{perk.title}</p>
            <p className="mt-0.5 text-[11.5px] leading-relaxed text-text-muted">
              {perk.description}
            </p>
          </div>
        ))}
      </div>

      <h2 className="not-prose">&nbsp;</h2>
      <h2>Cara melamar</h2>
      <ol>
        <li>Kirim CV + portofolio ke <strong>karir@rangkuman.news</strong>.</li>
        <li>Subject email: <code>Melamar: [Nama Posisi]</code>.</li>
        <li>Tim kami review dalam 5 hari kerja. Kalau match, lo diundang interview awal (30 menit, via video call).</li>
        <li>2-3 ronde interview, plus take-home test untuk peran teknis.</li>
      </ol>

      <h2>Belum ada posisi yang cocok?</h2>
      <p>
        Kirim CV + interest letter ke <strong>karir@rangkuman.news</strong>. Kami
        selalu buka untuk orang-orang yang passionate soal pasar modal Indonesia dan
        pengen impact lebih luas ke komunitas investor ritel.
      </p>
    </InfoPage>
  );
}