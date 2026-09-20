// Guards the crawl contract: one canonical host, a truthful sitemap, no
// unsupported state-template URLs, and the legacy 404's permanent redirect.
import * as sitemapModule from "../app/sitemap.ts";
import * as robotsModule from "../app/robots.ts";
import * as nextConfigModule from "../next.config.ts";
import { POSTS } from "../lib/posts.ts";
import { SITE } from "../lib/site.ts";

let pass = 0, fail = 0;
function check(name: string, condition: boolean, detail = "") {
  if (condition) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.error(`  FAIL ${name}${detail ? `: ${detail}` : ""}`); }
}

function unwrapDefault<T>(module: { default: T | { default: T } }): T {
  const candidate = module.default;
  return (typeof candidate === "object" && candidate !== null && "default" in candidate)
    ? candidate.default
    : candidate;
}

const sitemap = unwrapDefault<typeof sitemapModule.default>(sitemapModule);
const robots = unwrapDefault<typeof robotsModule.default>(robotsModule);
const nextConfig = unwrapDefault<typeof nextConfigModule.default>(nextConfigModule);
const urls = sitemap();
const robotsConfig = robots();
const redirects = await nextConfig.redirects?.() ?? [];

check("www is the single canonical host", SITE.url === "https://www.deckhelm.com");
check("sitemap emits only www URLs", urls.every((entry) => entry.url.startsWith(SITE.url)));
check("sitemap excludes thin state templates", !urls.some((entry) => entry.url.includes("/states/")));
check("sitemap includes every published guide", POSTS.every((post) => urls.some((entry) => entry.url === `${SITE.url}/blog/${post.slug}`)));
check("guide dates are truthful sitemap lastmod values", POSTS.every((post) => urls.some((entry) => entry.url === `${SITE.url}/blog/${post.slug}` && entry.lastModified === post.date)));
check("robots declares the canonical host", robotsConfig.host === SITE.url);
check("robots points crawlers at the www sitemap", robotsConfig.sitemap === `${SITE.url}/sitemap.xml`);
check("ledger flashing 404 permanently redirects", redirects.some((redirect) => redirect.source === "/blog/deck-ledger-flashing-guide" && redirect.destination === "/blog/deck-ledger-board-attachment" && redirect.permanent));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
