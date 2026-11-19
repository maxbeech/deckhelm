// Regression: every guide a calculator links to must be a real blog post, so a
// renamed or removed slug fails the build's tests instead of shipping a 404 link.
import assert from "node:assert/strict";
import { CALCS } from "../lib/calculators.ts";
import { POSTS } from "../lib/posts.ts";

const postSlugs = new Set(POSTS.map((p) => p.slug));
const joist = CALCS.find((c) => c.slug === "deck-joist-span-calculator");
assert.ok(joist, "deck-joist-span-calculator must exist");
assert.ok(joist.guides && joist.guides.length >= 3, `joist calculator needs >=3 guides, got ${joist.guides?.length}`);

for (const c of CALCS) {
  for (const g of c.guides ?? []) {
    const slug = g.href.replace(/^\/blog\//, "");
    assert.ok(
      g.href.startsWith("/blog/") && postSlugs.has(slug),
      `calculator ${c.slug} links to missing guide ${g.href} (inputs: href=${g.href})`,
    );
  }
}
console.log("calculator-guides: ok");
