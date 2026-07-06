import type { Metadata } from "next";
import Link from "next/link";
import DeckCalculator from "@/components/DeckCalculator";
import { CALCS } from "@/lib/calculators";
import { POSTS } from "@/lib/posts";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Free Deck Calculator: Joists, Beams, Footings & Stairs to Code",
  description: SITE.description,
  alternates: { canonical: SITE.url },
};

const faq = [
  {
    q: "How do I size deck joists, beams and footings?",
    a: "Pick the joist span from IRC Table R507.6 (by joist size, spacing and lumber species), the beam from Table R507.5 (by the joist span it carries), and the footing from the post's tributary load divided by your soil's bearing value. The calculator above does all three at once and shows the code reference for each.",
  },
  {
    q: "How far can a 2x8 deck joist span?",
    a: "A No. 2 Southern Pine 2x8 spans up to 13'1\" at 12\" on-center, 11'10\" at 16\", and 9'8\" at 24\", per IRC R507.6. Douglas Fir-Larch and Hem-Fir span a little less, and cedar/redwood less again. The tool picks the smallest joist that clears your projection automatically.",
  },
  {
    q: "How deep do deck footings need to be?",
    a: "Footings must bear below the local frost line so they can't heave. That ranges from about 12\" in frost-free states to 60\" in the upper Midwest and New England. Choose your state in the calculator and it sets the depth; always confirm the exact figure with your building department.",
  },
  {
    q: "Do I need a permit to build a deck?",
    a: "Almost everywhere, yes. Most jurisdictions require a permit for any deck attached to the house or more than ~30\" above grade, plus an inspection of the footings before they're poured. The calculator's framing plan is built to the IRC so your drawings line up with what the inspector checks.",
  },
];

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: SITE.name,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description: SITE.description,
        url: SITE.url,
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="mb-10 text-center">
        <p className="font-mono text-xs font-medium tracking-[0.2em] text-rust uppercase">IRC R507 · AWC DCA6</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Free deck building code calculator
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-ink-soft">
          Size your joists, beams, posts, footings and stairs to the <strong className="text-ink">IRC R507 deck code</strong> in seconds. Real span tables, your state's frost depth, and a permit-ready framing plan: no guessing, no fees.
        </p>
      </section>

      <DeckCalculator />

      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CALCS.map((c, i) => (
          <Link key={c.slug} href={`/calculators/${c.slug}`}
            className="group border border-line bg-card p-4 transition hover:border-rust">
            <div className="font-mono text-xs text-ink-faint">{String(i + 1).padStart(2, "0")}</div>
            <div className="mt-1 font-semibold text-ink group-hover:text-rust">{c.name} calculator</div>
            <div className="mt-1 text-sm text-ink-soft">{c.keyword} · {c.volume} searches</div>
          </Link>
        ))}
        <Link href="/states"
          className="group border border-line bg-card p-4 transition hover:border-rust">
          <div className="font-mono text-xs text-ink-faint">{String(CALCS.length + 1).padStart(2, "0")}</div>
          <div className="mt-1 font-semibold text-ink group-hover:text-rust">Deck code by state</div>
          <div className="mt-1 text-sm text-ink-soft">frost depth + permit rules · 50 states</div>
        </Link>
      </section>

      <section className="mt-12 border border-line bg-card p-6">
        <h2 className="font-display text-xl font-semibold text-ink">Why build to the deck code?</h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-soft">
          <p>
            Deck collapses are almost always a framing or connection failure: an undersized beam, joists spanning
            too far, a ledger lag-bolted into nothing, or footings that heaved out of the ground over one winter.
            That's why the building code (the <strong className="text-ink">IRC, Section R507</strong>) sets
            prescriptive span tables for exactly this: residential wood decks built without an engineer.
          </p>
          <p>
            The trouble is the tables are dense. Joist spans change with size, spacing <em>and</em> species; beam
            spans depend on the joist span they carry; footing depth tracks the frost line where you live. This
            calculator reads those tables for you and returns a complete framing plan: joist and beam sizes, post
            spacing, footing diameter and depth, stair layout and guard height, each with its code reference so
            your drawings match what the inspector checks.
          </p>
        </div>
      </section>

      <section className="mt-8 border border-line bg-card p-6">
        <h2 className="font-display text-xl font-semibold text-ink">Frequently asked questions</h2>
        <dl className="mt-3 divide-y divide-paper-dim">
          {faq.map((f) => (
            <div key={f.q} className="py-3">
              <dt className="font-medium text-ink">{f.q}</dt>
              <dd className="mt-1 text-sm text-ink-soft">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-display text-xl font-semibold text-ink">Deck building guides</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {POSTS.slice(0, 6).map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`}
              className="border border-line bg-card p-4 transition hover:border-rust">
              <div className="font-medium text-ink">{p.title}</div>
              <div className="mt-1 text-sm text-ink-soft">{p.description}</div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
