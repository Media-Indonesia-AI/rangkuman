import { InfoPage } from "@/components/InfoPage";
import { ShieldCheck } from "lucide-react";

export default function PedomanMediaSiberPage() {
  return (
    <InfoPage
      eyebrow="Editorial"
      icon={<ShieldCheck className="h-3.5 w-3.5 text-brand" aria-hidden />}
      title="Pedoman Media Siber"
      description="Standar editorial yang kami pegang di Rangkuman — acuan kami adalah UU Pers No. 40/1999 dan Pedoman Media Siber Dewan Pers."
      lastUpdated="2026-06-09"
      related={[
        { label: "Disclaimer", href: "/disclaimer", description: "Batasan tanggung jawab" },
        { label: "Kerjasama", href: "/kerjasama", description: "Tentang Rangkuman" },
        { label: "Kontak", href: "/kontak", description: "Lapor koreksi" },
      ]}
    >
      <h2>Acuan utama</h2>
      <p>
        Pedoman ini disusun dengan mengacu pada:
      </p>
      <ul>
        <li>Undang-Undang No. 40 Tahun 1999 tentang Pers.</li>
        <li>Pedoman Media Siber (PMS) Dewan Pers, tahun 2012 (perubahan 2016).</li>
        <li>Kode Etik Jurnalistik (KEJ) Dewan Pers.</li>
        <li>Prinsip-prinsip jurnalisme independen (independensi, akurasi, fairness).</li>
      </ul>

      <h2>Standar editorial kami</h2>
      <h3>1. Akurasi</h3>
      <ul>
        <li>
          Setiap ringkasan memuat link ke <strong>sumber asli</strong>. Lo bisa cek
          sendiri.
        </li>
        <li>
          Kami membedakan dengan jelas antara <strong>fakta</strong> (kutipan, angka
          resmi) dan <strong>analisis/interpretasi</strong> (sentimen, opini redaksi).
        </li>
        <li>
          Data pasar (harga, volume) yang ditampilkan saat ini adalah data simulasi untuk
          demo produk. Versi production akan pakai data real-time dari BEI.
        </li>
      </ul>

      <h3>2. Independensi</h3>
      <ul>
        <li>
          Kami <strong>tidak menerima pembayaran</strong> dari emiten, broker, atau
          pihak ketiga untuk liputan tertentu.
        </li>
        <li>
          Sentimen (Positif/Netral/Negatif) ditentukan oleh <strong>tim redaksi</strong>
          berdasarkan tone pemberitaan, bukan input dari pihak luar.
        </li>
        <li>
          Iklan (jika ada di versi production) akan ditandai jelas dan tidak akan
          mempengaruhi editorial.
        </li>
      </ul>

      <h3>3. Fairness & keseimbangan</h3>
      <ul>
        <li>
          Kami berusaha menampilkan berbagai sudut pandang dalam story agregat kami.
        </li>
        <li>
          Untuk emiten yang sedang dalam sorotan (misal: kasus hukum, restrukturisasi),
          kami menyertakan konteks dari kedua sisi.
        </li>
      </ul>

      <h3>4. Transparansi</h3>
      <ul>
        <li>
          Sumber dana, partner, dan conflict of interest akan diumumkan di halaman ini
          (jika material).
        </li>
        <li>
          Kalau lo menemukan kesalahan, kami akan koreksi secara terbuka dengan label
          &quot;KOREKSI&quot; di artikel yang sama.
        </li>
      </ul>

      <h2>Etika peliputan</h2>
      <h3>Privasi & data pribadi</h3>
      <p>
        Kami tidak menampilkan data pribadi investor ritel (nama, portofolio) tanpa
        izin eksplisit. Watchlist & bookmark yang lo simpan di Rangkuman tersimpan
        lokal di browser lo — kami tidak punya akses.
      </p>

      <h3>Hak cipta</h3>
      <p>
        Kami merangkum berita dari media partner dengan <strong>fair use</strong> sesuai
        UU Hak Cipta Indonesia. Hak cipta atas konten asli tetap di media asal. Jika
        lo merasa ada pelanggaran, hubungi kami via{" "}
        <a href="/kontak">Kontak</a>.
      </p>

      <h3>Manipulasi pasar</h3>
      <p>
        Kami <strong>sangat menentang</strong> penggunaan informasi di Rangkuman
        untuk:
      </p>
      <ul>
        <li>Insider trading atau aktivitas manipulatif lainnya.</li>
        <li>Pump-and-dump atau coordinated selling.</li>
        <li>Misinformasi yang bisa merugikan investor lain.</li>
      </ul>

      <h2>Koreksi & klarifikasi</h2>
      <p>
        Kalau lo menemukan kesalahan fakta di Rangkuman, mohon laporkan ke{" "}
        <strong>redaksi@rangkuman.news</strong> dengan subject{" "}
        <code>KOREKSI: [judul artikel]</code>. Kami akan:
      </p>
      <ol>
        <li>Verifikasi laporan dalam 4-8 jam.</li>
        <li>Mengoreksi artikel dengan label &quot;KOREKSI&quot; + timestamp.</li>
        <li>Memberitahu lo via email setelah koreksi dipublikasikan.</li>
      </ol>

      <h2>Pengaduan</h2>
      <p>
        Jika lo merasa Rangkuman melanggar Pedoman Media Siber atau UU Pers, lo
        bisa mengadu ke:
      </p>
      <ul>
        <li>
          <strong>Dewan Pers</strong> — <a href="https://dewanpers.or.id" target="_blank" rel="noopener noreferrer">dewanpers.or.id</a>
        </li>
        <li>
          <strong>Redaksi kami</strong> — <a href="/kontak">halaman Kontak</a>
        </li>
      </ul>
    </InfoPage>
  );
}