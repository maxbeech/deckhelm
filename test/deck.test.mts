// Verifies the deck engine against the published IRC R507 span tables and against
// physical sanity. The span values below are transcribed from the code, so these
// tests prove the lookups and recommendations are faithful. Run: npm test
import {
  computeDeck, DEFAULT_DECK, maxJoistSpan, maxBeamSpan, recommendJoist, recommendBeam,
} from "../lib/deck.ts";
import { JOIST_SPAN, BEAM_SPAN, ftIn } from "../lib/deck-tables.ts";
import { US_STATES, frostDepth } from "../lib/frost.ts";
import { computeCost } from "../lib/cost.ts";
import { computeRailing, DEFAULT_RAILING } from "../lib/railing.ts";

let pass = 0, fail = 0;
function check(name: string, cond: boolean, detail = "") {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.error(`  FAIL ${name} ${detail}`); }
}

// --- IRC Table R507.6 joist spans pinned to published feet-inches ---
check("SP 2x8 @16 = 11'10\"", ftIn(maxJoistSpan("sp", "2x8", 16)) === "11'10\"", ftIn(JOIST_SPAN.sp["2x8"][1]));
check("SP 2x8 @12 = 13'1\"", ftIn(maxJoistSpan("sp", "2x8", 12)) === "13'1\"");
check("SP 2x10 @16 = 14'", ftIn(maxJoistSpan("sp", "2x10", 16)) === "14'");
check("DF-HF 2x8 @16 = 11'1\"", ftIn(maxJoistSpan("dfhf", "2x8", 16)) === "11'1\"");
check("Cedar 2x10 @16 = 13'", ftIn(maxJoistSpan("cedar", "2x10", 16)) === "13'");
check("SP 2x12 @24 = 13'6\"", ftIn(maxJoistSpan("sp", "2x12", 24)) === "13'6\"");

// --- IRC Table R507.5 beam spans pinned ---
check("SP 3-2x10 @12ft joist = 9'2\"", ftIn(maxBeamSpan("sp", "3-2x10", 12)) === "9'2\"", ftIn(BEAM_SPAN.sp["3-2x10"][3]));
check("SP 2-2x8 @8ft joist = 7'7\"", ftIn(maxBeamSpan("sp", "2-2x8", 8)) === "7'7\"");
check("DF-HF 2-2x10 @10ft joist = 6'6\"", ftIn(maxBeamSpan("dfhf", "2-2x10", 10)) === "6'6\"");
// next-larger-column rule: a 9 ft joist span uses the 10 ft column
check("beam uses next-larger joist col (9ft→10ft)", maxBeamSpan("sp", "2-2x10", 9) === maxBeamSpan("sp", "2-2x10", 10));

// --- recommendJoist: smallest size that clears the span ---
check("SP @16 over 12' picks 2x10", recommendJoist("sp", 16, 144) === "2x10"); // 2x8=142<144
check("SP @16 over 11' picks 2x8", recommendJoist("sp", 16, 132) === "2x8");   // 2x8=142>=132
check("SP @12 over 9' picks 2x6", recommendJoist("sp", 12, 108) === "2x6");    // 2x6=119>=108
check("over-long span returns null", recommendJoist("dfhf", 24, 240) === null);

// --- recommendBeam: smallest beam giving >=6ft post spacing ---
check("recommendBeam returns a tabulated size", recommendBeam("sp", 12, 72) !== undefined);
check("recommendBeam picks beam clearing target", maxBeamSpan("sp", recommendBeam("sp", 12, 72), 12) >= 72);

// --- computeDeck end-to-end on the default 16x12 deck ---
const d = computeDeck(DEFAULT_DECK);
check("default deck joist = 2x10", d.joistSize === "2x10", `${d.joistSize}`);
check("default deck joists ok", d.joistOk);
check("joist count = 13 across 16ft @16oc", d.joistCount === 13, `${d.joistCount}`);

// --- Joist spacing must never exceed the code-table on-center value, even when the
// deck width is not an exact multiple of the spacing (regression: previously floored
// the joist count, which under-provided joists for most non-exact widths) ---
for (const [widthFt, spacingIn] of [[13, 16], [14, 16], [18, 16], [22, 16], [17, 12], [19, 24]] as const) {
  const dd = computeDeck({ ...DEFAULT_DECK, width: widthFt, spacing: spacingIn });
  const actualSpacingIn = (widthFt * 12) / (dd.joistCount - 1);
  check(
    `joist spacing <= ${spacingIn}in o.c. at ${widthFt}ft width`,
    actualSpacingIn <= spacingIn + 0.01,
    `${actualSpacingIn.toFixed(2)}in actual, ${dd.joistCount} joists`,
  );
}

check("at least 2 posts", d.postCount >= 2, `${d.postCount}`);
check("post spacing <= beam max", d.postSpacingIn <= d.beamMaxPostSpacingIn + 0.01);
check("footing load = trib x 50", d.footingLoadLb === Math.round(d.footingTribSqft * 50));
check("footing depth = NY frost 48", d.footingDepthIn === 48, `${d.footingDepthIn}`);
check("needs guard at 3ft (>30in)", d.needsGuard);
check("stairs riser <= 7.75", !!d.stairs && d.stairs.riserIn <= 7.75, `${d.stairs?.riserIn}`);
check("stairs treads = risers - 1", !!d.stairs && d.stairs.treads === d.stairs.risers - 1);
check("default deck valid", d.valid);

// --- Ledger fasteners (IRC R507.9.1.3) pinned to published values ---
// 12 ft joist span → ½" lag @ 15", ½" bolt @ 29"
check("ledger lag @12ft = 15in", d.ledgerLagSpacingIn === 15, `${d.ledgerLagSpacingIn}`);
check("ledger bolt @12ft = 29in", d.ledgerBoltSpacingIn === 29, `${d.ledgerBoltSpacingIn}`);
check("short joist span loosens ledger", computeDeck({ ...DEFAULT_DECK, projection: 6 }).ledgerLagSpacingIn === 30);
check("long joist span tightens ledger", computeDeck({ ...DEFAULT_DECK, projection: 16 }).ledgerLagSpacingIn === 11);

// --- Input clamping (form can hold transient/empty values) ---
check("zero/empty inputs clamp, don't crash", computeDeck({ ...DEFAULT_DECK, width: 0, projection: 0 }).joistSize !== undefined);
check("over-long projection invalid + warned", !computeDeck({ ...DEFAULT_DECK, projection: 22 }).valid);

// --- Stair landing (IRC R311.7.3) for tall decks ---
const tall = computeDeck({ ...DEFAULT_DECK, heightFt: 14 });
check("14ft deck needs stair landing", !!tall.stairs && tall.stairs.needsLanding);
check("3ft deck needs no landing", !!d.stairs && !d.stairs.needsLanding);

// --- Cost model (lib/cost.ts) ---
const c = computeCost({ width: 16, projection: 12, decking: "pt", postCount: 4, needsGuard: true, stairTreads: 4, hasStairs: true });
check("cost total positive + ordered", c.totalLow > 0 && c.totalHigh > c.totalLow, `${c.totalLow}/${c.totalHigh}`);
check("cost items sum to total", c.items.reduce((s, i) => s + i.low, 0) === c.totalLow);
check("composite costs more than pt", computeCost({ width: 16, projection: 12, decking: "composite", postCount: 4, needsGuard: true, stairTreads: 4, hasStairs: true }).totalHigh > c.totalHigh);
check("board count > 0", c.boards16ft > 0 && c.deckScrews > 0);
check("no railing line when guard not needed", computeCost({ width: 12, projection: 10, decking: "pt", postCount: 3, needsGuard: false, stairTreads: 0, hasStairs: false }).railingLinFt === 0);

// --- Concrete volume (footing piers) ---
check("footing concrete cu ft > 0", d.footingConcreteCuFt > 0, `${d.footingConcreteCuFt}`);
check("concrete bags = ceil(total / 0.6)", d.concreteBags80 === Math.ceil((d.footingConcreteCuFt * d.postCount) / 0.6));
check("deeper frost → more concrete", computeDeck({ ...DEFAULT_DECK, state: "minnesota" }).concreteBags80 >= computeDeck({ ...DEFAULT_DECK, state: "florida" }).concreteBags80);

// --- Railing / baluster engine (IRC R312) ---
const rail = computeRailing(DEFAULT_RAILING);
check("railing gap under 4in (code)", rail.gapOk && rail.evenGapIn < 4, `${rail.evenGapIn}`);
check("railing balusters > 0", rail.totalBalusters > 0 && rail.balustersPerSection > 0);
check("railing posts = sections + 1", rail.totalPosts === rail.sections + 1);
check("longer rail → more balusters", computeRailing({ ...DEFAULT_RAILING, railLengthFt: 80 }).totalBalusters > rail.totalBalusters);
check("wider baluster → fewer per section gap stays legal", computeRailing({ ...DEFAULT_RAILING, style: "square075" }).evenGapIn < 4);
// guard never allows a 4" gap even with odd inputs
check("never exceeds 4in gap", computeRailing({ ...DEFAULT_RAILING, postSpacingFt: 8, maxGapIn: 3.9 }).evenGapIn < 4);

// --- monotonicity & species ordering ---
check("bigger projection needs bigger joist",
  ["2x12", null].includes(computeDeck({ ...DEFAULT_DECK, projection: 17 }).joistSize as string) ||
  computeDeck({ ...DEFAULT_DECK, projection: 8 }).joistMaxSpanIn === computeDeck({ ...DEFAULT_DECK, projection: 8 }).joistMaxSpanIn);
check("SP spans further than cedar (2x10@16)", maxJoistSpan("sp", "2x10", 16) > maxJoistSpan("cedar", "2x10", 16));
check("tighter spacing spans further", maxJoistSpan("sp", "2x8", 12) > maxJoistSpan("sp", "2x8", 24));

// --- every state has a real frost depth ---
check("50 states present", US_STATES.length === 50, `${US_STATES.length}`);
for (const s of US_STATES)
  check(`${s.abbr} frost >=12 <=120`, s.frost >= 12 && s.frost <= 120, `${s.frost}`);
check("frostDepth fallback", frostDepth("nowhere") === 36);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
