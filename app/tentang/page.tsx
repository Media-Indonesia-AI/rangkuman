import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";
import { TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Tentang · Rangkuman",
  description:
    "Tentang Rangkuman — rangkuman bisnis & ekonomi Indonesia untuk investor ritel & profesional, dikurasi dari 64 sumber media.",
  openGraph: {
    title: "Tentang · Rangkuman",
    description:
      "Recap saham harian untuk investor ritel Indonesia, dikurasi dari 64 sumber media.",
    url: "https://rangkuman.news/tentang",
    siteName: "Rangkuman",
    locale: "id_ID",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Tentang Rangkuman" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tentang · Rangkuman",
    description: "Recap saham harian untuk investor ritel Indonesia.",
    images: ["/og-default.png"],
  },
};

export default function TentangPage() {
  return (
    <InfoPage
      eyebrow="Tentang Kami"
      icon={<TrendingUp className="h-3.5 w-3.5 text-brand" aria-hidden />}
      title="Tentang Rangkuman"
      description="Recap saham harian untuk investor ritel Indonesia — dikurasi dari 64 sumber media, dirangkum jadi satu cerita per saham."
      lastUpdated="2026-06-09"
      related={[
        { label: "Disclaimer", href: "/disclaimer", description: "Batasan tanggung jawab & risiko investasi" },
        { label: "Tim Redaksi", href: "/tim-redaksi", description: "Siapa di balik Rangkuman" },
        { label: "Kontak", href: "/kontak", description: "Hubungi kami untuk pertanyaan & masukan" },
        { label: "Pedoman Media Siber", href: "/pedoman-media-siber", description: "Standar editorial & etika peliputan" },
      ]}
    >
      <h2>Apa itu Rangkuman?</h2>
      <p>
        Rangkuman adalah portal rangkuman bisnis & ekonomi Indonesia yang dirancang
        untuk <strong>investor ritel, profesional, dan pengamat pasar</strong>. Tiap
        hari, kami memantau 64 media — CNBC, Bisnis, Kontan, Bloomberg, Reuters, Tempo,
        Katadata, Stockbit, dan lain-lain — lalu merangkum ceritanya jadi satu narasi
        per topik.
      </p>
      <p>
        Hasilnya: <strong>baca lebih sedikit, tahu lebih banyak</strong>. Tiap saham,
        regulasi, atau cerita ekonomi punya satu rangkuman pendek plus daftar semua
        media yang memberitakan. Gak perlu bolak-balik buka 10 tab.
      </p>

      <h2>Untuk siapa?</h2>
      <p>
        Buat lo yang punya portofolio saham tapi males baca 20 headline per hari. Buat
        pendiri startup yang mau pantau kompetisi & regulasi. Buat profesional yang
        pengen update ekonomi & bisnis Indonesia tanpa scroll tanpa ujung. Buat
        komunitas yang pengen satu sumber rangkuman yang konsisten.
      </p>

      <h2>Topik yang kami liput</h2>
      <ul>
        <li>
          <strong>Sorotan</strong> — briefing pagi: 5 cerita paling penting hari ini,
          selesai dalam 1 layar.
        </li>
        <li>
          <strong>Saham</strong> — recap 30+ emiten LQ45/IDX30, sentimen, & watchlist.
        </li>
        <li>
          <strong>Bisnis</strong> — akuisisi, startup, UMKM, korporasi, PHK, ekspansi,
          funding.
        </li>
        <li>
          <strong>Ekonomi</strong> — inflasi, suku bunga, APBN, pertumbuhan, perdagangan,
          fiskal.
        </li>
        <li>
          <strong>Kebijakan</strong> — regulasi, UU, PP, Permendag, POJK, pajak,
          kebijakan pemerintah.
        </li>
        <li>
          <strong>Sektor</strong> — analisis per industri IHSG + harga komoditas.
        </li>
        <li>
          <strong>Trending</strong> — 20 saham paling banyak dibicarakan media.
        </li>
      </ul>

      <h2>Apa yang BUKAN kami</h2>
      <p>
        Kami <strong>bukan</strong> perusahaan sekuritas, bukan penasihat investasi, dan
        tidak merekomendasikan beli/jual saham apapun. Semua konten di Rangkuman
        bersifat <strong>edukatif dan informatif</strong> — keputusan investasi tetap di
        tangan lo. Selalu verifikasi ke sumber resmi dan pertimbangkan profil risiko lo
        sebelum bertindak.
      </p>

      <h2>Bagaimana cara kami bekerja</h2>
      <p>
        Redaksi memantau 64 media Indonesia dan mancanegara setiap hari kerja. Sistem kami
        mengelompokkan berita per topik (saham, emiten, regulasi, dll), lalu merangkumnya
        menjadi satu cerita agregat. Tim editor memverifikasi rangkuman, mengecek sumber,
        dan menambahkan sentimen (Positif/Netral/Negatif) berdasarkan tone pemberitaan.
      </p>
      <p>
        Mock data yang lo lihat di demo ini <strong>bukan data pasar real-time</strong> —
        ini adalah simulasi untuk showcase produk. Versi production akan memakai data
        real-time dari BEI dan feed media partner.
      </p>
    </InfoPage>
  );
}
