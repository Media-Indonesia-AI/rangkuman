import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";
import { Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Tim Redaksi · Rangkuman",
  description: "Tim di balik Rangkuman — editor, jurnalis, dan engineer yang merangkum pasar modal Indonesia setiap hari.",
  openGraph: {
    title: "Tim Redaksi · Rangkuman",
    description: "Tim editor & engineer di balik Rangkuman.",
    url: "https://rangkuman.news/tim-redaksi",
    siteName: "Rangkuman",
    locale: "id_ID",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Tim Redaksi" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tim Redaksi · Rangkuman",
    description: "Tim editor & engineer di balik Rangkuman.",
    images: ["/og-default.png"],
  },
};

const TEAM = [
  {
    initials: "AR",
    name: "Aulia Rahman",
    role: "Editor in Chief",
    bio: "10+ tahun liputan pasar modal. Pernah di Kontan, CNN Indonesia, dan Bloomberg TV.",
  },
  {
    initials: "DS",
    name: "Dewi Sartika",
    role: "Senior Editor, Makro",
    bio: "Ekonomi & moneter. Latar belakang Bank Indonesia dan LPEM FEB UI.",
  },
  {
    initials: "RP",
    name: "Reza Pratama",
    role: "Data Engineer",
    bio: "Bikin pipeline agregasi berita dari 64 sumber. Suka data dan kopi hitam.",
  },
  {
    initials: "MK",
    name: "Maya Kusuma",
    role: "Product Designer",
    bio: "UI/UX dashboard. Fokus ke clarity & density buat investor ritel.",
  },
];

export default function TimRedaksiPage() {
  return (
    <InfoPage
      eyebrow="Tim"
      icon={<Users className="h-3.5 w-3.5 text-brand" aria-hidden />}
      title="Tim Redaksi"
      description="Orang-orang di balik ringkasan pasar modal yang lo baca tiap hari di Rangkuman."
      lastUpdated="2026-06-09"
      related={[
        { label: "Tentang", href: "/tentang", description: "Visi & misi Rangkuman" },
        { label: "Pedoman Media Siber", href: "/pedoman-media-siber", description: "Standar editorial kami" },
        { label: "Karir", href: "/karir", description: "Lowongan & peluang kontribusi" },
        { label: "Kontak", href: "/kontak", description: "Hubungi tim kami" },
      ]}
    >
      <h2>Tim Inti</h2>
      <p>
        Tim kami kecil tapi cross-functional — editor, jurnalis, data engineer, dan
        desainer produk yang bekerja bareng untuk satu tujuan: bikin informasi pasar
        modal Indonesia gampang dicerna.
      </p>

      <div className="not-prose mt-6 grid gap-3 sm:grid-cols-2">
        {TEAM.map((member) => (
          <div
            key={member.name}
            className="rounded-lg border border-border bg-bg-secondary p-4"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand/15 font-mono text-[14px] font-bold text-brand">
                {member.initials}
              </span>
              <div className="min-w-0">
                <p className="text-[13.5px] font-semibold text-text-primary">{member.name}</p>
                <p className="font-mono text-[10.5px] text-text-muted">{member.role}</p>
              </div>
            </div>
            <p className="mt-2.5 text-[12px] leading-relaxed text-text-secondary">
              {member.bio}
            </p>
          </div>
        ))}
      </div>

      <h2 className="not-prose">&nbsp;</h2>
      <h2>Bagaimana kami kerja</h2>
      <p>
        Pagi hari: tim data engineer crawls 64 media, ekstrak headline, dan kelompokin
        per ticker. Siang: tim editor verifikasi, rangkum, dan kasih label sentimen.
        Sore: dipublish ke web. Setiap ringkasan melewati 2 lapis review (editor + senior
        editor) sebelum sampai ke lo.
      </p>
      <p>
        Kami juga menerima <strong>kontributor lepas</strong> untuk liputan khusus. Lihat
        halaman <a href="/karir">Karir</a> untuk info lebih lanjut.
      </p>
    </InfoPage>
  );
}
