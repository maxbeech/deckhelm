import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Mono, Instrument_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { SITE } from "@/lib/site";
import MobileNav from "@/components/MobileNav";
import { FeedbackButton } from "@/components/FeedbackButton";
import { OpenHelmAnalytics } from "../lib/openhelm-analytics";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
const instrumentSans = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument", display: "swap" });
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name}: ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  openGraph: { title: SITE.name, description: SITE.description, url: SITE.url, siteName: SITE.name, type: "website" },
  twitter: { card: "summary_large_image", title: SITE.name, description: SITE.description },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#b5410c",
};

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label={`${SITE.name} home`}>
      {/* Mark: a stylised joist-and-beam corner — the framing this tool sizes. */}
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true" className="shrink-0">
        <rect x="1.25" y="1.25" width="23.5" height="23.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" className="text-ink" />
        <path d="M5 21V8M5 8l4-4M9 21V4M13 21V8l4-4M17 21V4M21 21V8" stroke="#b5410c" strokeWidth="1.5" strokeLinecap="square" />
      </svg>
      <span className="font-display text-xl font-semibold tracking-tight text-ink">
        Deck<span className="text-rust">Helm</span>
      </span>
    </Link>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="h-1 bg-rust" />
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-6 font-mono text-xs uppercase tracking-wide text-ink-soft md:flex">
          <Link href="/calculators" className="transition-colors hover:text-ink">Calculators</Link>
          <Link href="/states" className="transition-colors hover:text-ink">By state</Link>
          <Link href="/blog" className="transition-colors hover:text-ink">Guides</Link>
          <Link href="/find-a-deck-builder" className="transition-colors hover:text-ink">Find a builder</Link>
          <Link href="/pricing" className="transition-colors hover:text-ink">Pricing</Link>
          <FeedbackButton />
          <Link href="/#calculator" className="border border-ink bg-ink px-3.5 py-1.5 font-medium normal-case tracking-normal text-paper transition-colors hover:bg-rust hover:border-rust">
            Open calculator
          </Link>
        </nav>
        <div className="flex items-center gap-3 md:hidden">
          <Link href="/#calculator" className="border border-ink bg-ink px-3.5 py-1.5 font-mono text-xs font-medium uppercase tracking-wide text-paper transition-colors hover:bg-rust hover:border-rust">
            Calculator
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}

const FOOTER_COLS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Calculators",
    links: [
      { label: "Deck calculator", href: "/" },
      { label: "Joist span", href: "/calculators/deck-joist-span-calculator" },
      { label: "Beam span", href: "/calculators/deck-beam-span-calculator" },
      { label: "Footings", href: "/calculators/deck-footing-calculator" },
      { label: "Stairs", href: "/calculators/deck-stair-calculator" },
      { label: "Cost", href: "/calculators/deck-cost-calculator" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "Deck building guides", href: "/blog" },
      { label: "Deck code by state", href: "/states" },
      { label: "Methodology & sources", href: "/methodology" },
    ],
  },
  {
    title: "Get it built",
    links: [
      { label: "Find a deck builder", href: "/find-a-deck-builder" },
      { label: "Permit-ready plan (Pro)", href: "/pricing" },
    ],
  },
];

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t border-line bg-paper-dim">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:pr-6">
            <span className="font-display text-lg font-semibold tracking-tight text-ink">
              Deck<span className="text-rust">Helm</span>
            </span>
            <p className="mt-2 text-xs leading-relaxed text-ink-soft">
              The free deck code calculator. Real IRC R507 span tables, your state&apos;s frost depth,
              and a permit-ready framing plan.
            </p>
          </div>
          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-ink-faint">{col.title}</div>
              <ul className="mt-3 space-y-2 text-sm">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="text-ink-soft transition-colors hover:text-rust">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-line pt-6">
          <p className="max-w-3xl text-xs leading-relaxed text-ink-faint">
            {SITE.name} reads the IRC R507 and AWC DCA6 prescriptive deck span tables to size your framing.
            It is a planning aid, not an engineering stamp: local amendments vary, so confirm member sizes,
            footing depth and connections with your building department before you build.
          </p>
          <p className="mt-3 font-mono text-xs text-ink-faint">
            © {year} {SITE.name} · {SITE.domain} · <FeedbackButton variant="footer" />
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${instrumentSans.variable} ${plexMono.variable}`}>
      <body className="min-h-screen text-ink antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
        <OpenHelmAnalytics />
      </body>
    </html>
  );
}
