// Explicit boundary & edge-case behaviour of the deck engine — complements the
// invariant fuzz sweep with named assertions of documented behaviour at the
// limits (clamping, engineered-design flags, guard/stair thresholds, invalid
// input fallbacks). Run: npm test
import { computeDeck, DEFAULT_DECK } from "../lib/deck.ts";
import { frostDepth } from "../lib/frost.ts";

let pass = 0, fail = 0;
function check(name: string, cond: boolean, detail = "") {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.error(`  FAIL ${name} ${detail}`); }
}
const D = (o: Partial<Parameters<typeof computeDeck>[0]>) => computeDeck({ ...DEFAULT_DECK, ...o });

// --- clamping of out-of-range dimensions ---
check("oversize width clamps (no overflow)", Number.isFinite(D({ width: 1e6 }).joistCount) && D({ width: 1e6 }).joistCount < 200);
check("zero width still yields a footprint", D({ width: 0, projection: 0 }).postCount >= 2);
check("negative inputs never crash / go NaN", Number.isFinite(D({ width: -5, projection: -3, heightFt: -2 } as never).footingLoadLb));
check("soil bearing floored at 1500 psf", D({ soilBearing: 200 }).footingAreaSqft === D({ soilBearing: 1500 }).footingAreaSqft);

// --- prescriptive limits → engineered-design flags ---
const beyondTable = D({ projection: 40 });
check("projection beyond joist table → no prescriptive joist", beyondTable.joistSize === null);
check("projection beyond table warns", beyondTable.warnings.some((w) => /exceeds|engineered/i.test(w)));
const over18 = D({ projection: 20 });
check("projection > 18 ft → not prescriptively valid", over18.valid === false);
check("projection > 18 ft → engineered-beam warning", over18.warnings.some((w) => /18 ft|engineered/i.test(w)));
check("in-table projection stays valid", D({ projection: 10 }).valid === true);

// --- guard & stair thresholds (IRC R312 / R311.7) ---
check("height 0 → no stairs, no guard", D({ heightFt: 0 }).stairs === null && D({ heightFt: 0 }).needsGuard === false);
check("surface exactly 30in (2.5ft) → no guard required", D({ heightFt: 2.5 }).needsGuard === false);
check("surface above 30in → guard required", D({ heightFt: 3 }).needsGuard === true);
check("any real height → stairs laid out", D({ heightFt: 3 }).stairs !== null);
const tallStairs = D({ heightFt: 16 });
check("stair riser never exceeds 7.75in even when tall", !!tallStairs.stairs && tallStairs.stairs.riserIn <= 7.75);
check("tall run triggers landing warning", tallStairs.warnings.some((w) => /landing/i.test(w)));

// --- invalid enum inputs fall back safely ---
check("invalid species falls back to Southern Pine", D({ species: "xyz" as never }).joistSize === D({ species: "sp" }).joistSize);
check("invalid spacing falls back to 16in", D({ spacing: 10 as never }).joistCount === D({ spacing: 16 }).joistCount);
check("unknown state slug → 36in fallback depth", D({ state: "atlantis" }).footingDepthIn === 36 && frostDepth("atlantis") === 36);

// --- derived quantities stay sane at the edges ---
check("ledger fastener spacing within table range", D({}).ledgerLagSpacingIn >= 10 && D({}).ledgerLagSpacingIn <= 36);
check("concrete bags positive", D({}).concreteBags80 > 0);
check("footing depth always >= 12in (bearing soil)", D({ state: "florida" }).footingDepthIn >= 12);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
