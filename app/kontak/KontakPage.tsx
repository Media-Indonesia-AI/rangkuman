import { InfoPage } from "@/components/InfoPage";
import { Mail, MessageSquare, Building2 } from "lucide-react";

const CHANNELS = [
  {
    icon: Mail,
    title: "Email umum",
    detail: "halo@rangkuman.news",
    description: "Pertanyaan umum, masukan, atau kerja sama.",
  },
  {
    icon: MessageSquare,
    title: "Redaksi & koreksi",
    detail: "redaksi@rangkuman.news",
    description: "Koreksi fakta, klarifikasi, atau pelaporan konten.",
  },
  {
    icon: Building2,
    title: "Media partner",
    detail: "partnership@rangkuman.news",
    description: "Kerja sama konten, sindikasi, atau media partner.",
  },
];

export default function KontakPage() {
  return (
    <InfoPage
      eyebrow="Hubungi Kami"
      icon={<Mail className="h-3.5 w-3.5 text-brand" aria-hidden />}
      title="Kontak"
      description="Punya pertanyaan, masukan, atau mau kerja sama? Hubungi kami lewat channel di bawah. Kami balas dalam 1-2 hari kerja."
      lastUpdated="2026-06-09"
      related={[
        { label: "Kerjasama", href: "/kerjasama", description: "Tentang Rangkuman" },
      ]}
    >
      <h2>Channel komunikasi</h2>
      <p>
        Kami sudah kelompokin email berdasarkan tujuannya biar lebih cepet ditangani.
        Pilih yang paling sesuai dengan kebutuhan lo:
      </p>

      <div className="not-prose mt-5 grid gap-3 sm:grid-cols-3">
        {CHANNELS.map((ch) => (
          <div
            key={ch.title}
            className="rounded-lg border border-border bg-bg-secondary p-4"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand/15 text-brand">
              <ch.icon className="h-4 w-4" aria-hidden />
            </span>
            <p className="mt-2.5 text-[12.5px] font-semibold text-text-primary">{ch.title}</p>
            <a
              href={`mailto:${ch.detail}`}
              className="mt-1 block break-all font-mono text-[11.5px] text-brand hover:underline"
            >
              {ch.detail}
            </a>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-text-muted">
              {ch.description}
            </p>
          </div>
        ))}
      </div>

      <h2 className="not-prose">&nbsp;</h2>
      <h2>Lokasi</h2>
      <p>
        <strong>Rangkuman</strong>
        <br />
        Gedung Bursa Efek Indonesia, Lt. 12
        <br />
        Jl. Jend. Sudirman Kav. 52-53
        <br />
        Jakarta Selatan 12190, Indonesia
      </p>

      <h2>Respon time</h2>
      <ul>
        <li>Email umum: <strong>1-2 hari kerja</strong></li>
        <li>Koreksi redaksional: <strong>prioritas tinggi, 4-8 jam</strong></li>
        <li>Media partner: <strong>3-5 hari kerja</strong></li>
      </ul>

      <h2>Press & media kit</h2>
      <p>
        Untuk keperluan jurnalistik, logo Rangkuman dalam format PNG/SVG, dan
        company fact sheet tersedia atas permintaan ke{" "}
        <strong>press@rangkuman.news</strong>.
      </p>
    </InfoPage>
  );
}