import type { Metadata } from "next";
import Link from "next/link";
import CheckoutButton from "@/components/CheckoutButton";
import CheckoutOutcomeTracker from "@/components/CheckoutOutcomeTracker";
import ObfuscatedEmail from "@/components/ObfuscatedEmail";
import { Section, PageHeader, Eyebrow } from "@/components/ui";
import { IconCheck } from "@/components/icons";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing: Permit-Ready Deck Plans",
  description: "The DeckHelm calculator is free forever. Upgrade to a permit-ready deck plan PDF with a code-referenced framing plan, footing schedule and material list.",
  alternates: { canonical: `${SITE.url}/pricing` },
};

const freeFeatures = [
  "Joist, beam, post & footing sizing (IRC R507)",
  "Stair layout & guard height to code",
  "Frost-depth footings for all 50 states",
  "Material list & build-cost estimate",
  "Print the on-screen result",
  "Unlimited calculations, no account",
];

const proFeatures = [
  "Everything in Free, plus:",
  "Plan Studio: a printable permit submittal packet",
  "Title block for your project, address & permit #",
  "Plan view + section/elevation drawing",
  "Framing, footing and stair schedules",
  "Code-citation appendix (IRC R507/R311/R312)",
  "Lifetime access — re-generate any time, free revisions",
];

const CHECKOUT_MSG: Record<string, string> = {
  cancelled: "Checkout was cancelled — no charge was made. You can pick up where you left off any time.",
  error: "We couldn’t confirm that payment. If you were charged, email hello@deckhelm.com and we’ll sort it immediately.",
};

export default async function Pricing({ searchParams }: { searchParams: Promise<{ checkout?: string }> }) {
  const { checkout } = await searchParams;
  const banner = checkout ? CHECKOUT_MSG[checkout] : null;

  return (
    <>
      <CheckoutOutcomeTracker outcome={checkout} />
      <Section tone="paper" className="pt-12 pb-10 sm:pt-16">
        <PageHeader
          eyebrow="Simple, honest pricing"
          title="The math is free. The permit packet is $29."
          intro="Size any deck for free, forever. When you’re ready to pull a permit, turn your numbers into a submittal document your inspector will recognise."
          className="mx-auto text-center"
        />
        {banner && (
          <div className="mx-auto mt-6 max-w-2xl border border-rust-line bg-rust-tint px-4 py-3 text-center text-sm text-ink" role="status">
            {banner}
          </div>
        )}
      </Section>

      <Section tone="dim" className="pb-16">
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
          {/* FREE */}
          <div className="flex flex-col border border-line bg-card p-7 plate">
            <div className="font-mono text-xs font-semibold uppercase tracking-wide text-ink-soft">Free</div>
            <div className="mt-1 font-display text-4xl font-semibold text-ink">$0</div>
            <p className="mt-1 text-sm text-ink-soft">The full deck code calculator</p>
            <ul className="mt-5 flex-1 space-y-2.5 text-sm text-ink-soft">
              {freeFeatures.map((f) => (
                <li key={f} className="flex gap-2.5"><IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal" />{f}</li>
              ))}
            </ul>
            <Link href="/#calculator" className="mt-6 block border border-line-strong px-4 py-2.5 text-center text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-paper">
              Use the calculator
            </Link>
          </div>

          {/* PRO */}
          <div className="relative flex flex-col border-2 border-rust bg-card p-7 plate-lg">
            <div className="absolute -top-3 right-6 bg-rust px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-white">Permit-ready</div>
            <div className="font-mono text-xs font-semibold uppercase tracking-wide text-rust">Pro plan</div>
            <div className="mt-1 font-display text-4xl font-semibold text-ink">$29<span className="text-base font-medium text-ink-soft"> one-time</span></div>
            <p className="mt-1 text-sm text-ink-soft">Permit-ready deck plan packet</p>
            <ul className="mt-5 flex-1 space-y-2.5 text-sm text-ink-soft">
              {proFeatures.map((f, i) => (
                <li key={f} className={`flex gap-2.5 ${i === 0 ? "font-medium text-ink" : ""}`}>
                  {i > 0 && <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-rust" />}{f}
                </li>
              ))}
            </ul>
            <div className="mt-6"><CheckoutButton /></div>
            <p className="mt-2 text-center text-xs text-ink-faint">Secure checkout via Stripe · lifetime access</p>
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-relaxed text-ink-faint">
          A DeckHelm plan is a planning aid, not an engineering stamp. It packages the prescriptive IRC values into a
          clean submittal; spans beyond the code tables still need a licensed engineer.
        </p>
      </Section>

      <Section tone="paper" className="py-14">
        <div className="mx-auto max-w-3xl border border-rust-line bg-rust-tint p-7 text-center">
          <Eyebrow>Rather not build it yourself?</Eyebrow>
          <h2 className="mt-2 font-display text-xl font-semibold text-ink">Get free quotes from local deck builders</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-ink-soft">
            Skip the Pro plan and{" "}
            <Link href="/find-a-deck-builder" className="font-medium text-rust underline">tell us about your project</Link>
            {" "}— we’ll pass it to a contractor in your area. No obligation.
          </p>
        </div>

        <div className="mx-auto mt-6 max-w-3xl border border-line bg-paper-dim p-7 text-center">
          <h2 className="font-display text-lg font-semibold text-ink">Building pros &amp; deck companies</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-ink-soft">
            Run a deck-building business? We send qualified homeowner leads from this calculator to contractors. Email{" "}
            <ObfuscatedEmail className="font-medium text-ink underline" /> to join the network.
          </p>
        </div>
      </Section>
    </>
  );
}
