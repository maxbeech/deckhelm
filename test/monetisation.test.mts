// Verifies the affiliate-link generation (lib/affiliate.ts) and the lead-form
// validation (lib/lead.ts) that power the Shop Materials links and the
// /find-a-deck-builder lead capture. Run: npm test
import { affiliateQuery, amazonSearchUrl, AMAZON_TAG } from "../lib/affiliate.ts";
import { isHoneypotFilled, leadEmailHtml, parseLead, validateLead, type LeadInput } from "../lib/lead.ts";
import { REVERSED_EMAIL } from "../components/ObfuscatedEmail.tsx";
import { SITE } from "../lib/site.ts";

let pass = 0, fail = 0;
function check(name: string, cond: boolean, detail = "") {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.error(`  FAIL ${name} ${detail}`); }
}

// --- lib/affiliate.ts ---
check("decking query depends on material", affiliateQuery("decking", "composite") !== affiliateQuery("decking", "pt"));
check("decking with no material is null", affiliateQuery("decking", undefined) === null);
check("substructure has a query", typeof affiliateQuery("substructure") === "string");
check("footings has a query", typeof affiliateQuery("footings") === "string");
check("railing has a query", typeof affiliateQuery("railing") === "string");
check("stairs has a query", typeof affiliateQuery("stairs") === "string");
check("permit has no query (nothing to sell)", affiliateQuery("permit") === null);

const url = amazonSearchUrl("composite decking boards");
const parsed = new URL(url);
check("search url hits amazon.com/s", parsed.origin + parsed.pathname === "https://www.amazon.com/s");
check("search url carries the exact query", parsed.searchParams.get("k") === "composite decking boards");
check("no AMAZON_TAG in this env → no tag param", AMAZON_TAG === "" ? !parsed.searchParams.has("tag") : parsed.searchParams.get("tag") === AMAZON_TAG, `AMAZON_TAG=${AMAZON_TAG}`);

// --- lib/lead.ts ---
const base: Record<string, unknown> = { name: "Jess Carter", email: "jess@example.com", zip: "12345", projectType: "New deck construction" };
check("valid lead passes", validateLead(parseLead(base)) === null);
check("missing name fails", validateLead(parseLead({ ...base, name: "" })) !== null);
check("bad email fails", validateLead(parseLead({ ...base, email: "not-an-email" })) !== null);
check("missing zip fails", validateLead(parseLead({ ...base, zip: "" })) !== null);
check("missing project type fails", validateLead(parseLead({ ...base, projectType: "" })) !== null);
check("overlong name fails", validateLead(parseLead({ ...base, name: "x".repeat(201) })) !== null);

check("honeypot empty → not a bot", !isHoneypotFilled(base));
check("honeypot filled → flagged as bot", isHoneypotFilled({ ...base, company: "Acme Spam Co" }));

const xssLead: LeadInput = { name: "<script>alert(1)</script>", email: "a@b.com", phone: "", zip: "00000", state: "", projectType: "Other", budget: "", timeline: "", details: "" };
const html = leadEmailHtml(xssLead);
check("email HTML escapes injected markup", !html.includes("<script>"), html);
check("email HTML keeps the escaped text visible", html.includes("&lt;script&gt;"));

// --- components/ObfuscatedEmail.tsx ---
check(
  "obfuscated email matches SITE.email",
  REVERSED_EMAIL.split("").reverse().join("") === SITE.email,
  `${REVERSED_EMAIL} reversed !== ${SITE.email}`,
);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
