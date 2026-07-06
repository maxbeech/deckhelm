import type { Metadata } from "next";
import Link from "next/link";
import { US_STATES } from "@/lib/frost";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Deck Code & Footing Depth by State",
  description: "Deck permit rules and required footing depth below the frost line for all 50 states, with a free IRC R507 deck framing calculator preset to each state.",
  alternates: { canonical: `${SITE.url}/states` },
};

export default function StatesIndex() {
  return (
    <>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Deck code and footing depth by state</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        The deck framing tables are national (IRC R507), but footing depth follows your local frost line.
        Pick your state for its typical footing depth and a calculator preset to it.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {US_STATES.map((s) => (
          <Link key={s.slug} href={`/states/${s.slug}`}
            className="flex items-center justify-between border border-line bg-card px-3 py-2 text-sm transition hover:border-rust">
            <span className="text-ink">{s.name}</span>
            <span className="font-mono text-xs text-ink-soft">{s.frost}"</span>
          </Link>
        ))}
      </div>
    </>
  );
}
