import { InfoPage } from "@/components/InfoPage";
import { Lock } from "lucide-react";

export default function PrivasiPage() {
  return (
    <InfoPage
      eyebrow="Privasi"
      icon={<Lock className="h-3.5 w-3.5 text-brand" aria-hidden />}
      title="Kebijakan Privasi"
      description="Kami menjaga data lo dengan serius. Halaman ini menjelaskan data apa yang kami kumpulkan, bagaimana kami menggunakannya, dan hak-hak lo sebagai pengguna."
      lastUpdated="2026-06-09"
      related={[
        { label: "Disclaimer", href: "/disclaimer", description: "Batasan tanggung jawab kami" },
        { label: "Syarat & Ketentuan", href: "/syarat-ketentuan", description: "Ketentuan penggunaan" },
        { label: "Kontak", href: "/kontak", description: "Hubungi tim privasi kami" },
        { label: "Tentang", href: "/tentang", description: "Tentang Rangkuman" },
      ]}
    >
      <h2>Ringkasan singkat</h2>
      <ul>
        <li>Kami <strong>tidak menjual</strong> data lo ke pihak ketiga.</li>
        <li>Watchlist & bookmark disimpan <strong>di browser lo</strong> (localStorage), bukan di server kami.</li>
        <li>Login (jika ada) memakai email saja — tanpa password, tanpa data sensitif.</li>
        <li>Lo bisa hapus semua data lokal lo dengan satu klik.</li>
      </ul>

      <h2>1. Data yang kami kumpulkan</h2>
      <p>Kami mengumpulkan tiga jenis data:</p>
      <h3>a. Data yang lo berikan secara sukarela</h3>
      <ul>
        <li>
          <strong>Email</strong> — saat lo login atau subscribe newsletter. Kami pakai ini
          cuma untuk autentikasi & kirim newsletter (kalau lo subscribe).
        </li>
        <li>
          <strong>Watchlist & bookmark</strong> — saham & berita yang lo simpan. Disimpan
          di <strong>localStorage browser lo</strong>, bukan di server kami. Kami gak punya
          akses ke daftar watchlist lo.
        </li>
      </ul>
      <h3>b. Data otomatis</h3>
      <ul>
        <li>
          <strong>Preferensi tema</strong> (dark/light) — disimpan di localStorage.
        </li>
        <li>
          <strong>Preferensi newsletter pill</strong> (sudah dismiss atau belum) —
          localStorage, expires 24 jam.
        </li>
      </ul>
      <h3>c. Data analytics</h3>
      <p>
        Kami tidak memakai third-party analytics tracker di versi demo ini. Versi production
        mungkin akan memakai analytics internal untuk memahami halaman mana yang paling
        sering dikunjungi. Kalau dipakai, lo akan diminta consent dulu.
      </p>

      <h2>2. Bagaimana kami menggunakan data</h2>
      <ul>
        <li>Untuk menyediakan fitur yang lo minta (watchlist, bookmark, newsletter).</li>
        <li>Untuk meningkatkan kualitas konten & UX.</li>
        <li>
          <strong>BUKAN</strong> untuk: iklan bertarget, menjual ke broker, atau profil
          psikografis untuk pihak ketiga.
        </li>
      </ul>

      <h2>3. Cookies & localStorage</h2>
      <p>
        Kami tidak memakai cookies untuk tracking. Kami memakai <code>localStorage</code>
        untuk menyimpan:
      </p>
      <ul>
        <li><code>beritainvestor:theme</code> — preferensi dark/light mode.</li>
        <li><code>beritainvestor:user</code> — sesi login mock (email + nama).</li>
        <li><code>beritainvestor:watchlist</code> — daftar saham di watchlist lo.</li>
        <li><code>berita-investor-saved</code> — daftar berita & saham yang lo bookmark.</li>
        <li><code>beritainvestor:newsletter-email</code> & <code>beritainvestor:newsletter-count</code> — status subscribe newsletter.</li>
        <li><code>beritainvestor:pill-dismissed</code> — kapan pill newsletter terakhir di-dismiss.</li>
      </ul>
      <p>
        Semua data ini tersimpan di browser lo. Lo bisa hapus kapan saja lewat DevTools →
        Application → Local Storage.
      </p>

      <h2>4. Hak lo sebagai pengguna</h2>
      <ul>
        <li>
          <strong>Akses</strong> — lo bisa lihat data apa saja yang tersimpan di browser
          lo (DevTools → Local Storage).
        </li>
        <li>
          <strong>Hapus</strong> — lo bisa hapus semua data lokal dengan clear localStorage
          atau dengan klik &quot;Hapus watchlist&quot; / &quot;Hapus tersimpan&quot; di masing-masing halaman.
        </li>
        <li>
          <strong>Unsubscribe</strong> — email newsletter bisa di-unsubscribe kapan saja
          dengan link di footer email.
        </li>
      </ul>

      <h2>5. Keamanan</h2>
      <p>
        Watchlist & bookmark lo tidak pernah dikirim ke server (kami tidak perlu —
        semua data ini lokal). Kalau lo login, email lo disimpan di server dengan
        enkripsi standar industri.
      </p>
      <p>
        Untuk versi production dengan data real-time, kami akan pakai HTTPS end-to-end,
        token-based auth, dan rate limiting untuk mencegah abuse.
      </p>

      <h2>6. Perubahan kebijakan</h2>
      <p>
        Kami akan memberitahu lo jika ada perubahan material pada kebijakan privasi ini
        via banner di homepage dan/atau email (kalau lo subscribe newsletter).
      </p>

      <h2>7. Hubungi kami</h2>
      <p>
        Ada pertanyaan soal privasi? Hubungi tim kami di <a href="/kontak">halaman Kontak</a>{" "}
        atau email <strong>privacy@rangkuman.news</strong>.
      </p>
    </InfoPage>
  );
}