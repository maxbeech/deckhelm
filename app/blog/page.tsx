import type { Metadata } from "next";
import Link from "next/link";
import { POSTS } from "@/lib/posts";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Deck Building Guides",
  description: "Practical, code-grounded guides to building a deck: joist and beam spans, footings, stairs, permits and cost.",
  alternates: { canonical: `${SITE.url}/blog` },
};

export default function BlogIndex() {
  return (
    <>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Deck building guides</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Clear, code-grounded answers to the questions that come up when you plan and build a deck.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {POSTS.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`}
            className="border border-line bg-card p-5 transition hover:border-rust-line">
            <div className="font-semibold text-ink">{p.title}</div>
            <div className="mt-1 text-sm text-ink-soft">{p.description}</div>
            <div className="mt-2 text-xs text-ink-soft">{p.readMins} min read</div>
          </Link>
        ))}
      </div>
    </>
  );
}
