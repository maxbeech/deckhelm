import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import LeadForm from "@/components/LeadForm";
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
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Find a Deck Builder" }]} />
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Find a deck builder</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Worked out your numbers and decided you'd rather not build it yourself? Tell us about your project and
        we'll pass your details on to deck contractors who serve your area. We're building this network out:
        early requests go straight to our team, who'll connect you with a contractor directly.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <LeadForm />
        <div className="space-y-4">
          <div className="border border-line bg-card p-5 text-sm text-ink-soft">
            <h2 className="font-display text-base font-semibold text-ink">How it works</h2>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5">
              <li>Tell us your project type, ZIP code and rough budget.</li>
              <li>We pass your details to a deck contractor serving your area.</li>
              <li>They contact you directly to scope the job and quote it: no obligation to hire.</li>
            </ol>
          </div>
          <div className="border border-line bg-card p-5 text-sm text-ink-soft">
            <h2 className="font-display text-base font-semibold text-ink">Run a deck-building business?</h2>
            <p className="mt-2">
              We send qualified homeowner leads from this calculator to contractors. Email{" "}
              <span className="font-medium text-ink">hello@deckhelm.com</span> to join the network.
            </p>
          </div>
        </div>
      </div>

      <section className="mt-10 space-y-6 border border-line bg-card p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Hiring a deck builder: what to know</h2>
        {faq.map((f) => (
          <div key={f.q}>
            <h3 className="font-semibold text-ink">{f.q}</h3>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">{f.a}</p>
          </div>
        ))}
      </section>
    </>
  );
}
