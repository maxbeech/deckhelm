import type { Metadata } from "next";
import Link from "next/link";
import { Section, PageHeader } from "@/components/ui";
import { US_STATES } from "@/lib/frost";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Deck Code & Footing Depth by State",
  description: "Deck permit rules and required footing depth below the frost line for all 50 states, with a free IRC R507 deck framing calculator preset to each state.",
  alternates: { canonical: `${SITE.url}/states` },
};

export default function StatesIndex() {
  return (
    <Section tone="paper" className="py-12 sm:py-16">
      <PageHeader
        eyebrow="Frost depth · 50 states"
        title="Deck code &amp; footing depth by state"
        intro="The deck framing tables are national (IRC R507), but footing depth follows your local frost line. Pick your state for its typical footing depth and a calculator preset to it."
      />
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {US_STATES.map((s) => (
          <Link key={s.slug} href={`/states/${s.slug}`}
            className="group flex items-center justify-between border border-line bg-card px-4 py-3 text-sm transition hover:border-rust hover:shadow-[var(--shadow-plate)]">
            <span className="font-medium text-ink group-hover:text-rust">{s.name}</span>
            <span className="font-mono text-xs tabular-nums text-ink-soft">{s.frost}&Prime;</span>
          </Link>
        ))}
      </div>
    </Section>
  );
}
