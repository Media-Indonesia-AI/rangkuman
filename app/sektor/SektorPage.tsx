import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SektorSection } from "@/components/sektor";

export default function SektorPage() {
  return (
    <>
      <Navbar />
      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6 sm:pt-5">
        <SektorSection />
      </main>
      <Footer />
    </>
  );
}