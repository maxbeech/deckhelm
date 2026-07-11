import type { Metadata } from "next";
import Link from "next/link";
import { Section, PageHeader, PhotoPlate } from "@/components/ui";
import { IconArrow } from "@/components/icons";
import { POSTS } from "@/lib/posts";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Deck Building Guides",
  description: "Practical, code-grounded guides to building a deck: joist and beam spans, footings, stairs, permits and cost.",
  alternates: { canonical: `${SITE.url}/blog` },
};

export default function BlogIndex() {
  return (
    <Section tone="paper" className="py-12 sm:py-16">
      <PageHeader
        eyebrow="Deck building guides"
        title="Code-grounded, plain-English answers"
        intro="The questions that come up when you plan and build a deck — answered against the actual IRC, with the calculator one click away."
      />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {POSTS.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`}
            className="group flex flex-col overflow-hidden border border-line bg-card transition hover:-translate-y-0.5 hover:border-rust hover:shadow-[var(--shadow-plate)]">
            <PhotoPlate
              src={p.image}
              alt={p.imageAlt}
              className="aspect-[16/10] w-full"
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
            <div className="flex flex-1 flex-col p-6">
              <div className="flex items-center gap-2 font-mono text-xs text-ink-faint">
                <span className="text-rust">{p.category}</span>
                <span aria-hidden="true">·</span>
                <span>{p.readMins} min read</span>
              </div>
              <div className="mt-2 font-display text-lg font-semibold leading-snug text-ink group-hover:text-rust">{p.title}</div>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{p.description}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-rust">
                Read <IconArrow className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}
