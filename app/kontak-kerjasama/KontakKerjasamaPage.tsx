import { InfoPage } from "@/components/InfoPage";
import { Mail } from "lucide-react";

/**
 * Merged `/kontak` + `/kerjasama` page. Previously two separate routes
 * — `/kontak` listed communication channels, response times, and press
 * contacts; `/kerjasama` explained what Rangkuman is and invited
 * partnerships. Both audiences overlap (a media-partner inquiry needs
 * both the "what is this product" framing AND the right email
 * address), so merging into one page keeps the user from bouncing
 * between two `/legal`-style pages for a single conversation.
 *
 * Sections in order:
 *   1. Channel komunikasi — the three email inboxes (umum, redaksi,
 *      partnership) + lokasi + respon time. Originally from
 *      `app/kontak/KontakPage.tsx`.
 *   2. Tentang Rangkuman — product positioning + "untuk siapa" +
 *      topik liputan + disclaimers. Originally from
 *      `app/kerjasama/KerjasamaPage.tsx`. The "Bagaimana cara kami
 *      bekerja" paragraph still mentions "11 media" after the
 *      Footer media-list refresh.
 *   3. Press & media kit — logo + fact sheet request path. Originally
 *      at the bottom of the old `/kontak` page.
 */
const CHANNELS = [
  {
    title: "Email umum",
    detail: "halo@rangkuman.news",
    description: "Pertanyaan umum, masukan, atau kerja sama.",
  },
  {
    title: "Redaksi & koreksi",
    detail: "redaksi@rangkuman.news",
    description: "Koreksi fakta, klarifikasi, atau pelaporan konten.",
  },
  {
    title: "Media partner",
    detail: "partnership@rangkuman.news",
    description: "Kerja sama konten, sindikasi, atau media partner.",
  },
];

export default function KontakKerjasamaPage() {
  return (
    <InfoPage
      eyebrow="Kontak & Kerjasama"
      icon={<Mail className="h-3.5 w-3.5 text-brand" aria-hidden />}
      title="Kontak & Kerjasama"
      description="Punya pertanyaan, masukan, atau mau kerja sama? Hubungi kami lewat channel di bawah — balas 1-2 hari kerja."
      lastUpdated="2026-06-09"
      related={[
        { label: "Syarat & Ketentuan", href: "/syarat-ketentuan", description: "Aturan main & batasan layanan" },
      ]}
    >
      <h2>Channel komunikasi</h2>
      <p>
        Kami sudah kelompokin email berdasarkan tujuannya biar lebih cepet
        ditangani. Pilih yang paling sesuai dengan kebutuhan lo:
      </p>

      <div className="not-prose mt-5 grid gap-3 sm:grid-cols-3">
        {CHANNELS.map((ch) => (
          <div
            key={ch.title}
            className="rounded-lg border border-border bg-bg-secondary p-4"
          >
            <p className="text-[12.5px] font-semibold text-text-primary">{ch.title}</p>
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

      <h2>Apa itu Rangkuman?</h2>
      <p>
        Rangkuman adalah portal rangkuman bisnis & ekonomi Indonesia yang dirancang
        untuk <strong>investor ritel, profesional, dan pengamat pasar</strong>. Tiap
        hari, kami memantau 11 media — Bloomberg Technoz, Emitennews, CNBC
        Indonesia, Investor Daily, Katadata, Bisnis.com, Kontan, CryptoNews, The
        Block, Cointelegraph, dan Decrypt — lalu merangkum ceritanya jadi satu
        narasi per topik.
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
        Redaksi memantau 11 media Indonesia dan mancanegara setiap hari kerja. Sistem kami
        mengelompokkan berita per topik (saham, emiten, regulasi, dll), lalu merangkumnya
        menjadi satu cerita agregat. Tim editor memverifikasi rangkuman, mengecek sumber,
        dan menambahkan sentimen (Positif/Netral/Negatif) berdasarkan tone pemberitaan.
      </p>

      <h2>Press &amp; media kit</h2>
      <p>
        Untuk keperluan jurnalistik, logo Rangkuman dalam format PNG/SVG, dan
        company fact sheet tersedia atas permintaan ke{" "}
        <strong>press@rangkuman.news</strong>.
      </p>
    </InfoPage>
  );
}