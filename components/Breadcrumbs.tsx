// Single breadcrumb component used across calculator / state / blog pages: renders
// the visible trail AND the BreadcrumbList structured data from the same items.
import Link from "next/link";
import { SITE } from "@/lib/site";

export interface Crumb { name: string; href?: string }

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      ...(c.href ? { item: `${SITE.url}${c.href}` } : {}),
    })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="mb-4 text-sm text-ink-soft" aria-label="Breadcrumb">
        {items.map((c, i) => (
          <span key={c.name}>
            {i > 0 && " › "}
            {c.href ? <Link href={c.href} className="hover:text-ink">{c.name}</Link> : <span className="text-ink-soft">{c.name}</span>}
          </span>
        ))}
      </nav>
    </>
  );
}
