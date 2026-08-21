import { InfoPage } from "@/components/InfoPage";
import { FileText } from "lucide-react";

export default function SyaratKetentuanPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      icon={<FileText className="h-3.5 w-3.5 text-brand" aria-hidden />}
      title="Syarat & Ketentuan"
    >
      {/* Metadata — last-updated stamp above the intro. Rendered as a
          `<div>` (not a `<p>`) so the prose container's
          `[&_p]:text-text-secondary` rule doesn't override the
          `text-text-faint` color and the small monospace label stays
          visually distinct from the body copy. */}
      <div className="font-mono text-[10.5px] uppercase tracking-widest text-text-faint">
        Terakhir diperbarui: 20 Agustus 2026
      </div>

      {/* Intro */}
      <p>Selamat datang di Rangkuman.news.</p>
      <p>
        Syarat &amp; Ketentuan ini mengatur akses dan penggunaan situs web
        Rangkuman.news beserta seluruh fitur, konten, informasi, layanan,
        dan produk digital yang tersedia melalui Rangkuman.news
        (&ldquo;Layanan&rdquo;).
      </p>
      <p>
        Dengan mengakses atau menggunakan Rangkuman.news, Anda menyatakan
        telah membaca, memahami, dan menyetujui Syarat &amp; Ketentuan
        ini.
      </p>
      <p>
        Apabila Anda tidak menyetujui Syarat &amp; Ketentuan ini, mohon
        untuk tidak menggunakan Layanan.
      </p>

      {/* 1. Tentang Rangkuman.news */}
      <h2>1. Tentang Rangkuman.news</h2>
      <p>
        Rangkuman.news merupakan platform informasi yang membantu pengguna
        memahami perkembangan pasar, perusahaan, aset keuangan, dan topik
        terkait melalui pengumpulan, pengelompokan, penyederhanaan, dan
        penyajian informasi dari berbagai sumber.
      </p>
      <p>Layanan Rangkuman.news dapat mencakup antara lain:</p>
      <ul>
        <li>ringkasan berita;</li>
        <li>pengelompokan beberapa artikel menjadi satu cerita atau peristiwa;</li>
        <li>informasi terkait saham, aset digital, perusahaan, sektor, atau pasar;</li>
        <li>data dan indikator pasar;</li>
        <li>analisis sentimen;</li>
        <li>rangkuman berbasis teknologi kecerdasan buatan;</li>
        <li>watchlist dan bookmark;</li>
        <li>notifikasi dan newsletter;</li>
        <li>fitur pencarian;</li>
        <li>fitur personalisasi; dan</li>
        <li>fitur informasi lainnya yang dapat kami tambahkan dari waktu ke waktu.</li>
      </ul>
      <p>
        Rangkuman.news dapat menggunakan teknologi otomatisasi dan
        kecerdasan buatan untuk membantu memproses, mengelompokkan,
        menganalisis, atau merangkum informasi.
      </p>
      <p>
        Kami berupaya menjaga kualitas informasi, namun penggunaan
        teknologi otomatis tidak menghilangkan kemungkinan terjadinya
        kesalahan.
      </p>

      {/* 2. Bukan Rekomendasi Investasi */}
      <h2>2. Bukan Rekomendasi Investasi</h2>
      <p>
        Seluruh informasi yang tersedia di Rangkuman.news disediakan
        untuk tujuan informasi, edukasi, dan literasi semata.
      </p>
      <p>
        Rangkuman.news bukan merupakan penasihat investasi, manajer
        investasi, perusahaan efek, broker, dealer, bursa, penasihat
        keuangan pribadi, atau pihak lain yang memberikan rekomendasi
        investasi yang dipersonalisasi, kecuali secara tegas dinyatakan
        dan dilakukan berdasarkan izin yang diwajibkan oleh peraturan
        perundang-undangan.
      </p>
      <p>Konten di Rangkuman.news tidak boleh dianggap sebagai:</p>
      <ul>
        <li>rekomendasi untuk membeli, menjual, atau mempertahankan suatu efek atau aset;</li>
        <li>ajakan atau penawaran untuk melakukan transaksi investasi;</li>
        <li>jaminan mengenai kinerja suatu investasi;</li>
        <li>rekomendasi investasi yang mempertimbangkan kondisi keuangan pribadi pengguna;</li>
        <li>nasihat hukum, pajak, keuangan, atau investasi; atau</li>
        <li>pernyataan bahwa suatu aset pasti akan naik atau turun.</li>
      </ul>
      <p>
        Istilah seperti positif, negatif, bullish, bearish, sentimen,
        dampak, momentum, atau istilah serupa merupakan deskripsi atau
        analisis informasi dan bukan instruksi untuk melakukan transaksi.
      </p>
      <p>
        Setiap keputusan investasi sepenuhnya menjadi tanggung jawab
        pengguna.
      </p>

      {/* 3. Risiko Investasi */}
      <h2>3. Risiko Investasi</h2>
      <p>
        Investasi pada saham, aset digital, dan instrumen keuangan
        lainnya mengandung risiko.
      </p>
      <p>
        Nilai suatu aset dapat naik maupun turun dan pengguna dapat
        kehilangan sebagian atau seluruh dana yang diinvestasikan.
      </p>
      <p>Kinerja historis tidak menjamin hasil di masa depan.</p>
      <p>
        Sebelum mengambil keputusan investasi, pengguna harus melakukan
        riset sendiri dan mempertimbangkan antara lain:
      </p>
      <ul>
        <li>tujuan investasi;</li>
        <li>kondisi keuangan;</li>
        <li>jangka waktu investasi;</li>
        <li>toleransi terhadap risiko; dan</li>
        <li>apabila diperlukan, berkonsultasi dengan profesional yang memiliki izin dan kompetensi yang sesuai.</li>
      </ul>

      {/* 4. Informasi dan Data Pasar */}
      <h2>4. Informasi dan Data Pasar</h2>
      <p>Rangkuman.news dapat menampilkan antara lain:</p>
      <ul>
        <li>harga saham;</li>
        <li>perubahan harga;</li>
        <li>indeks;</li>
        <li>harga aset digital;</li>
        <li>data perdagangan;</li>
        <li>indikator ekonomi;</li>
        <li>volume;</li>
        <li>grafik;</li>
        <li>data fundamental; dan</li>
        <li>informasi pasar lainnya.</li>
      </ul>
      <p>
        Data dapat berasal dari penyedia data pihak ketiga, sumber
        publik, media, bursa, mitra, atau penyedia layanan lainnya.
      </p>
      <p>
        Kecuali secara eksplisit diberi label <em>real-time</em> atau{" "}
        <em>live</em>, pengguna tidak boleh mengasumsikan bahwa data
        yang ditampilkan merupakan data real-time.
      </p>
      <p>Data dapat:</p>
      <ul>
        <li>mengalami keterlambatan;</li>
        <li>tidak lengkap;</li>
        <li>mengalami gangguan;</li>
        <li>belum diperbarui;</li>
        <li>berbeda dengan sumber lain; atau</li>
        <li>mengandung kesalahan teknis maupun administratif.</li>
      </ul>
      <p>
        Apabila suatu fitur menggunakan data simulasi atau data contoh,
        Rangkuman.news akan berupaya memberikan penanda yang sesuai.
      </p>
      <p>
        Untuk keputusan transaksi, pengguna disarankan untuk melakukan
        konfirmasi melalui sumber resmi atau penyedia layanan transaksi
        yang digunakan oleh pengguna.
      </p>

      {/* 5. Ringkasan Berita dan Sumber Pihak Ketiga */}
      <h2>5. Ringkasan Berita dan Sumber Pihak Ketiga</h2>
      <p>
        Rangkuman.news mengumpulkan dan mengolah informasi dari berbagai
        sumber.
      </p>
      <p>
        Beberapa artikel dari media berbeda yang membahas kejadian yang
        sama dapat dikelompokkan oleh sistem Rangkuman.news menjadi satu
        &ldquo;cerita&rdquo;, &ldquo;story&rdquo;, atau rangkuman.
      </p>
      <p>Rangkuman.news dapat:</p>
      <ul>
        <li>membuat judul ringkasan sendiri;</li>
        <li>menyederhanakan informasi;</li>
        <li>menggabungkan fakta yang terdapat dalam beberapa sumber;</li>
        <li>mengidentifikasi perusahaan atau aset yang terkait;</li>
        <li>memberikan konteks;</li>
        <li>melakukan klasifikasi;</li>
        <li>dan menampilkan indikator atau analisis tambahan.</li>
      </ul>
      <p>
        Hak atas artikel asli, merek, logo, foto, video, dan materi
        milik pihak ketiga tetap berada pada pemegang hak masing-masing.
      </p>
      <p>
        Jika tersedia, Rangkuman.news dapat menyediakan tautan menuju
        sumber asli agar pengguna dapat membaca informasi secara lebih
        lengkap.
      </p>
      <p>
        Pencantuman atau penggunaan suatu sumber tidak berarti bahwa
        media atau pihak tersebut mendukung, bekerja sama dengan, atau
        memiliki hubungan dengan Rangkuman.news, kecuali dinyatakan
        secara jelas.
      </p>

      {/* 6. Penggunaan Kecerdasan Buatan */}
      <h2>6. Penggunaan Kecerdasan Buatan</h2>
      <p>
        Sebagian proses di Rangkuman.news dapat dibantu oleh sistem
        kecerdasan buatan (&ldquo;AI&rdquo;), termasuk tetapi tidak
        terbatas pada:
      </p>
      <ul>
        <li>klasifikasi berita;</li>
        <li>pengelompokan artikel;</li>
        <li>pembuatan ringkasan;</li>
        <li>identifikasi entitas;</li>
        <li>analisis sentimen;</li>
        <li>penentuan relevansi;</li>
        <li>penerjemahan;</li>
        <li>dan penyajian konteks.</li>
      </ul>
      <p>
        Walaupun kami dapat menerapkan proses pemeriksaan otomatis
        maupun editorial, hasil yang dihasilkan atau dibantu oleh AI
        tetap dapat mengandung:
      </p>
      <ul>
        <li>kesalahan;</li>
        <li>interpretasi yang tidak tepat;</li>
        <li>informasi yang tidak lengkap;</li>
        <li>kesalahan angka;</li>
        <li>kesalahan identifikasi perusahaan atau aset;</li>
        <li>atau konteks yang tidak sempurna.</li>
      </ul>
      <p>
        Pengguna dianjurkan untuk memeriksa sumber asli untuk informasi
        yang dianggap material sebelum mengambil keputusan.
      </p>

      {/* 7. Akurasi dan Koreksi */}
      <h2>7. Akurasi dan Koreksi</h2>
      <p>
        Rangkuman.news berupaya menyajikan informasi secara akurat,
        relevan, dan tidak menyesatkan.
      </p>
      <p>Namun kami tidak menjamin bahwa seluruh informasi selalu:</p>
      <ul>
        <li>lengkap;</li>
        <li>bebas dari kesalahan;</li>
        <li>tersedia setiap saat;</li>
        <li>terbaru;</li>
        <li>atau sesuai dengan kebutuhan tertentu pengguna.</li>
      </ul>
      <p>
        Apabila terdapat kesalahan faktual, pengguna, perusahaan, media,
        atau pihak terkait dapat mengajukan koreksi melalui halaman
        <a href="/kontak-kerjasama"> Kontak &amp; Kerjasama</a>.
      </p>
      <p>
        Kami berhak memperbarui, memperbaiki, menambahkan konteks, atau
        menghapus informasi apabila dianggap diperlukan.
      </p>
      <p>
        Jika perubahan bersifat material, kami dapat memberikan penanda
        bahwa konten telah diperbarui atau dikoreksi.
      </p>

      {/* 8. Akun Pengguna */}
      <h2>8. Akun Pengguna</h2>
      <p>Beberapa fitur Rangkuman.news dapat memerlukan akun.</p>
      <p>Pengguna bertanggung jawab untuk:</p>
      <ul>
        <li>memberikan informasi yang benar;</li>
        <li>menjaga keamanan email atau metode autentikasi;</li>
        <li>menjaga keamanan sesi akun;</li>
        <li>dan segera memberi tahu kami jika mengetahui adanya penggunaan akun tanpa izin.</li>
      </ul>
      <p>Pengguna tidak diperkenankan:</p>
      <ul>
        <li>menggunakan identitas orang lain tanpa izin;</li>
        <li>membuat akun untuk aktivitas ilegal;</li>
        <li>menjual atau memperjualbelikan akses akun;</li>
        <li>atau menggunakan sistem otomatis untuk membuat akun secara massal.</li>
      </ul>
      <p>
        Kami dapat membatasi, menangguhkan, atau menutup akun apabila
        terdapat indikasi penyalahgunaan atau pelanggaran terhadap
        Syarat &amp; Ketentuan ini.
      </p>

      {/* 9. Watchlist, Bookmark, dan Personalisasi */}
      <h2>9. Watchlist, Bookmark, dan Personalisasi</h2>
      <p>Rangkuman.news dapat menyediakan fitur seperti:</p>
      <ul>
        <li>watchlist;</li>
        <li>bookmark;</li>
        <li>rekomendasi cerita;</li>
        <li>preferensi saham atau aset;</li>
        <li>notifikasi;</li>
        <li>dan personalisasi informasi.</li>
      </ul>
      <p>
        Keberadaan suatu aset dalam watchlist atau munculnya suatu
        konten dalam rekomendasi tidak berarti Rangkuman.news
        merekomendasikan aset tersebut untuk dibeli atau dijual.
      </p>
      <p>
        Personalisasi hanya digunakan untuk membantu pengguna menemukan
        informasi yang lebih relevan.
      </p>

      {/* 10. Notifikasi dan Newsletter */}
      <h2>10. Notifikasi dan Newsletter</h2>
      <p>
        Pengguna dapat memilih untuk menerima newsletter, notifikasi,
        atau komunikasi lain dari Rangkuman.news.
      </p>
      <p>
        Pengguna dapat berhenti berlangganan komunikasi pemasaran
        melalui mekanisme unsubscribe yang tersedia.
      </p>
      <p>
        Komunikasi yang diperlukan untuk keamanan akun, perubahan
        material terhadap Layanan, atau informasi administratif tertentu
        dapat tetap dikirim apabila diperlukan.
      </p>

      {/* 11. Penggunaan yang Diperbolehkan */}
      <h2>11. Penggunaan yang Diperbolehkan</h2>
      <p>
        Rangkuman.news memberikan kepada pengguna hak terbatas, dapat
        dicabut, non-eksklusif, dan tidak dapat dialihkan untuk
        menggunakan Layanan untuk tujuan yang sah.
      </p>
      <p>
        Tanpa izin tertulis dari Rangkuman.news, pengguna tidak
        diperbolehkan:
      </p>
      <ul>
        <li>melakukan scraping atau crawling dalam skala besar;</li>
        <li>mengunduh database secara massal;</li>
        <li>menyalin atau merepublikasikan sebagian besar konten secara sistematis;</li>
        <li>membangun produk komersial berdasarkan data atau konten Rangkuman.news;</li>
        <li>menjual kembali konten atau akses ke Layanan;</li>
        <li>melewati sistem autentikasi, paywall, rate limit, atau mekanisme keamanan;</li>
        <li>melakukan reverse engineering sejauh dilarang oleh hukum;</li>
        <li>menggunakan bot untuk membebani sistem secara tidak wajar;</li>
        <li>memasukkan malware atau kode berbahaya;</li>
        <li>mencoba mendapatkan akses tanpa izin;</li>
        <li>mengganggu operasional Layanan;</li>
        <li>atau menggunakan Layanan untuk tindakan yang melanggar hukum.</li>
      </ul>
      <p>
        Penggunaan API atau data secara komersial, apabila tersedia,
        tunduk pada perjanjian atau ketentuan tersendiri.
      </p>

      {/* 12. Hak Kekayaan Intelektual */}
      <h2>12. Hak Kekayaan Intelektual</h2>
      <p>
        Sepanjang tidak dinyatakan lain, desain, perangkat lunak,
        struktur informasi, sistem pengelompokan, ringkasan original,
        branding, logo, antarmuka, dan materi original lain yang dibuat
        oleh Rangkuman.news dilindungi oleh hak kekayaan intelektual
        yang berlaku.
      </p>
      <p>
        Hak atas konten pihak ketiga tetap dimiliki oleh pihak
        masing-masing.
      </p>
      <p>
        Pengguna diperbolehkan membagikan tautan menuju halaman
        Rangkuman.news dan mengutip bagian terbatas dari konten untuk
        penggunaan yang wajar dan sah dengan atribusi yang sesuai.
      </p>
      <p>
        Tidak ada ketentuan dalam Syarat &amp; Ketentuan ini yang dapat
        dianggap sebagai pengalihan hak kekayaan intelektual kepada
        pengguna.
      </p>

      {/* 13. Tautan dan Layanan Pihak Ketiga */}
      <h2>13. Tautan dan Layanan Pihak Ketiga</h2>
      <p>Rangkuman.news dapat menyediakan tautan ke:</p>
      <ul>
        <li>situs berita;</li>
        <li>bursa;</li>
        <li>perusahaan publik;</li>
        <li>penyedia data;</li>
        <li>platform perdagangan;</li>
        <li>media sosial;</li>
        <li>atau layanan pihak ketiga lainnya.</li>
      </ul>
      <p>
        Rangkuman.news tidak mengendalikan dan tidak bertanggung jawab
        atas isi, keamanan, ketersediaan, kebijakan, maupun aktivitas
        situs atau layanan pihak ketiga tersebut.
      </p>
      <p>
        Pengguna mengakses layanan pihak ketiga atas pertimbangan dan
        risiko sendiri.
      </p>

      {/* 14. Kerja Sama, Sponsor, dan Konten Komersial */}
      <h2>14. Kerja Sama, Sponsor, dan Konten Komersial</h2>
      <p>
        Rangkuman.news dapat melakukan kerja sama komersial dengan
        perusahaan, lembaga keuangan, media, penyedia layanan, atau
        pihak lain.
      </p>
      <p>Apabila suatu konten merupakan:</p>
      <ul>
        <li>iklan;</li>
        <li>sponsorship;</li>
        <li>paid partnership;</li>
        <li>affiliate content;</li>
        <li>atau komunikasi komersial lainnya,</li>
      </ul>
      <p>
        kami akan berupaya memberikan label yang jelas dan sesuai.
      </p>
      <p>
        Hubungan komersial tidak boleh digunakan untuk menyamarkan
        iklan sebagai analisis editorial independen.
      </p>
      <p>
        Apabila terdapat potensi konflik kepentingan yang material, kami
        dapat memberikan pengungkapan yang sesuai.
      </p>

      {/* 15. Layanan Berbayar */}
      <h2>15. Layanan Berbayar</h2>
      <p>
        Rangkuman.news dapat menyediakan fitur atau paket berbayar di
        masa mendatang.
      </p>
      <p>Apabila pengguna membeli layanan berbayar, informasi mengenai:</p>
      <ul>
        <li>harga;</li>
        <li>periode langganan;</li>
        <li>metode pembayaran;</li>
        <li>pajak;</li>
        <li>perpanjangan;</li>
        <li>pembatalan;</li>
        <li>dan kebijakan pengembalian dana</li>
      </ul>
      <p>akan diinformasikan sebelum transaksi dilakukan.</p>
      <p>
        Ketentuan tambahan dapat berlaku terhadap produk atau layanan
        berbayar tertentu.
      </p>

      {/* 16. Privasi dan Data Pribadi */}
      <h2>16. Privasi dan Data Pribadi</h2>
      <p>
        Penggunaan data pribadi pengguna diatur lebih lanjut dalam
        <a href="/kebijakan-privasi"> Kebijakan Privasi</a> Rangkuman.news.
      </p>
      <p>Kami dapat memproses data yang diperlukan untuk antara lain:</p>
      <ul>
        <li>menyediakan Layanan;</li>
        <li>autentikasi akun;</li>
        <li>keamanan;</li>
        <li>personalisasi;</li>
        <li>komunikasi;</li>
        <li>analitik;</li>
        <li>peningkatan kualitas produk;</li>
        <li>dan pemenuhan kewajiban hukum.</li>
      </ul>
      <p>
        Pemrosesan data pribadi dilakukan sesuai kebijakan privasi kami
        dan ketentuan peraturan perundang-undangan yang berlaku.
      </p>

      {/* 17. Keamanan */}
      <h2>17. Keamanan</h2>
      <p>
        Kami menerapkan langkah teknis dan organisasi yang kami anggap
        wajar untuk melindungi sistem dan data.
      </p>
      <p>Namun tidak ada sistem digital yang dapat dijamin sepenuhnya bebas dari:</p>
      <ul>
        <li>gangguan;</li>
        <li>serangan;</li>
        <li>kehilangan data;</li>
        <li>akses tidak sah;</li>
        <li>atau kerentanan keamanan.</li>
      </ul>
      <p>
        Pengguna juga bertanggung jawab untuk menjaga keamanan perangkat
        dan akun yang digunakan untuk mengakses Rangkuman.news.
      </p>

      {/* 18. Ketersediaan Layanan */}
      <h2>18. Ketersediaan Layanan</h2>
      <p>
        Kami tidak menjamin bahwa Rangkuman.news akan tersedia tanpa
        gangguan setiap saat.
      </p>
      <p>Kami dapat melakukan:</p>
      <ul>
        <li>maintenance;</li>
        <li>update;</li>
        <li>perubahan sistem;</li>
        <li>penghentian fitur;</li>
        <li>perubahan penyedia data;</li>
        <li>atau pembatasan akses</li>
      </ul>
      <p>apabila diperlukan.</p>
      <p>
        Dalam kondisi tertentu, sebagian atau seluruh Layanan dapat
        dihentikan sementara tanpa pemberitahuan terlebih dahulu.
      </p>

      {/* 19. Perubahan Layanan */}
      <h2>19. Perubahan Layanan</h2>
      <p>
        Rangkuman.news dapat menambah, mengubah, mengganti, atau
        menghentikan sebagian fitur atau Layanan dari waktu ke waktu.
      </p>
      <p>
        Untuk perubahan yang material terhadap hak atau kewajiban
        pengguna, kami akan berupaya memberikan pemberitahuan yang wajar
        melalui situs, email, atau media komunikasi lainnya.
      </p>

      {/* 20. Penangguhan dan Penghentian Akun */}
      <h2>20. Penangguhan dan Penghentian Akun</h2>
      <p>
        Kami dapat membatasi, menangguhkan, atau menghentikan akun
        apabila pengguna:
      </p>
      <ul>
        <li>melanggar Syarat &amp; Ketentuan;</li>
        <li>melakukan aktivitas ilegal;</li>
        <li>mencoba merusak atau mengeksploitasi sistem;</li>
        <li>melakukan scraping atau penggunaan otomatis yang tidak diizinkan;</li>
        <li>melakukan penipuan;</li>
        <li>mengganggu pengguna lain;</li>
        <li>atau menimbulkan risiko terhadap keamanan Rangkuman.news.</li>
      </ul>
      <p>
        Apabila memungkinkan dan sesuai, pengguna dapat menghubungi kami
        untuk meminta penjelasan atau peninjauan terhadap tindakan
        tersebut.
      </p>

      {/* 21. Batasan Tanggung Jawab */}
      <h2>21. Batasan Tanggung Jawab</h2>
      <p>
        Sejauh diperbolehkan oleh hukum yang berlaku, Rangkuman.news
        tidak bertanggung jawab atas kerugian yang timbul akibat:
      </p>
      <ul>
        <li>keputusan investasi pengguna;</li>
        <li>perubahan harga pasar;</li>
        <li>penggunaan atau ketergantungan terhadap informasi di Rangkuman.news;</li>
        <li>keterlambatan atau kesalahan data;</li>
        <li>kesalahan ringkasan atau analisis;</li>
        <li>gangguan layanan pihak ketiga;</li>
        <li>kehilangan keuntungan;</li>
        <li>kehilangan kesempatan;</li>
        <li>atau gangguan teknis yang berada di luar kendali wajar kami.</li>
      </ul>
      <p>
        Tidak ada ketentuan dalam Syarat &amp; Ketentuan ini yang
        dimaksudkan untuk menghapus hak pengguna atau kewajiban
        Rangkuman.news yang tidak dapat dikesampingkan berdasarkan hukum
        Indonesia.
      </p>

      {/* 22. Keadaan di Luar Kendali */}
      <h2>22. Keadaan di Luar Kendali</h2>
      <p>
        Rangkuman.news tidak bertanggung jawab atas kegagalan atau
        keterlambatan Layanan yang disebabkan oleh keadaan di luar
        kendali wajar kami, termasuk tetapi tidak terbatas pada:
      </p>
      <ul>
        <li>bencana alam;</li>
        <li>gangguan jaringan internet;</li>
        <li>gangguan pusat data;</li>
        <li>serangan siber berskala besar;</li>
        <li>gangguan penyedia cloud;</li>
        <li>gangguan penyedia data;</li>
        <li>tindakan pemerintah;</li>
        <li>perubahan regulasi;</li>
        <li>gangguan bursa;</li>
        <li>atau kejadian force majeure lainnya.</li>
      </ul>

      {/* 23. Perubahan Syarat & Ketentuan */}
      <h2>23. Perubahan Syarat &amp; Ketentuan</h2>
      <p>
        Kami dapat memperbarui Syarat &amp; Ketentuan ini dari waktu ke
        waktu.
      </p>
      <p>
        Tanggal pembaruan terakhir akan dicantumkan di bagian atas
        halaman.
      </p>
      <p>
        Apabila perubahan bersifat material, kami akan berupaya
        memberikan pemberitahuan melalui situs, akun, email, atau sarana
        komunikasi lainnya sebelum atau pada saat perubahan berlaku.
      </p>
      <p>
        Penggunaan Layanan setelah perubahan berlaku dianggap sebagai
        penerimaan terhadap Syarat &amp; Ketentuan yang diperbarui,
        sepanjang diperbolehkan berdasarkan hukum yang berlaku.
      </p>

      {/* 24. Hukum yang Berlaku dan Penyelesaian Sengketa */}
      <h2>24. Hukum yang Berlaku dan Penyelesaian Sengketa</h2>
      <p>
        Syarat &amp; Ketentuan ini diatur dan ditafsirkan berdasarkan
        hukum Republik Indonesia.
      </p>
      <p>
        Apabila terjadi perselisihan, pengguna dan Rangkuman.news akan
        terlebih dahulu berupaya menyelesaikannya melalui musyawarah
        dengan itikad baik.
      </p>
      <p>
        Apabila sengketa tidak dapat diselesaikan secara musyawarah,
        penyelesaian selanjutnya akan dilakukan melalui mekanisme yang
        diperbolehkan berdasarkan peraturan perundang-undangan Indonesia
        yang berlaku.
      </p>

      {/* 25. Keterpisahan Ketentuan */}
      <h2>25. Keterpisahan Ketentuan</h2>
      <p>
        Apabila satu atau lebih ketentuan dalam Syarat &amp; Ketentuan
        ini dinyatakan tidak sah, tidak berlaku, atau tidak dapat
        dilaksanakan, ketentuan lainnya akan tetap berlaku sejauh
        diperbolehkan oleh hukum.
      </p>

      {/* 26. Tidak Ada Pengabaian Hak */}
      <h2>26. Tidak Ada Pengabaian Hak</h2>
      <p>
        Kegagalan Rangkuman.news dalam menegakkan suatu ketentuan tidak
        berarti bahwa kami melepaskan hak untuk menegakkan ketentuan
        tersebut di kemudian hari.
      </p>

      {/* 27. Kontak */}
      <h2>27. Kontak</h2>
      <p>
        Apabila Anda memiliki pertanyaan, permintaan koreksi, laporan
        penyalahgunaan, pertanyaan hukum, atau pertanyaan mengenai
        Syarat &amp; Ketentuan ini, silakan menghubungi kami melalui
        halaman <a href="/kontak-kerjasama">Kontak &amp; Kerjasama</a>{" "}
        Rangkuman.news.
      </p>

      {/* Coda — brand signature block. Renders as a `<div>` (not a `<p>`)
          so the prose container's `[&_p]:text-text-secondary` rule
          doesn't override the `text-text-primary` / `text-text-faint`
          / `text-text-muted` colors. The `border-t` gives a clear
          visual break from the 27 sections above; the centered monospace
          typography matches the project label vocabulary. */}
      <div className="mt-10 border-t border-border pt-6 text-center">
        <div className="font-mono text-[11px] font-semibold uppercase tracking-widest text-text-primary">
          Rangkuman.news
        </div>
        <div className="mt-1 font-mono text-[10.5px] uppercase tracking-widest text-text-faint">
          Baca lebih sedikit, tahu lebih banyak.
        </div>
        <div className="mt-3 italic text-text-muted">
          Informasi untuk tujuan edukasi dan informasi, bukan rekomendasi
          investasi.
        </div>
      </div>
    </InfoPage>
  );
}
