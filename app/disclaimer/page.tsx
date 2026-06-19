import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";
import { AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Disclaimer · Rangkuman",
  description:
    "Disclaimer Rangkuman — keterbatasan tanggung jawab, batasan penggunaan konten, dan risiko investasi.",
  openGraph: {
    title: "Disclaimer · Rangkuman",
    description: "Keterbatasan tanggung jawab & batasan penggunaan konten Rangkuman.",
    url: "https://rangkuman.news/disclaimer",
    siteName: "Rangkuman",
    locale: "id_ID",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Disclaimer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Disclaimer · Rangkuman",
    description: "Keterbatasan tanggung jawab & batasan penggunaan.",
    images: ["/og-default.png"],
  },
};

export default function DisclaimerPage() {
  return (
    <InfoPage
      eyebrow="Penting"
      icon={<AlertTriangle className="h-3.5 w-3.5 text-mixed" aria-hidden />}
      title="Disclaimer"
      description="Mohon baca halaman ini dengan seksama. Dengan mengakses Rangkuman, lo dianggap memahami & menyetujui poin-poin di bawah."
      lastUpdated="2026-06-09"
      related={[
        { label: "Privasi", href: "/privasi", description: "Bagaimana kami mengelola data lo" },
        { label: "Syarat & Ketentuan", href: "/syarat-ketentuan", description: "Ketentuan penggunaan layanan" },
        { label: "Pedoman Media Siber", href: "/pedoman-media-siber", description: "Standar editorial kami" },
        { label: "Tentang", href: "/tentang", description: "Apa itu Rangkuman" },
      ]}
    >
      <h2>1. Bukan rekomendasi investasi</h2>
      <p>
        Semua konten yang ditampilkan di Rangkuman — termasuk ringkasan saham, analisis
        sektoral, market mood, trending, dan newsletter — bersifat <strong>edukatif dan
        informatif</strong>. Konten ini <strong>BUKAN</strong>:
      </p>
      <ul>
        <li>Rekomendasi untuk membeli, menjual, atau menahan saham tertentu.</li>
        <li>Nasihat investasi, pajak, hukum, atau finansial.</li>
        <li>Jaminan bahwa informasi di Rangkuman akurat, lengkap, atau terkini.</li>
      </ul>
      <p>
        Keputusan investasi sepenuhnya menjadi tanggung jawab lo. Selalu lakukan riset
        mandiri (DYOR — Do Your Own Research) dan konsultasikan dengan penasihat keuangan
        yang berlisensi.
      </p>

      <h2>2. Akurasi & kekinian informasi</h2>
      <p>
        Kami berupaya menyajikan informasi seakurat mungkin dari berbagai sumber media.
        Namun, kami <strong>tidak menjamin</strong>:
      </p>
      <ul>
        <li>Akurasi, kelengkapan, atau kekinian setiap data yang ditampilkan.</li>
        <li>Harga saham, volume, dan data pasar real-time yang ditampilkan di Rangkuman
          (saat ini adalah data simulasi untuk demo produk).</li>
        <li>Tidak adanya kesalahan teknis, kelalaian, atau perubahan mendadak dari sumber
          yang kami rangkum.</li>
      </ul>

      <h2>3. Risiko investasi</h2>
      <p>
        Investasi di pasar modal, termasuk saham, mengandung <strong>risiko kerugian
        modal</strong>. Harga saham dapat turun maupun naik. Performa masa lalu tidak
        menjamin performa masa depan. Lo bisa kehilangan sebagian atau seluruh modal yang
        lo investasikan.
      </p>
      <p>
        Pastikan lo memahami profil risiko, tujuan investasi, dan horizon waktu lo
        sebelum mengambil keputusan apapun.
      </p>

      <h2>4. Konten dari pihak ketiga</h2>
      <p>
        Rangkuman merangkum berita dari media-media seperti CNBC Indonesia, Bisnis.com,
        Kontan, Bloomberg, Reuters, dan lain-lain. <strong>Hak cipta atas konten asli tetap
        dimiliki oleh masing-masing media</strong>. Kami hanya melakukan agregasi dan
        perangkuman untuk tujuan informatif.
      </p>
      <p>
        Jika lo merasa ada konten yang melanggar hak cipta, silakan hubungi kami melalui
        halaman <a href="/kontak">Kontak</a>.
      </p>

      <h2>5. Tautan keluar (external links)</h2>
      <p>
        Rangkuman dapat memuat tautan ke situs eksternal (misalnya: halaman saham
        individual BEI, profil perusahaan). Kami tidak bertanggung jawab atas konten,
        kebijakan privasi, atau praktik dari situs pihak ketiga tersebut.
      </p>

      <h2>6. Perubahan konten</h2>
      <p>
        Kami dapat mengubah, memperbarui, atau menghapus konten di Rangkuman
        sewaktu-waktu tanpa pemberitahuan terlebih dahulu. Versi terbaru dari disclaimer
        ini akan selalu tersedia di halaman ini.
      </p>

      <h2>7. Hukum yang berlaku</h2>
      <p>
        Disclaimer ini diatur dan ditafsirkan sesuai dengan hukum Republik Indonesia.
        Segala sengketa yang timbul akan diselesaikan melalui musyawarah, atau jika
        diperlukan, melalui jalur hukum yang berlaku di wilayah hukum Jakarta.
      </p>
    </InfoPage>
  );
}
