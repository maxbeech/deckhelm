import type { Metadata } from "next";
import Link from "next/link";
import { CALCS } from "@/lib/calculators";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Deck Calculators",
  description: "Free deck calculators: joist span, beam span, footings, stairs and cost, all built to the IRC R507 deck code.",
  alternates: { canonical: `${SITE.url}/calculators` },
};

export default function CalculatorsIndex() {
  return (
    <>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Deck calculators</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Each tool reads the real IRC R507 deck span tables. Start with whichever part of the deck you're
        sizing. They all run on the same code-compliant engine.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {CALCS.map((c) => (
          <Link key={c.slug} href={`/calculators/${c.slug}`}
            className="border border-line bg-card p-5 transition hover:border-rust-line">
            <div className="font-semibold text-ink">{c.h1}</div>
            <div className="mt-1 text-sm text-ink-soft">{c.keyword} · {c.volume} searches</div>
            <p className="mt-2 text-sm text-ink-soft">{c.meta}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
