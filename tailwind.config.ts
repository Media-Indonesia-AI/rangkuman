import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Backgrounds — switched via CSS vars on .dark / :root
        "bg-primary": "var(--bg-primary)",
        "bg-secondary": "var(--bg-secondary)",
        "bg-tertiary": "var(--bg-tertiary)",
        "bg-elevated": "var(--bg-elevated)",
        "bg-input": "var(--bg-input)",
        // Text
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        "text-faint": "var(--text-faint)",
        // Borders
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        // Brand — Bitcoin orange (constant in both themes)
        brand: "var(--brand)",
        "brand-hover": "var(--brand-hover)",
        "brand-soft": "var(--brand-soft)",
        "brand-line": "var(--brand-line)",
        // Sentiment
        bullish: "var(--bullish)",
        "bullish-soft": "var(--bullish-soft)",
        "bullish-line": "var(--bullish-line)",
        "bullish-bg": "var(--bullish-bg)",
        bearish: "var(--bearish)",
        "bearish-soft": "var(--bearish-soft)",
        "bearish-line": "var(--bearish-line)",
        "bearish-bg": "var(--bearish-bg)",
        mixed: "var(--mixed)",
        "mixed-soft": "var(--mixed-soft)",
        "mixed-line": "var(--mixed-line)",
        "mixed-bg": "var(--mixed-bg)",
        // News categories
        "cat-ekonomi": "var(--cat-ekonomi)",
        "cat-ekonomi-soft": "var(--cat-ekonomi-soft)",
        "cat-ekonomi-line": "var(--cat-ekonomi-line)",
        "cat-pemerintah": "var(--cat-pemerintah)",
        "cat-pemerintah-soft": "var(--cat-pemerintah-soft)",
        "cat-pemerintah-line": "var(--cat-pemerintah-line)",
        "cat-politik": "var(--cat-politik)",
        "cat-politik-soft": "var(--cat-politik-soft)",
        "cat-politik-line": "var(--cat-politik-line)",
        "cat-emiten": "var(--cat-emiten)",
        "cat-emiten-soft": "var(--cat-emiten-soft)",
        "cat-emiten-line": "var(--cat-emiten-line)",
        "cat-global": "var(--cat-global)",
        "cat-global-soft": "var(--cat-global-soft)",
        "cat-global-line": "var(--cat-global-line)",
        // Highlight categories (Rangkuman rebrand)
        "cat-saham": "var(--cat-saham)",
        "cat-saham-soft": "var(--cat-saham-soft)",
        "cat-saham-line": "var(--cat-saham-line)",
        "cat-bisnis": "var(--cat-bisnis)",
        "cat-bisnis-soft": "var(--cat-bisnis-soft)",
        "cat-bisnis-line": "var(--cat-bisnis-line)",
        "cat-ekonomi-2": "var(--cat-ekonomi-2)",
        "cat-ekonomi-2-soft": "var(--cat-ekonomi-2-soft)",
        "cat-ekonomi-2-line": "var(--cat-ekonomi-2-line)",
        "cat-kebijakan": "var(--cat-kebijakan)",
        "cat-kebijakan-soft": "var(--cat-kebijakan-soft)",
        "cat-kebijakan-line": "var(--cat-kebijakan-line)",
        "cat-komoditas": "var(--cat-komoditas)",
        "cat-komoditas-soft": "var(--cat-komoditas-soft)",
        "cat-komoditas-line": "var(--cat-komoditas-line)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular"],
        serif: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter: "-0.025em",
        wider: "0.05em",
        widest: "0.10em",
      },
      boxShadow: {
        "card-hover": "var(--shadow-card-hover)",
        ticker: "0 1px 0 0 rgba(255, 255, 255, 0.04) inset",
      },
      keyframes: {
        "marquee-x": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-100%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
      animation: {
        marquee: "marquee-x 40s linear infinite",
        "fade-up": "fade-up 280ms cubic-bezier(0.2, 0.7, 0.2, 1) both",
        "pulse-dot": "pulse-dot 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
