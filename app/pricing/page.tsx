import type { Metadata } from "next";
import Link from "next/link";
import CheckoutButton from "@/components/CheckoutButton";
import ObfuscatedEmail from "@/components/ObfuscatedEmail";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing: Permit-Ready Deck Plans",
  description: "The DeckHelm calculator is free forever. Upgrade to a permit-ready deck plan PDF with stamped framing, footing schedule and material list.",
  alternates: { canonical: `${SITE.url}/pricing` },
};

const freeFeatures = [
  "Joist, beam, post & footing sizing (IRC R507)",
  "Stair layout & guard height to code",
  "Frost-depth footings for all 50 states",
  "Material list & build-cost estimate",
  "Unlimited calculations, no account",
];

const proFeatures = [
  "Everything in Free, plus:",
  "Permit-ready PDF: framing plan, footing schedule, material list",
  "Joist & beam layout diagram for your exact deck",
  "Code citations (IRC R507/R311) for your submittal",
  "Lifetime access to the plan, revisions included",
];

export default function Pricing() {
  return (
    <>
      <div className="text-center">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Simple, honest pricing</h1>
        <p className="mx-auto mt-2 max-w-xl text-ink-soft">
          The calculator is free forever. When you're ready to pull a permit, turn your numbers into a plan
          the inspector will accept.
        </p>
      </div>

      <div className="mx-auto mt-8 grid max-w-3xl gap-6 sm:grid-cols-2">
        <div className="border border-line bg-card p-6">
          <div className="font-mono text-xs font-semibold uppercase tracking-wide text-ink-soft">Free</div>
          <div className="mt-1 font-display text-3xl font-semibold text-ink">$0</div>
          <p className="mt-1 text-sm text-ink-soft">The full deck code calculator</p>
          <ul className="mt-4 space-y-2 text-sm text-ink-soft">
            {freeFeatures.map((f) => (
              <li key={f} className="flex gap-2"><span className="text-teal">✓</span><span>{f}</span></li>
            ))}
          </ul>
          <Link href="/" className="mt-6 block border border-line-strong px-4 py-2 text-center text-sm font-medium text-ink hover:bg-paper">
            Use the calculator
          </Link>
        </div>

        <div className="border-2 border-rust-line bg-card p-6">
          <div className="font-mono text-xs font-semibold uppercase tracking-wide text-rust">Pro plan</div>
          <div className="mt-1 font-display text-3xl font-semibold text-ink">$29<span className="text-base font-medium text-ink-soft"> one-time</span></div>
          <p className="mt-1 text-sm text-ink-soft">Permit-ready deck plan PDF</p>
          <ul className="mt-4 space-y-2 text-sm text-ink-soft">
            {proFeatures.map((f) => (
              <li key={f} className="flex gap-2"><span className="text-rust">✓</span><span>{f}</span></li>
            ))}
          </ul>
          <div className="mt-6"><CheckoutButton /></div>
        </div>
      </div>

      <section className="mx-auto mt-10 max-w-3xl border border-rust-line bg-rust-tint p-6 text-center text-sm text-ink-soft">
        <h2 className="font-display text-base font-semibold text-ink">Would rather hire it out?</h2>
        <p className="mt-2">
          Skip the Pro plan and{" "}
          <Link href="/find-a-deck-builder" className="font-medium text-rust underline">get free quotes from local deck builders</Link>{" "}
          instead: tell us about your project and we'll pass it to a contractor in your area.
        </p>
      </section>

      <section className="mx-auto mt-6 max-w-3xl border border-line bg-paper-dim p-6 text-center text-sm text-ink-soft">
        <h2 className="font-display text-base font-semibold text-ink">Building pros & deck companies</h2>
        <p className="mt-2">
          Run a deck-building business? We send qualified homeowner leads from this calculator to
          contractors. Email <ObfuscatedEmail className="font-medium text-ink underline" /> to join the network.
        </p>
      </section>
    </>
  );
}
