import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EmptyState } from "@/components/EmptyState";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-8 sm:px-6">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Kembali ke Beranda
        </Link>
        <EmptyState
          title="Halaman tidak ditemukan"
          description="Saham atau halaman yang lo cari tidak ada di sini."
          suggestion="Coba cek daftar saham populer dari beranda."
        />
      </main>
      <Footer />
    </>
  );
}
