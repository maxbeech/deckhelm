import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import LeadForm from "@/components/LeadForm";
import ObfuscatedEmail from "@/components/ObfuscatedEmail";
import { Section, PhotoPlate, Eyebrow } from "@/components/ui";
import { SITE } from "@/lib/site";

export const revalidate = 604800; // 1 week: static reference content

export const metadata: Metadata = {
  title: "Find a Deck Builder: Get Free Quotes",
  description: "Tell us about your deck project and we'll pass your details to a deck contractor who can quote it. Free, no obligation.",
  alternates: { canonical: `${SITE.url}/find-a-deck-builder` },
};

const faq = [
  {
    q: "How much does it cost to hire a deck builder?",
    a: "Contractor-installed decks typically run from the high end of the DIY material cost up to roughly double it once labour is included: our cost calculator shows both ends of that range for your exact deck size. Get a firm number by requesting quotes below; pricing varies a lot by region, material and site access.",
  },
  {
    q: "Should I get more than one quote?",
    a: "Yes, deck pricing varies significantly between contractors for the same job. Submitting one request below lets multiple local builders see your project, so you can compare quotes rather than accepting the first number you're given.",
  },
  {
    q: "Do I still need a permit if I hire a contractor?",
    a: "Usually yes, though an established contractor will typically pull the permit for you as part of the job. Either way, our state pages show the footing depth and permit basics for your area.",
  },
];

export default function FindABuilder() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        serviceType: "Deck construction lead matching",
        provider: { "@type": "Organization", name: SITE.name, url: SITE.url },
        areaServed: "US",
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

      <Section tone="paper" className="pt-8 pb-12 sm:pt-10 sm:pb-14">
        <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Find a Deck Builder" }]} />
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <Eyebrow>Free · no obligation</Eyebrow>
            <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
              Find a deck builder near you
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">
              Worked out your numbers and decided you&apos;d rather not build it yourself? Tell us about your
              project and we&apos;ll pass your details to deck contractors who serve your area. We&apos;re building
              this network out — early requests go straight to our team, who&apos;ll connect you with a contractor
              directly.
            </p>
          </div>
          <PhotoPlate
            src="/photos/deck-lakeside.webp"
            alt="A spacious lakeside timber deck with lounge furniture in afternoon sun"
            className="aspect-[4/3] w-full"
            sizes="(min-width: 1024px) 42vw, 100vw"
            priority
          />
        </div>
      </Section>

      <Section tone="dim" className="py-12 sm:py-16">
        <div className="grid gap-6 md:grid-cols-[1.3fr_1fr]">
          <LeadForm />
          <div className="space-y-4">
            <div className="border border-line bg-card p-6 text-sm text-ink-soft plate">
              <h2 className="font-display text-base font-semibold text-ink">How it works</h2>
              <ol className="mt-3 space-y-3">
                {[
                  "Tell us your project type, ZIP code and rough budget.",
                  "We pass your details to a deck contractor serving your area.",
                  "They contact you directly to scope the job and quote it — no obligation to hire.",
                ].map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="font-mono text-xs font-semibold text-rust">{String(i + 1).padStart(2, "0")}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="border border-rust-line bg-rust-tint p-6 text-sm text-ink-soft">
              <h2 className="font-display text-base font-semibold text-ink">Run a deck-building business?</h2>
              <p className="mt-2">
                We send qualified homeowner leads from this calculator to contractors. Email{" "}
                <ObfuscatedEmail className="font-medium text-ink underline" /> to join the network.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="paper" className="py-14 sm:py-16">
        <Eyebrow>Hiring a deck builder</Eyebrow>
        <h2 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">What to know before you hire</h2>
        <dl className="mt-6 max-w-3xl divide-y divide-line border-t border-line">
          {faq.map((f) => (
            <div key={f.q} className="py-4">
              <dt className="font-medium text-ink">{f.q}</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-ink-soft">{f.a}</dd>
            </div>
          ))}
        </dl>
      </Section>
    </>
  );
}
