import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Container, Eyebrow } from "@/components/ui";
import { getCalc } from "@/lib/calculators";
import { getPost, POSTS } from "@/lib/posts";
import { SITE } from "@/lib/site";

export const revalidate = 604800; // 1 week: static blog content

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getPost(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: `${SITE.url}/blog/${p.slug}` },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getPost(slug);
  if (!p) notFound();
  const rel = p.related ? getCalc(p.related) : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: p.title,
    description: p.description,
    datePublished: p.date,
    dateModified: p.date,
    author: { "@type": "Organization", name: SITE.name },
    publisher: { "@type": "Organization", name: SITE.name },
    mainEntityOfPage: `${SITE.url}/blog/${p.slug}`,
  };

  return (
    <Container size="3xl" className="py-10 sm:py-14">
      <article className="mx-auto max-w-2xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Guides", href: "/blog" }, { name: p.title }]} />
      <Eyebrow>{p.readMins} min read · Deck guide</Eyebrow>
      <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">{p.title}</h1>
      <p className="mt-3 text-lg leading-relaxed text-ink-soft">{p.description}</p>
      <div className="mt-8 space-y-5 text-[17px]">
        {p.body.map((b, i) => {
          if (b.type === "h2") return <h2 key={i} className="!mt-10 font-display text-2xl font-semibold text-ink">{b.text}</h2>;
          if (b.type === "ul") return (
            <ul key={i} className="list-disc space-y-2 pl-5 leading-relaxed text-ink">
              {b.items.map((it) => <li key={it}>{it}</li>)}
            </ul>
          );
          return <p key={i} className="leading-[1.75] text-ink">{b.text}</p>;
        })}
      </div>

      <div className="mt-12 border border-rust-line bg-rust-tint p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Size your deck to code, free</h2>
        <p className="mt-2 text-sm text-ink-soft">
          {rel ? `Put these numbers into the ${rel.name.toLowerCase()} calculator and get a code-compliant answer in seconds.` : "Get joist, beam, footing and stair sizes for your deck from the real IRC R507 tables, in seconds."}
        </p>
        <Link href={rel ? `/calculators/${rel.slug}` : "/"} className="mt-3 inline-block bg-rust px-4 py-2 text-sm font-medium text-white hover:bg-rust-dark">
          {rel ? `Open the ${rel.name} calculator →` : "Open the deck calculator →"}
        </Link>
      </div>
      </article>
    </Container>
  );
}
