import { existsSync } from "node:fs";
import { join } from "node:path";
import { POSTS, type Block } from "../lib/posts.ts";

const EXPANSION_SLUGS = [
  "deck-vs-patio",
  "composite-decking-vs-wood-cost",
  "how-much-weight-can-a-deck-hold",
  "is-it-cheaper-to-build-your-own-deck",
  "deck-cost-per-square-foot",
  "labor-cost-to-build-a-deck",
  "trex-decking-cost",
  "deck-repair-cost-guide",
  "best-joist-hangers-for-decks",
  "pressure-treated-lumber-prices-2026",
  "best-deck-railing-kits",
  "deck-screws-galvanized-vs-stainless",
  "stair-stringer-calculator-guide",
  "small-deck-ideas",
  "2026-backyard-and-deck-trends",
];

function blockText(block: Block): string {
  if (block.type === "p" || block.type === "h2" || block.type === "h3" || block.type === "quote") return block.text;
  if (block.type === "faq") return block.items.map(({ q, a }) => `${q} ${a}`).join(" ");
  if (block.type === "table") return `${block.caption} ${block.headers.join(" ")} ${block.rows.flat().join(" ")}`;
  return block.items.join(" ");
}

function links(text: string, target: "internal" | "external"): number {
  const matches = text.match(/\[[^\]]+\]\(([^)]+)\)/g) ?? [];
  return matches.filter((match) => target === "internal" ? match.includes("](/") : match.includes("](http")).length;
}

let failed = 0;
function check(label: string, condition: boolean, detail: string) {
  if (condition) console.log(`  ok   ${label}`);
  else {
    failed += 1;
    console.error(`  FAIL ${label}: ${detail}`);
  }
}

const posts = EXPANSION_SLUGS.map((slug) => POSTS.find((post) => post.slug === slug));
check("all 15 expansion posts exist", posts.every(Boolean), `${posts.filter(Boolean).length}/15 found`);

for (const post of posts) {
  if (!post) continue;
  const text = post.body.map(blockText).join(" ");
  const words = text.trim().split(/\s+/).length;
  const date = new Date(`${post.date}T00:00:00Z`);
  const start = new Date("2026-09-24T00:00:00Z");
  const end = new Date("2026-09-30T23:59:59Z");

  check(`${post.slug}: valid category`, ["Academy", "News", "Reviews"].includes(post.category), post.category);
  check(`${post.slug}: concise meta description`, post.description.length < 155, `${post.description.length} characters`);
  check(`${post.slug}: 1,200–2,500 words`, words >= 1200 && words <= 2500, `${words} words`);
  check(`${post.slug}: 6–12 supporting keywords`, post.supportingKeywords.length >= 6 && post.supportingKeywords.length <= 12, `${post.supportingKeywords.length} keywords`);
  check(`${post.slug}: published in the preceding week`, date >= start && date <= end, post.date);
  check(`${post.slug}: featured image exists`, existsSync(join(process.cwd(), "public", post.image)), post.image);
  check(`${post.slug}: schema-driving blocks`, post.body.some((b) => b.type === "faq") && post.body.some((b) => b.type === "table"), "missing FAQ or table");
  check(`${post.slug}: attributed expert quote`, post.body.some((b) => b.type === "quote"), "missing quote");
  check(`${post.slug}: three internal links`, links(text, "internal") >= 3, `${links(text, "internal")} internal links`);
  check(`${post.slug}: two external references`, links(text, "external") >= 2, `${links(text, "external")} external links`);
}

if (failed) process.exit(1);
console.log(`\n${EXPANSION_SLUGS.length} publication-ready posts passed content validation`);
