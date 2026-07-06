import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Mono, Instrument_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { SITE } from "@/lib/site";

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

function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-paper/90 backdrop-blur">
      <div className="h-1 bg-rust" />
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-xl font-semibold tracking-tight text-ink">
            Deck<span className="text-rust">Helm</span>
          </span>
        </Link>
        <nav className="flex items-center gap-5 font-mono text-xs uppercase tracking-wide text-ink-soft">
          <Link href="/calculators" className="hover:text-ink">Calculators</Link>
          <Link href="/states" className="hidden hover:text-ink sm:inline">By state</Link>
          <Link href="/blog" className="hover:text-ink">Guides</Link>
          <Link href="/find-a-deck-builder" className="hidden hover:text-ink sm:inline">Find a builder</Link>
          <Link href="/pricing" className="border border-ink px-3 py-1.5 font-medium text-ink normal-case tracking-normal hover:bg-ink hover:text-paper">
            Pro
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-line bg-paper-dim">
      <div className="mx-auto max-w-5xl px-5 py-8 text-sm text-ink-soft">
        <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-wide">
          <Link href="/" className="hover:text-ink">Deck calculator</Link>
          <Link href="/calculators/deck-joist-span-calculator" className="hover:text-ink">Joist span</Link>
          <Link href="/calculators/deck-beam-span-calculator" className="hover:text-ink">Beam span</Link>
          <Link href="/calculators/deck-footing-calculator" className="hover:text-ink">Footings</Link>
          <Link href="/calculators/deck-stair-calculator" className="hover:text-ink">Stairs</Link>
          <Link href="/blog" className="hover:text-ink">Guides</Link>
          <Link href="/methodology" className="hover:text-ink">Methodology</Link>
          <Link href="/find-a-deck-builder" className="hover:text-ink">Find a builder</Link>
          <Link href="/pricing" className="hover:text-ink">Pro / permit plan</Link>
        </div>
        <p className="mt-4 max-w-2xl text-xs leading-relaxed text-ink-faint">
          {SITE.name} reads the IRC R507 and AWC DCA6 prescriptive deck span tables to size your framing.
          It is a planning aid, not an engineering stamp: local amendments vary, so confirm member sizes,
          footing depth and connections with your building department before you build.
        </p>
        <p className="mt-2 text-xs text-ink-faint">© {year} {SITE.name}</p>
      </div>
    </footer>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${instrumentSans.variable} ${plexMono.variable}`}>
      <body className="min-h-screen text-ink antialiased">
        <Header />
        <main className="mx-auto max-w-5xl px-5 py-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
