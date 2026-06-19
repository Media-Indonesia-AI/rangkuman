"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AtSign, User, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TopTicker } from "@/components/TopTicker";
import { registerUser } from "@/lib/auth";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import { cn } from "@/lib/utils";

type FieldErrors = {
  username?: string;
  name?: string;
  email?: string;
  password?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function DaftarPage() {
  const router = useRouter();
  const user = useCurrentUser();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  // If already logged in, jump straight to /watchlist.
  useEffect(() => {
    if (user) router.replace("/watchlist");
  }, [user, router]);

  // Validate all fields and return the errors object (also sets state).
  function validate(): FieldErrors {
    const next: FieldErrors = {};
    const u = username.trim();
    const n = name.trim();
    const e = email.trim();

    if (!u) next.username = "Username wajib diisi";
    else if (u.length < 6) next.username = "Username minimal 6 karakter";
    else if (u.length > 32) next.username = "Username maksimal 32 karakter";
    else if (!/^[a-zA-Z0-9_.-]+$/.test(u)) {
      next.username = "Username hanya boleh huruf, angka, _ . -";
    }

    if (!n) next.name = "Nama wajib diisi";

    if (!e) next.email = "Email wajib diisi";
    else if (!EMAIL_RE.test(e)) next.email = "Format email tidak valid";

    if (!password) next.password = "Password wajib diisi";
    else if (password.length < 6) next.password = "Password minimal 6 karakter";
    else if (password.length > 128) next.password = "Password maksimal 128 karakter";

    return next;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setLoading(true);
    try {
      await registerUser({
        username: username.trim(),
        name: name.trim(),
        email: email.trim(),
        password,
      });
      router.push("/watchlist");
    } catch (err) {
      // Map server-side / network errors back to the relevant field when possible.
      const msg = err instanceof Error ? err.message : "Gagal daftar";
      const lower = msg.toLowerCase();
      if (lower.includes("username")) {
        setErrors({ username: msg });
      } else if (lower.includes("email")) {
        setErrors({ email: msg });
      } else if (lower.includes("password")) {
        setErrors({ password: msg });
      } else {
        // Network / unknown error — show under the submit button as a form-level message
        setErrors({ password: msg });
      }
      setLoading(false);
    }
  };

  // Clear a field's error as soon as the user edits it.
  const clearError = (field: keyof FieldErrors) =>
    setErrors((prev) => ({ ...prev, [field]: undefined }));

  const inputClass = (field: keyof FieldErrors) =>
    cn(
      "h-10 w-full rounded-md border bg-bg-input pl-8 pr-3 text-[13px] text-text-primary placeholder:text-text-faint focus:outline-none",
      errors[field]
        ? "border-bearish focus:border-bearish"
        : "border-border focus:border-brand",
    );

  const FieldError = ({ id, message }: { id: string; message?: string }) =>
    message ? (
      <p id={id} role="alert" className="mt-1 font-mono text-[11px] text-bearish">
        ⚠ {message}
      </p>
    ) : null;

  return (
    <>
      <TopTicker />
      <Navbar />

      <main className="relative z-10 mx-auto max-w-md px-4 pb-16 pt-10 sm:px-6">
        {/* Card */}
        <div className="overflow-hidden rounded-lg border border-border bg-bg-secondary">
          <div className="border-b border-border bg-bg-tertiary px-5 py-4">
            <div className="mb-2.5">
              <Logo size={36} full />
            </div>
            <h1 className="text-[20px] font-bold leading-tight tracking-tight text-text-primary">
              Daftar di Rangkuman.news
            </h1>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-text-faint">
              Baca lebih sedikit, tahu lebih banyak.
            </p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-text-secondary">
              Bikin akun biar bisa simpan watchlist saham, koleksi berita, dan
              dapet recap yang dipersonalisasi.
            </p>
          </div>

          <div className="p-5">
            {/* Form — noValidate so our JS validation drives the experience */}
            <form onSubmit={handleSubmit} className="space-y-3" noValidate>
              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-widest text-text-muted"
                >
                  Username
                </label>
                <div className="relative">
                  <AtSign
                    className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-faint"
                    aria-hidden
                  />
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value.replace(/\s/g, ""));
                      clearError("username");
                    }}
                    onKeyDown={(e) => { if (e.key === " ") e.preventDefault(); }}
                    placeholder="username_kamu"
                    autoComplete="username"
                    aria-invalid={!!errors.username}
                    aria-describedby={errors.username ? "username-error" : undefined}
                    maxLength={32}
                    className={inputClass("username")}
                  />
                </div>
                <FieldError id="username-error" message={errors.username} />
              </div>

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-widest text-text-muted"
                >
                  Nama
                </label>
                <div className="relative">
                  <User
                    className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-faint"
                    aria-hidden
                  />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      clearError("name");
                    }}
                    placeholder="Nama lengkap kamu"
                    autoComplete="name"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    className={inputClass("name")}
                  />
                </div>
                <FieldError id="name-error" message={errors.name} />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-widest text-text-muted"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-faint"
                    aria-hidden
                  />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value.replace(/\s/g, ""));
                      clearError("email");
                    }}
                    onKeyDown={(e) => { if (e.key === " ") e.preventDefault(); }}
                    placeholder="kamu@email.com"
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className={inputClass("email")}
                  />
                </div>
                <FieldError id="email-error" message={errors.email} />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-widest text-text-muted"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-faint"
                    aria-hidden
                  />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value.replace(/\s/g, ""));
                      clearError("password");
                    }}
                    onKeyDown={(e) => { if (e.key === " ") e.preventDefault(); }}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    maxLength={128}
                    className={inputClass("password")}
                  />
                </div>
                <FieldError id="password-error" message={errors.password} />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-md bg-brand py-2.5 text-[13px] font-semibold text-bg-primary transition-colors hover:bg-brand-hover disabled:opacity-60",
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                    Memproses…
                  </>
                ) : (
                  <>
                    Daftar
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </>
                )}
              </button>

              <p className="text-center font-mono text-[10.5px] text-text-muted">
                Demo mode: <span className="text-text-secondary">username unik (≥ 6 char) + email valid + password ≥ 6 char</span> udah cukup.
              </p>
            </form>
          </div>
        </div>

        <p className="mt-4 text-center text-[11.5px] text-text-muted">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold text-brand hover:text-brand-hover">
            Masuk di sini
          </Link>
        </p>
      </main>
      <Footer />
    </>
  );
}