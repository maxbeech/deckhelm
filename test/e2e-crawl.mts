// Crawls every route the site actually generates against a running server and
// checks each response for a 200 status plus a handful of concrete render
// failures unit tests can't catch (literal "undefined"/"NaN" leaking into
// markup, an empty <h1>). Requires a server already running (npm run dev or
// npm start); does not start one itself. Run: BASE_URL=http://localhost:3000
// npm run test:e2e
import { US_STATES } from "../lib/frost.ts";
import { CALCS } from "../lib/calculators.ts";
import { POSTS } from "../lib/posts.ts";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

const routes = [
  "/",
  "/calculators",
  "/states",
  "/blog",
  "/pricing",
  "/methodology",
  "/find-a-deck-builder",
  "/sitemap.xml",
  "/robots.txt",
  ...CALCS.map((c) => `/calculators/${c.slug}`),
  ...US_STATES.map((s) => `/states/${s.slug}`),
  ...POSTS.map((p) => `/blog/${p.slug}`),
];

const textOf = (html: string) =>
  html.replace(/<script[^>]*>[\s\S]*?<\/script>/g, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

// Regression coverage for a real bug found and fixed in this codebase: in this
// Next.js/Turbopack version, a JSX text node starting right after a tag or
// {expression} loses its leading space at compile time if that node's source
// also contains HTML entity syntax (&apos;/&quot;/&amp;) anywhere within it,
// e.g. "{s.name} Deck Code" rendered as "New YorkDeck Code", and
// "<strong>X</strong> in seconds" rendered as "Xin seconds". The fix was
// removing entity syntax from JSX text sitewide (see eslint.config.mjs for the
// guard against reintroducing it); React still HTML-escapes the literal quote
// characters back to "&quot;" etc at render time, which is expected and fine,
// it's a different, later stage than the compiler bug this guards against.
// These check the exact phrasing renders with the space intact, against
// textOf() (tags stripped) output, on one page of each affected shape.
const exactPhraseChecks: Record<string, string[]> = {
  "/": ["deck code in seconds"],
  "/states/alabama": ["Alabama deck code and footing depth", "least 12 &quot; below grade to sit"],
};

let pass = 0, fail = 0;
const failures: string[] = [];

function check(route: string, cond: boolean, detail: string) {
  if (cond) pass++;
  else { fail++; failures.push(`${route}: ${detail}`); }
}

for (const route of routes) {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${route}`);
  } catch (e) {
    check(route, false, `fetch failed: ${(e as Error).message}`);
    continue;
  }
  check(route, res.status === 200, `status ${res.status}`);
  if (!res.ok) continue;

  const body = await res.text();
  if (!route.endsWith(".xml") && !route.endsWith(".txt")) {
    const visible = body.replace(/<script[^>]*>[\s\S]*?<\/script>/g, "");
    check(route, !/\bundefined\b/.test(visible), "literal 'undefined' in visible HTML");
    check(route, !/\bNaN\b/.test(visible), "literal 'NaN' in visible HTML");
    check(route, !/<h1[^>]*><\/h1>/.test(visible), "empty <h1>");
  }
  for (const phrase of exactPhraseChecks[route] ?? []) {
    check(route, textOf(body).includes(phrase), `expected phrase not found: "${phrase}"`);
  }
}

console.log(`\ne2e crawl: ${routes.length} routes, ${pass} checks passed, ${fail} failed`);
if (failures.length) {
  console.error("Failures:");
  for (const f of failures) console.error(`  FAIL ${f}`);
  process.exit(1);
}
