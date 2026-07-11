import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Container, Eyebrow, PhotoPlate } from "@/components/ui";
import { getCalc } from "@/lib/calculators";
import { getPost, POSTS } from "@/lib/posts";
import { renderInline, slugifyHeading, stripLinks } from "@/lib/post-render";
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
    openGraph: {
      title: p.title,
      description: p.description,
      url: `${SITE.url}/blog/${p.slug}`,
      type: "article",
      publishedTime: p.date,
      images: [{ url: `${SITE.url}${p.image}`, alt: p.imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: p.title,
      description: p.description,
      images: [`${SITE.url}${p.image}`],
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getPost(slug);
  if (!p) notFound();
  const rel = p.related ? getCalc(p.related) : undefined;

  const headings = p.body.filter((b) => b.type === "h2") as { type: "h2"; text: string }[];
  const faqBlock = p.body.find((b) => b.type === "faq") as { type: "faq"; items: { q: string; a: string }[] } | undefined;
  const firstOl = p.body.find((b) => b.type === "ol") as { type: "ol"; items: string[] } | undefined;

  const jsonLdGraph: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: p.title,
      description: p.description,
      image: `${SITE.url}${p.image}`,
      datePublished: p.date,
      dateModified: p.date,
      author: { "@type": "Organization", name: SITE.name, url: SITE.url },
      publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
      mainEntityOfPage: `${SITE.url}/blog/${p.slug}`,
      articleSection: p.category,
      keywords: [p.keyword, ...(p.supportingKeywords ?? [])].join(", "),
    },
  ];
  if (faqBlock) {
    jsonLdGraph.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqBlock.items.map((it) => ({
        "@type": "Question",
        name: stripLinks(it.q),
        acceptedAnswer: { "@type": "Answer", text: stripLinks(it.a) },
      })),
    });
  }
  if (p.howTo && firstOl) {
    jsonLdGraph.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: p.title,
      description: p.description,
      step: firstOl.items.map((it, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        text: stripLinks(it),
      })),
    });
  }

  return (
    <Container size="3xl" className="py-10 sm:py-14">
      <article className="mx-auto max-w-2xl">
      {jsonLdGraph.map((ld, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      ))}
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Guides", href: "/blog" }, { name: p.title }]} />
      <Eyebrow>{p.readMins} min read · {p.category}</Eyebrow>
      <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">{p.title}</h1>
      <p className="mt-3 text-lg leading-relaxed text-ink-soft">{p.description}</p>

      <PhotoPlate
        src={p.image}
        alt={p.imageAlt}
        className="mt-6 aspect-[16/9] w-full"
        sizes="(min-width: 768px) 672px, 100vw"
        priority
      />

      {headings.length >= 3 && (
        <nav aria-label="Table of contents" className="mt-8 border border-line bg-card p-5">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-rust">In this guide</p>
          <ol className="mt-3 space-y-1.5">
            {headings.map((h) => (
              <li key={h.text}>
                <a href={`#${slugifyHeading(h.text)}`} className="text-sm text-ink-soft hover:text-rust">{h.text}</a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="mt-8 space-y-5 text-[17px]">
        {p.body.map((b, i) => {
          if (b.type === "h2") return (
            <h2 key={i} id={slugifyHeading(b.text)} className="!mt-10 scroll-mt-24 font-display text-2xl font-semibold text-ink">{b.text}</h2>
          );
          if (b.type === "h3") return (
            <h3 key={i} className="!mt-6 font-display text-lg font-semibold text-ink">{b.text}</h3>
          );
          if (b.type === "ul") return (
            <ul key={i} className="list-disc space-y-2 pl-5 leading-relaxed text-ink">
              {b.items.map((it, j) => <li key={j}>{renderInline(it, `ul${i}-${j}`)}</li>)}
            </ul>
          );
          if (b.type === "ol") return (
            <ol key={i} className="list-decimal space-y-2 pl-5 leading-relaxed text-ink">
              {b.items.map((it, j) => <li key={j}>{renderInline(it, `ol${i}-${j}`)}</li>)}
            </ol>
          );
          if (b.type === "quote") return (
            <blockquote key={i} className="border-l-4 border-rust bg-rust-tint py-3 pl-5 pr-4 italic leading-relaxed text-ink">
              &ldquo;{b.text}&rdquo;
              <footer className="mt-1.5 font-mono text-xs not-italic uppercase tracking-wide text-ink-faint">— {b.attribution}</footer>
            </blockquote>
          );
          if (b.type === "tldr") return (
            <div key={i} className="border border-line bg-card p-5">
              <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-rust">TL;DR</p>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-ink">
                {b.items.map((it, j) => <li key={j}>{renderInline(it, `tldr${i}-${j}`)}</li>)}
              </ul>
            </div>
          );
          if (b.type === "table") return (
            <div key={i} className="overflow-x-auto border border-line">
              <table className="w-full min-w-[480px] border-collapse text-sm">
                <caption className="border-b border-line bg-card px-4 py-2 text-left font-mono text-xs uppercase tracking-wide text-ink-faint">{b.caption}</caption>
                <thead>
                  <tr className="bg-paper-dim">
                    {b.headers.map((h, j) => <th key={j} className="border-b border-line px-4 py-2 text-left font-semibold text-ink">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {b.rows.map((row, ri) => (
                    <tr key={ri} className="odd:bg-card">
                      {row.map((cell, ci) => <td key={ci} className="border-b border-line/60 px-4 py-2 text-ink-soft">{renderInline(cell, `tb${i}-${ri}-${ci}`)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          if (b.type === "faq") return (
            <div key={i} className="space-y-5">
              {b.items.map((it, j) => (
                <div key={j}>
                  <h3 className="font-display text-lg font-semibold text-ink">{it.q}</h3>
                  <p className="mt-1.5 leading-[1.75] text-ink">{renderInline(it.a, `faq${i}-${j}`)}</p>
                </div>
              ))}
            </div>
          );
          return <p key={i} className="leading-[1.75] text-ink">{renderInline(b.text, `p${i}`)}</p>;
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
