import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const revalidate = 604800; // 1 week

export const metadata: Metadata = {
  title: "Methodology & Code Sources",
  description: "How DeckHelm sizes deck framing: the exact IRC R507 / DCA6 code tables, load assumptions, and limits behind every result.",
  alternates: { canonical: `${SITE.url}/methodology` },
};

const sources = [
  ["IRC Table R507.6", "Deck joist maximum spans by size, spacing and species"],
  ["IRC Table R507.5", "Deck beam maximum spans by supported joist span and species"],
  ["IRC R507.3 / R507.3.1", "Footing size from tributary load over presumptive soil bearing"],
  ["IRC Table R507.9.1.3", "Ledger fastener (lag screw / through-bolt) spacing"],
  ["IRC R507.4", "Deck post sizing and connections"],
  ["IRC R311.7", "Stair riser, tread, run and landing requirements"],
  ["IRC R312", "Guard height where the walking surface is over 30\" above grade"],
  ["IRC R403.1.4", "Footing depth below the frost line"],
  ["IRC Table R401.4.1", "Presumptive load-bearing values of soils"],
  ["AWC DCA6", "Prescriptive Residential Wood Deck Construction Guide"],
];

export default function Methodology() {
  return (
    <article className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Methodology & code sources</h1>
      <p className="mt-3 leading-relaxed text-ink">
        Every number on {SITE.name} comes from the published building code, not an estimate or a model we
        invented. The free calculator is a faithful, transparent reader of the IRC R507 prescriptive deck
        provisions, so a result here is exactly what a plans examiner checks against.
      </p>

      <h2 className="mt-8 font-display text-xl font-semibold text-ink">The tables we use</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        Joist and beam spans are transcribed verbatim from the IRC span tables for No.&nbsp;2 grade lumber at
        the standard residential deck load of <strong>40 psf live + 10 psf dead</strong>, with the wet-service
        factor applied and deflection limited to L/360. Footings are computed from each post's tributary
        load divided by your soil's presumptive bearing value; depth follows the local frost line.
      </p>
      <ul className="mt-4 divide-y divide-paper-dim">
        {sources.map(([code, what]) => (
          <li key={code} className="flex flex-col py-2 sm:flex-row sm:justify-between">
            <span className="font-medium text-ink">{code}</span>
            <span className="text-sm text-ink-soft sm:text-right">{what}</span>
          </li>
        ))}
      </ul>

      <h2 className="mt-8 font-display text-xl font-semibold text-ink">What this tool does not do</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-soft">
        <li>Engineered designs: spans beyond the prescriptive tables (joists over ~18 ft, heavy snow load, unusual geometry) need a licensed engineer.</li>
        <li>Local amendments: many jurisdictions modify footing depth, guard height (some require 42") or fastener rules. Always confirm locally.</li>
        <li>Cantilevers, multi-level decks, and free-standing layouts beyond the standard ledger-to-beam single span.</li>
        <li>Cost figures are planning ranges from typical 2026 US prices, not quotes.</li>
      </ul>

      <div className="mt-10 border border-rust-line bg-rust-tint p-6">
        <p className="text-sm text-ink-soft">
          Ready to size your deck? The calculator returns joist, beam, footing, ledger and stair details in
          seconds, each with its code reference.
        </p>
        <Link href="/" className="mt-3 inline-block rounded-sm bg-rust px-4 py-2 text-sm font-medium text-white hover:bg-rust-dark">
          Open the deck calculator →
        </Link>
      </div>
    </article>
  );
}
