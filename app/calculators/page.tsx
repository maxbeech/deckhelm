import type { Metadata } from "next";
import Link from "next/link";
import { Section, PageHeader } from "@/components/ui";
import { IconArrow } from "@/components/icons";
import { CALCS } from "@/lib/calculators";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Deck Calculators",
  description: "Free deck calculators: joist span, beam span, footings, stairs and cost, all built to the IRC R507 deck code.",
  alternates: { canonical: `${SITE.url}/calculators` },
};

export default function CalculatorsIndex() {
  return (
    <Section tone="paper" className="py-12 sm:py-16">
      <PageHeader
        eyebrow="7 free tools · one engine"
        title="Deck calculators"
        intro="Each tool reads the real IRC R507 deck span tables. Start with whichever part of the deck you're sizing — they all run on the same code-compliant engine."
      />
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {CALCS.map((c, i) => (
          <Link key={c.slug} href={`/calculators/${c.slug}`}
            className="group flex flex-col border border-line bg-card p-6 transition hover:-translate-y-0.5 hover:border-rust hover:shadow-[var(--shadow-plate)]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-ink-faint">{String(i + 1).padStart(2, "0")}</span>
              <span className="font-mono text-xs text-ink-faint">{c.volume} searches</span>
            </div>
            <div className="mt-3 font-display text-xl font-semibold text-ink group-hover:text-rust">{c.h1}</div>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{c.meta}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-rust">
              Open <IconArrow className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </Section>
  );
}
