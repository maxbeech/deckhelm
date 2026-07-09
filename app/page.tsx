import type { Metadata } from "next";
import Link from "next/link";
import DeckCalculator from "@/components/DeckCalculator";
import { Section, Eyebrow, PhotoPlate, ButtonLink } from "@/components/ui";
import { IconTable, IconMap, IconDoc, IconBolt, IconArrow, IconCheck } from "@/components/icons";
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

const VALUE_PROPS = [
  { icon: IconTable, title: "The real code tables", body: "Not estimates. Every joist and beam size is read straight from IRC Tables R507.6 and R507.5 for No. 2 lumber — the same tables your plans examiner uses." },
  { icon: IconMap, title: "Your state’s frost depth", body: "Footing depth is set to the frost line where you build, from 12″ in the frost-free South to 60″ up north — all 50 states." },
  { icon: IconDoc, title: "Permit-ready output", body: "A scaled framing plan, footing schedule, ledger fastening and stair layout, each with its code citation for your submittal." },
  { icon: IconBolt, title: "Free, in seconds", body: "No account, no paywall on the math. Size an entire deck — joists to stairs — in under a minute, then print it." },
];

const STEPS = [
  { n: "01", title: "Enter your deck", body: "Width, projection, height, lumber species and your state. Two numbers and two dropdowns." },
  { n: "02", title: "We read the code", body: "The engine pulls joist and beam spans, footing size and depth, ledger spacing and stair layout from the IRC in real time." },
  { n: "03", title: "Build or submit", body: "Print the framing plan, shop the itemised material list, or hand the numbers to a local builder for a quote." },
];

const SOURCES = [
  ["IRC R507.6", "Deck joist spans"],
  ["IRC R507.5", "Deck beam spans"],
  ["IRC R507.3", "Footing size & bearing"],
  ["IRC R403.1.4", "Frost-depth footings"],
  ["IRC R311.7", "Stair risers & treads"],
  ["IRC R312", "Guards & baluster spacing"],
  ["IRC R507.9", "Ledger fastening"],
  ["AWC DCA6", "Prescriptive deck guide"],
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

      {/* HERO */}
      <Section tone="paper" className="pt-12 pb-14 sm:pt-16 sm:pb-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <Eyebrow>IRC R507 · AWC DCA6 · 50 states</Eyebrow>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Size your deck to code,<br className="hidden sm:block" /> in under a minute.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
              The free calculator that reads the <strong className="font-semibold text-ink">real IRC span tables</strong> to
              size your joists, beams, posts, footings and stairs — with your state&apos;s frost depth and a
              permit-ready framing plan. No guessing, no fees.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href="#calculator" variant="primary" className="text-base">
                Size my deck free <IconArrow className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/calculators" variant="secondary" className="text-base">
                Browse calculators
              </ButtonLink>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-px overflow-hidden rounded-sm border border-line bg-line plate">
              {[["7", "calculators"], ["50", "states covered"], ["$0", "to run the math"]].map(([n, l]) => (
                <div key={l} className="bg-card px-3 py-4 text-center">
                  <dt className="font-mono text-2xl font-semibold tabular-nums text-ink">{n}</dt>
                  <dd className="mt-0.5 text-xs text-ink-soft">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative">
            <PhotoPlate
              src="/photos/hero-deck.webp"
              alt="A finished cedar deck with a pergola behind a modern charcoal-clad house"
              className="aspect-[4/3] w-full"
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
            />
            <div className="absolute -bottom-4 -left-4 hidden bg-ink px-4 py-3 font-mono text-xs text-paper plate sm:block">
              <div className="text-rust-bright">2 × 2x10 beam</div>
              <div className="mt-0.5 text-paper/70">posts ≤ 8&apos; o.c. · R507.5</div>
            </div>
          </div>
        </div>
      </Section>

      {/* CALCULATOR */}
      <Section tone="dim" id="calculator" className="scroll-mt-20 py-14 sm:py-16">
        <div className="mb-8 max-w-2xl">
          <Eyebrow>The calculator</Eyebrow>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Enter your deck. Get a code-compliant plan.
          </h2>
          <p className="mt-3 text-ink-soft">
            Change any input and the framing plan, span checks, cost and materials update live. Everything below is
            free and needs no account.
          </p>
        </div>
        <DeckCalculator />
      </Section>

      {/* VALUE PROPS */}
      <Section tone="paper" className="py-16 sm:py-20">
        <div className="max-w-2xl">
          <Eyebrow>Why it&apos;s different</Eyebrow>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            A spec, not a guess
          </h2>
          <p className="mt-3 text-ink-soft">
            Most &ldquo;deck calculators&rdquo; hand you a rounded rule of thumb. DeckHelm returns the actual member
            sizes the building code prescribes, with the citation attached.
          </p>
        </div>
        <div className="mt-10 grid gap-px overflow-hidden rounded-sm border border-line bg-line plate sm:grid-cols-2 lg:grid-cols-4">
          {VALUE_PROPS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-card p-6">
              <div className="flex h-11 w-11 items-center justify-center border border-rust-line bg-rust-tint text-rust">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* HOW IT WORKS */}
      <Section tone="dim" className="py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <Eyebrow>How it works</Eyebrow>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              From backyard sketch to permit packet
            </h2>
            <ol className="mt-8 space-y-6">
              {STEPS.map((s) => (
                <li key={s.n} className="flex gap-4">
                  <span className="font-mono text-sm font-semibold text-rust">{s.n}</span>
                  <div>
                    <h3 className="font-semibold text-ink">{s.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <PhotoPlate
            src="/photos/framing-detail.webp"
            alt="A carpenter fastening deck joists with a framing nailer"
            className="aspect-[4/3] w-full lg:aspect-[5/4]"
            sizes="(min-width: 1024px) 50vw, 100vw"
            caption="Joists fastened to a ledger — sized here to IRC R507.6"
          />
        </div>
      </Section>

      {/* AUTHORITY / METHODOLOGY (dark band) */}
      <Section tone="ink" className="py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <Eyebrow onDark>Built on the actual code</Eyebrow>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-paper sm:text-4xl">
              Every number traces back to a table
            </h2>
            <p className="mt-4 max-w-xl leading-relaxed text-paper/75">
              DeckHelm doesn&apos;t invent spans. The engine transcribes the prescriptive tables that residential
              decks are built to, so the plan you print matches what your inspector checks line for line.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 font-mono text-sm sm:grid-cols-2">
              {SOURCES.map(([code, label]) => (
                <div key={code} className="flex items-baseline gap-3 border-t border-paper/15 pt-3">
                  <span className="shrink-0 font-semibold text-rust-bright">{code}</span>
                  <span className="text-paper/70">{label}</span>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <ButtonLink href="/methodology" variant="onDark">
                Read the full methodology <IconArrow className="h-4 w-4" />
              </ButtonLink>
            </div>
          </div>
          <PhotoPlate
            src="/photos/framing-timber.webp"
            alt="Timber deck framing under construction in warm evening light"
            className="aspect-[4/3] w-full"
            sizes="(min-width: 1024px) 42vw, 100vw"
          />
        </div>
      </Section>

      {/* CALCULATORS GRID */}
      <Section tone="paper" className="py-16 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <Eyebrow>Every part of the deck</Eyebrow>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Pick the calculator you need
            </h2>
          </div>
          <Link href="/calculators" className="font-mono text-xs uppercase tracking-wide text-rust hover:text-rust-dark">
            All calculators →
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CALCS.map((c, i) => (
            <Link key={c.slug} href={`/calculators/${c.slug}`}
              className="group flex flex-col border border-line bg-card p-5 transition hover:-translate-y-0.5 hover:border-rust hover:shadow-[var(--shadow-plate)]">
              <div className="font-mono text-xs text-ink-faint">{String(i + 1).padStart(2, "0")}</div>
              <div className="mt-1 font-display text-lg font-semibold text-ink group-hover:text-rust">{c.name} calculator</div>
              <div className="mt-1 text-sm text-ink-soft">{c.keyword} · {c.volume} searches</div>
            </Link>
          ))}
          <Link href="/states"
            className="group flex flex-col border border-line bg-ink p-5 text-paper transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-plate-lg)]">
            <div className="font-mono text-xs text-paper/50">{String(CALCS.length + 1).padStart(2, "0")}</div>
            <div className="mt-1 font-display text-lg font-semibold text-paper group-hover:text-rust-bright">Deck code by state</div>
            <div className="mt-1 text-sm text-paper/60">frost depth + permit rules · 50 states</div>
          </Link>
        </div>
      </Section>

      {/* WHY BUILD TO CODE + FAQ */}
      <Section tone="dim" className="py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow>Why it matters</Eyebrow>
            <h2 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">Why build to the deck code?</h2>
            <div className="mt-4 space-y-4 leading-relaxed text-ink-soft">
              <p>
                Deck collapses are almost always a framing or connection failure: an undersized beam, joists spanning
                too far, a ledger lag-bolted into nothing, or footings that heaved out of the ground over one winter.
                That&apos;s why the building code (the <strong className="text-ink">IRC, Section R507</strong>) sets
                prescriptive span tables for exactly this: residential wood decks built without an engineer.
              </p>
              <p>
                The trouble is the tables are dense. Joist spans change with size, spacing <em>and</em> species; beam
                spans depend on the joist span they carry; footing depth tracks the frost line where you live. This
                calculator reads those tables for you and returns a complete framing plan, each figure with its code
                reference so your drawings match what the inspector checks.
              </p>
            </div>
          </div>
          <div>
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">Common questions</h2>
            <dl className="mt-4 divide-y divide-line border-t border-line">
              {faq.map((f) => (
                <div key={f.q} className="py-4">
                  <dt className="font-medium text-ink">{f.q}</dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-ink-soft">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Section>

      {/* GUIDES */}
      <Section tone="paper" className="py-16 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <Eyebrow>Deck building guides</Eyebrow>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Code-grounded, plain-English answers
            </h2>
          </div>
          <Link href="/blog" className="font-mono text-xs uppercase tracking-wide text-rust hover:text-rust-dark">
            All guides →
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {POSTS.slice(0, 6).map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`}
              className="group flex flex-col border border-line bg-card p-5 transition hover:-translate-y-0.5 hover:border-rust hover:shadow-[var(--shadow-plate)]">
              <div className="font-mono text-xs text-ink-faint">{p.readMins} min read</div>
              <div className="mt-1 font-display text-lg font-semibold leading-snug text-ink group-hover:text-rust">{p.title}</div>
              <div className="mt-1.5 text-sm leading-relaxed text-ink-soft">{p.description}</div>
            </Link>
          ))}
        </div>
      </Section>

      {/* FINAL CTA (photo band) */}
      <Section tone="ink" className="relative overflow-hidden py-20 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-paper sm:text-4xl">
              Your deck, sized and specced — free.
            </h2>
            <p className="mt-4 max-w-xl leading-relaxed text-paper/75">
              Run the numbers now, or turn them into a permit-ready PDF with DeckHelm Pro. Prefer to hire it out?
              We&apos;ll pass your project to deck builders in your area.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="#calculator" variant="onDark" className="text-base">Open the calculator</ButtonLink>
              <ButtonLink href="/pricing" variant="secondaryOnDark" className="text-base">See Pro plans</ButtonLink>
              <ButtonLink href="/find-a-deck-builder" variant="secondaryOnDark" className="text-base">Find a builder</ButtonLink>
            </div>
          </div>
          <ul className="space-y-3 font-mono text-sm">
            {["Joist & beam sizing to IRC R507", "Footing depth for all 50 states", "Stair & guard layout to R311/R312", "Itemised material list & cost range"].map((t) => (
              <li key={t} className="flex items-center gap-3 border-t border-paper/15 pt-3 text-paper/80">
                <IconCheck className="h-4 w-4 shrink-0 text-rust-bright" />{t}
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </>
  );
}
