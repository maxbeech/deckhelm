// Guards the llms.txt surface: the file is served from public/ at the site
// root, names the site, and every link it offers is a page the sitemap lists.
// If a link drifts from the sitemap, the failing URL is printed in the detail.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import * as sitemapModule from "../app/sitemap.ts";
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
const sitemapUrls = new Set(sitemap().map((entry) => entry.url));

const file = fileURLToPath(new URL("../public/llms.txt", import.meta.url));
const text = readFileSync(file, "utf8");
const linked = [...text.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map((match) => match[1]);

check("llms.txt starts with the site name heading", text.startsWith(`# ${SITE.name}\n`), `first line was ${JSON.stringify(text.split("\n")[0])}`);
check("llms.txt has a summary blockquote", /^> .+/m.test(text));
check("llms.txt offers at least one link", linked.length > 0);
check("every llms.txt link uses the canonical www host", linked.every((url) => url.startsWith(SITE.url)), linked.filter((url) => !url.startsWith(SITE.url)).join(", "));
for (const url of linked) {
  // Trailing slash on the home URL is the only normalisation the sitemap needs.
  const normalised = url === `${SITE.url}/` ? SITE.url : url;
  check(`llms.txt link is in the sitemap: ${url}`, sitemapUrls.has(normalised), `${normalised} is not listed in app/sitemap.ts`);
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
