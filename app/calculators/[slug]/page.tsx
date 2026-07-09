import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import DeckCalculator from "@/components/DeckCalculator";
import RailingCalculator from "@/components/RailingCalculator";
import { BeamSpanTable, JoistSpanTable } from "@/components/SpanTable";
import { Container, Eyebrow } from "@/components/ui";
import { CALCS, getCalc } from "@/lib/calculators";
import { SITE } from "@/lib/site";

export const revalidate = 604800; // 1 week: static reference content

export function generateStaticParams() {
  return CALCS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = getCalc(slug);
  if (!c) return {};
  return {
    title: c.h1,
    description: c.meta,
    alternates: { canonical: `${SITE.url}/calculators/${c.slug}` },
  };
}

export default async function CalcPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getCalc(slug);
  if (!c) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `${c.name} Calculator: ${SITE.name}`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    url: `${SITE.url}/calculators/${c.slug}`,
  };

  return (
    <Container className="py-10 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Calculators", href: "/calculators" }, { name: c.name }]} />
      <Eyebrow>{c.keyword} · {c.volume} searches</Eyebrow>
      <h1 className="mt-2 max-w-3xl font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">{c.h1}</h1>
      <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-soft">{c.intro}</p>
      <div className="mt-8">{c.focus === "railing" ? <RailingCalculator /> : <DeckCalculator focus={c.focus} />}</div>

      {c.focus === "joist" && (
        <section className="mt-10 space-y-6 border border-line bg-card p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Full deck joist span table (IRC R507.6)</h2>
          <JoistSpanTable species="sp" />
          <JoistSpanTable species="dfhf" />
          <JoistSpanTable species="cedar" />
        </section>
      )}
      {c.focus === "beam" && (
        <section className="mt-10 space-y-6 border border-line bg-card p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Full deck beam span table (IRC R507.5)</h2>
          <BeamSpanTable species="sp" />
          <BeamSpanTable species="dfhf" />
        </section>
      )}

      <section className="mt-10 border border-line bg-card p-6">
        <h2 className="font-display text-lg font-semibold text-ink">{c.name}: what to know</h2>
        <ul className="mt-3 space-y-2 text-sm text-ink-soft">
          {c.notes.map((n) => (
            <li key={n} className="flex gap-2"><span className="text-rust">•</span><span>{n}</span></li>
          ))}
        </ul>
      </section>

      <section className="mt-6 border border-rust-line bg-rust-tint p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Want a permit-ready deck plan?</h2>
        <p className="mt-2 text-sm text-ink-soft">
          This estimate is built for planning. For your permit packet, DeckHelm Pro turns these numbers into a
          code-referenced framing plan, footing schedule and material list as a printable PDF.
        </p>
        <Link href="/pricing" className="mt-3 inline-block bg-ink px-4 py-2 text-sm font-medium text-white hover:opacity-90">
          See Pro →
        </Link>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-base font-semibold text-ink">Other calculators</h2>
        <div className="flex flex-wrap gap-2">
          {CALCS.filter((x) => x.slug !== c.slug).map((x) => (
            <Link key={x.slug} href={`/calculators/${x.slug}`}
              className="rounded-full border border-line bg-card px-3 py-1 text-sm text-ink-soft hover:border-rust-line">
              {x.name}
            </Link>
          ))}
        </div>
      </section>
    </Container>
  );
}
