import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import PlanStudio from "@/components/PlanStudio";
import { Section, PageHeader, ButtonLink } from "@/components/ui";
import { IconArrow } from "@/components/icons";
import { DEFAULT_DECK, type DeckInputs } from "@/lib/deck";
import { buyerRefFromToken } from "@/lib/analytics-ref";
import { PRO_COOKIE, DECK_COOKIE, isValidProToken, metadataToDeck } from "@/lib/pro";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Permit-Ready Deck Plan (Pro)",
  description: "Generate your permit-ready deck plan: title block, framing and footing schedules, elevation and code citations.",
  robots: { index: false, follow: false },
};

function LockedGate() {
  return (
    <Section tone="paper" className="py-16 sm:py-24">
      <div className="mx-auto max-w-xl border border-line bg-card p-8 text-center plate-lg">
        <div className="mx-auto flex h-12 w-12 items-center justify-center border border-rust-line bg-rust-tint text-rust">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <rect x="4" y="10" width="16" height="10" rx="1.5" /><path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
        </div>
        <h1 className="mt-5 font-display text-2xl font-semibold text-ink">Your Plan Studio is one step away</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          DeckHelm Pro unlocks the permit-ready Plan Studio: a printable submittal packet with a title block,
          framing &amp; footing schedules, an elevation drawing and a code-citation appendix for your exact deck.
          One-time $29, lifetime access.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3">
          <ButtonLink href="/pricing" variant="primary">Get DeckHelm Pro <IconArrow className="h-4 w-4" /></ButtonLink>
          <Link href="/" className="text-sm text-ink-soft hover:text-rust">Keep using the free calculator →</Link>
        </div>
        <p className="mt-6 border-t border-line pt-4 text-xs text-ink-faint">
          Already purchased? Open the link from your payment confirmation on this device, or email hello@deckhelm.com.
        </p>
      </div>
    </Section>
  );
}

export default async function PlanPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const { preview } = await searchParams;
  const jar = await cookies();
  const hasPro = isValidProToken(jar.get(PRO_COOKIE)?.value);
  // Dev-only bypass so the Plan Studio UX can be exercised without a live charge.
  const devPreview = process.env.NODE_ENV !== "production" && preview === "1";

  if (!hasPro && !devPreview) return <LockedGate />;

  const userRef = await buyerRefFromToken(jar.get(PRO_COOKIE)?.value);

  let initial: DeckInputs = { ...DEFAULT_DECK };
  const deckCookie = jar.get(DECK_COOKIE)?.value;
  if (deckCookie) {
    try {
      const parsed = metadataToDeck(JSON.parse(deckCookie));
      initial = { ...DEFAULT_DECK, ...parsed };
    } catch {
      /* fall back to defaults */
    }
  }

  return (
    <>
      <Section tone="dim" className="py-8 print:hidden">
        <PageHeader
          eyebrow="DeckHelm Pro · Plan Studio"
          title="Your permit-ready deck plan"
          intro="Fill in the project details, confirm your deck, then print or save the packet as a PDF for your building department. Everything recalculates live."
        />
      </Section>
      <PlanStudio initialDeck={initial} userRef={userRef} />
    </>
  );
}
