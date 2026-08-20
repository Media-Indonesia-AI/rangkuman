import { InfoPage } from "@/components/InfoPage";
import { FileText } from "lucide-react";

export default function SyaratKetentuanPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      icon={<FileText className="h-3.5 w-3.5 text-brand" aria-hidden />}
      title="Syarat & Ketentuan"
    >
      <h2>1. Penerimaan syarat</h2>
      <p>
        Dengan mengakses Rangkuman (rangkuman.news) — baik sebagai tamu maupun
        pengguna terdaftar — lo dianggap telah membaca, memahami, dan menyetujui seluruh
        isi Syarat & Ketentuan ini. Jika lo tidak menyetujui salah satu poin, mohon untuk
        tidak melanjutkan penggunaan layanan.
      </p>

      <h2>2. Layanan yang kami sediakan</h2>
      <p>Rangkuman menyediakan:</p>
      <ul>
        <li>Ringkasan berita saham harian dari berbagai media.</li>
        <li>Data pasar modal (saat ini: data mock untuk demo).</li>
        <li>Analisis sektoral, market mood, trending, dan tools informatif lainnya.</li>
        <li>Watchlist & bookmark untuk saham favorit (tersimpan di browser lo).</li>
        <li>Newsletter email (opt-in).</li>
      </ul>

      <h2>3. Kewajiban pengguna</h2>
      <p>Sebagai pengguna, lo setuju untuk:</p>
      <ul>
        <li>
          Menggunakan layanan ini hanya untuk tujuan pribadi & non-komersial, kecuali ada
          perjanjian tertulis terpisah.
        </li>
        <li>
          Tidak melakukan scraping, crawling otomatis, atau pengambilan data massal tanpa
          izin tertulis.
        </li>
        <li>
          Tidak memanipulasi, meretas, atau berusaha mengakses area terbatas dari
          layanan.
        </li>
        <li>
          Tidak menggunakan layanan untuk aktivitas yang melanggar hukum Indonesia.
        </li>
      </ul>

      <h2>4. Akun pengguna</h2>
      <p>
        Untuk fitur watchlist & newsletter, lo perlu login dengan email. Kami tidak
        menyimpan password — autentikasi dilakukan via magic link atau social login
        (Google). Lo bertanggung jawab atas keamanan akses ke email lo.
      </p>
      <p>
        Lo bisa logout dan menghapus akun lo kapan saja dengan menghubungi tim kami.
      </p>

      <h2>5. Konten & hak cipta</h2>
      <ul>
        <li>
          <strong>Konten original</strong> (ringkasan, analisis, UI/UX) — hak cipta
          dimiliki oleh Rangkuman. Lo boleh share dengan atribusi yang sesuai.
        </li>
        <li>
          <strong>Konten bersumber</strong> (berita asli dari media partner) — hak cipta
          tetap di media asal. Kami merangkum dengan tujuan informatif, sesuai dengan
          fair use & UU Hak Cipta Indonesia.
        </li>
        <li>
          <strong>Data pasar</strong> — milik PT Bursa Efek Indonesia (BEI) dan sumber
          resminya. Kami menampilkan sesuai lisensi data yang berlaku.
        </li>
      </ul>

      <h2>6. Batasan tanggung jawab</h2>
      <p>
        Poin utamanya: kami <strong>tidak</strong> bertanggung jawab atas kerugian finansial
        yang timbul dari keputusan investasi yang diambil berdasarkan informasi di
        Rangkuman.
      </p>

      <h2>7. Perubahan layanan</h2>
      <p>
        Kami dapat menambah, mengubah, atau menghentikan fitur apa pun sewaktu-waktu
        dengan atau tanpa pemberitahuan. Untuk perubahan material, kami akan berusaha
        memberi tahu via banner di homepage dan/atau email.
      </p>

      <h2>8. Penangguhan & pemutusan akun</h2>
      <p>
        Kami berhak menangguhkan atau menghentikan akun lo jika:
      </p>
      <ul>
        <li>Lo melanggar Syarat & Ketentuan ini.</li>
        <li>Lo menggunakan layanan untuk aktivitas ilegal.</li>
        <li>Ada indikasi abuse atau serangan terhadap sistem kami.</li>
      </ul>

      <h2>9. Hukum yang berlaku</h2>
      <p>
        Syarat & Ketentuan ini diatur oleh hukum Republik Indonesia. Segala sengketa
        akan diselesaikan secara musyawarah, atau jika gagal, melalui Pengadilan Negeri
        Jakarta Pusat.
      </p>

      <h2>10. Hubungi kami</h2>
      <p>
        Pertanyaan soal Syarat & Ketentuan? Hubungi <a href="/kontak-kerjasama">halaman Kontak &amp; Kerjasama</a>{" "}
        atau email <strong>legal@rangkuman.news</strong>.
      </p>
    </InfoPage>
  );
}