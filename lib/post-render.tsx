// Shared, safe inline-text rendering for blog post bodies. Supports a strict
// `[label](url)` link syntax inside `p`/`ul`/`table` text without ever using
// dangerouslySetInnerHTML — everything is built as real React nodes, so
// there's no HTML-injection surface even though the copy is hand-authored.
import Link from "next/link";
import { Fragment } from "react";

const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;

export function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  LINK_RE.lastIndex = 0;
  while ((m = LINK_RE.exec(text))) {
    if (m.index > last) nodes.push(<Fragment key={`${keyPrefix}-t${i++}`}>{text.slice(last, m.index)}</Fragment>);
    const [, label, href] = m;
    if (href.startsWith("/")) {
      nodes.push(
        <Link key={`${keyPrefix}-l${i++}`} href={href} className="text-rust underline decoration-rust/30 underline-offset-2 hover:decoration-rust">
          {label}
        </Link>
      );
    } else {
      nodes.push(
        <a key={`${keyPrefix}-l${i++}`} href={href} target="_blank" rel="noopener noreferrer" className="text-rust underline decoration-rust/30 underline-offset-2 hover:decoration-rust">
          {label}
        </a>
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(<Fragment key={`${keyPrefix}-t${i++}`}>{text.slice(last)}</Fragment>);
  return nodes;
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function stripLinks(text: string): string {
  return text.replace(LINK_RE, "$1");
}
