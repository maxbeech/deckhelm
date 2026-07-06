// Deck framing engine: a transparent, deterministic IRC R507 / DCA6 prescriptive
// sizing tool. Every member size is looked up in the real code span tables
// (deck-tables.ts), every footing is computed from tributary load over soil
// bearing, and every result carries its code citation. Pure + client-side.
// Cost lives in lib/cost.ts (single source of truth for pricing).

import {
  BEAM_SPAN, JOIST_SPAN, JOIST_SIZES, JOIST_SPAN_COLS, ftIn,
  type BeamSize, type JoistSize, type Spacing, type Species,
} from "./deck-tables";
import { frostDepth } from "./frost";

export interface DeckInputs {
  width: number;       // ft, parallel to the house (ledger length)
  projection: number;  // ft, out from the house (= joist clear span)
  spacing: Spacing;    // joist spacing, on-center inches
  species: Species;
  beam: BeamSize | "auto";
  joist: JoistSize | "auto";
  heightFt: number;    // deck surface height above grade
  state: string;       // slug, for frost depth
  soilBearing: number; // psf (presumptive load-bearing value, IRC Table R401.4.1)
}

export interface DeckResult {
  joistSize: JoistSize | null;
  joistMaxSpanIn: number;
  joistOk: boolean;
  joistCount: number;
  joistLinealFt: number;
  beamSize: BeamSize;
  beamMaxPostSpacingIn: number;
  postCount: number;
  postSpacingIn: number;
  postSize: string;
  footingTribSqft: number;
  footingLoadLb: number;
  footingAreaSqft: number;
  footingDiameterIn: number;
  footingDepthIn: number;
  footingConcreteCuFt: number;  // concrete per pier
  concreteBags80: number;       // total 80-lb bags for all piers
  ledgerLagSpacingIn: number;   // IRC R507.9.1.3, ½" lag screws
  ledgerBoltSpacingIn: number;  // IRC R507.9.1.3, ½" through-bolts
  guardHeightIn: number;
  needsGuard: boolean;
  stairs: { risers: number; riserIn: number; treads: number; treadRunIn: number; totalRunIn: number; needsLanding: boolean } | null;
  valid: boolean;       // false when the deck can't be framed prescriptively as drawn
  warnings: string[];
  fmt: (inches: number) => string;
}

const FOOTINGS = [12, 16, 18, 20, 24, 30, 36]; // common round/square footing sizes, in
// IRC Table R507.9.1.3: ledger fastener on-center spacing by joist span [6,8,10,12,14,16,18 ft]
const LAG_SPACING = [30, 23, 18, 15, 13, 11, 10];
const BOLT_SPACING = [36, 36, 34, 29, 24, 21, 19];

export function maxJoistSpan(sp: Species, size: JoistSize, spacing: Spacing): number {
  const idx = spacing === 12 ? 0 : spacing === 16 ? 1 : 2;
  return JOIST_SPAN[sp][size][idx];
}

// Smallest joist that clears a target span (inches) at the given spacing.
export function recommendJoist(sp: Species, spacing: Spacing, targetIn: number): JoistSize | null {
  for (const s of JOIST_SIZES) if (maxJoistSpan(sp, s, spacing) >= targetIn) return s;
  return null;
}

function colForJoistSpan(joistSpanFt: number): number {
  let col = JOIST_SPAN_COLS.findIndex((c) => c >= joistSpanFt);
  if (col === -1) col = JOIST_SPAN_COLS.length - 1; // beyond table → widest col (flagged separately)
  return col;
}

// Max beam span (inches) for a supported joist span (ft). Uses the next-larger
// tabulated joist-span column (conservative, matches how examiners read R507.5).
export function maxBeamSpan(sp: Species, beam: BeamSize, joistSpanFt: number): number {
  return BEAM_SPAN[sp][beam][colForJoistSpan(joistSpanFt)];
}

// Smallest beam that allows at least `targetPostSpacingIn` between posts.
export function recommendBeam(sp: Species, joistSpanFt: number, targetIn: number): BeamSize {
  const order: BeamSize[] = ["2-2x6", "2-2x8", "2-2x10", "3-2x8", "2-2x12", "3-2x10", "3-2x12"];
  for (const b of order) if (maxBeamSpan(sp, b, joistSpanFt) >= targetIn) return b;
  return "3-2x12";
}

export function computeDeck(raw: DeckInputs): DeckResult {
  // Clamp inputs to sane bounds so the displayed form can hold transient values
  // (e.g. an empty field) without producing nonsense.
  const inp: DeckInputs = {
    ...raw,
    width: Math.min(60, Math.max(2, raw.width || 0)),
    projection: Math.min(40, Math.max(2, raw.projection || 0)),
    heightFt: Math.min(40, Math.max(0, raw.heightFt || 0)),
    soilBearing: Math.max(1500, raw.soilBearing || 1500),
    species: raw.species in JOIST_SPAN ? raw.species : "sp",
    spacing: [12, 16, 24].includes(raw.spacing) ? raw.spacing : 16,
  };
  const warnings: string[] = [];
  const projIn = inp.projection * 12;
  const widthIn = inp.width * 12;

  // --- Joists (IRC R507.6) ---
  const recJoist = recommendJoist(inp.species, inp.spacing, projIn);
  const joistSize = inp.joist === "auto" ? recJoist : inp.joist;
  const joistMaxSpanIn = joistSize ? maxJoistSpan(inp.species, joistSize, inp.spacing) : 0;
  const joistOk = !!joistSize && joistMaxSpanIn >= projIn;
  if (!recJoist)
    warnings.push(`A ${inp.projection} ft projection exceeds the IRC R507.6 prescriptive joist table. Split it with a mid-span beam (so each joist span is shorter), or use an engineered design.`);
  else if (joistSize && !joistOk)
    warnings.push(`A ${joistSize} joist only spans ${ftIn(joistMaxSpanIn)} at ${inp.spacing}" o.c.; your deck projects ${ftIn(projIn)}. Step up a size or tighten the spacing.`);
  // Round up: joist spacing must not exceed the code table's on-center value,
  // so the last gap can be tighter than the nominal spacing but never wider.
  const joistCount = Math.ceil(widthIn / inp.spacing) + 1;
  const joistLinealFt = Math.round(joistCount * inp.projection);

  // --- Beam (IRC R507.5): joists span ledger to beam, so supported span = projection ---
  const beamSize = inp.beam === "auto" ? recommendBeam(inp.species, inp.projection, 72) : inp.beam;
  const beamMaxPostSpacingIn = maxBeamSpan(inp.species, beamSize, inp.projection);
  if (inp.projection > 18)
    warnings.push("Supported joist span exceeds 18 ft, the top of the R507.5 beam table. An engineered beam is required.");
  const postCount = Math.max(2, Math.ceil(widthIn / beamMaxPostSpacingIn) + 1);
  const postSpacingIn = widthIn / (postCount - 1);

  // --- Posts (IRC R507.4): 6x6 is the prescriptive minimum; 4x4 only for low decks ---
  const postSize = inp.heightFt <= 4 ? "6x6 (4x4 permitted on low decks where allowed locally)" : "6x6";

  // --- Footings (IRC R507.3): tributary load over presumptive soil bearing ---
  const tributarySqft = (postSpacingIn / 12) * (inp.projection / 2);
  const loadLb = Math.round(tributarySqft * 50); // 40 LL + 10 DL
  const areaSqft = loadLb / inp.soilBearing;
  const reqDiaIn = Math.sqrt(areaSqft / Math.PI) * 2 * 12;
  const footingDiameterIn = FOOTINGS.find((d) => d >= reqDiaIn) ?? 36;
  if (reqDiaIn > 36) warnings.push("Required footing exceeds 36\" diameter. Verify soil bearing or add an intermediate post.");
  const footingDepthIn = frostDepth(inp.state);
  // Concrete per cylindrical pier: π·r²·h. An 80-lb bag yields ~0.60 cu ft.
  const footingConcreteCuFt = Math.round(Math.PI * (footingDiameterIn / 24) ** 2 * (footingDepthIn / 12) * 100) / 100;
  const concreteBags80 = Math.ceil((footingConcreteCuFt * postCount) / 0.6);

  // --- Ledger fasteners (IRC R507.9.1.3): spacing by supported joist span ---
  const lcol = colForJoistSpan(inp.projection);
  const ledgerLagSpacingIn = LAG_SPACING[lcol];
  const ledgerBoltSpacingIn = BOLT_SPACING[lcol];

  // --- Stairs (IRC R311.7) ---
  let stairs: DeckResult["stairs"] = null;
  if (inp.heightFt > 0.6) {
    const totalRise = inp.heightFt * 12;
    let risers = Math.round(totalRise / 7.25);
    if (totalRise / risers > 7.75) risers += 1;
    const riserIn = totalRise / risers;
    const treads = Math.max(1, risers - 1);
    const treadRunIn = 11; // 10" min run + 1" nosing (R311.7.5)
    const needsLanding = totalRise > 151; // R311.7.3: landing required per 12'-7" (151") of vertical rise
    if (needsLanding) warnings.push("Stairs rise more than 12'7\", so an intermediate landing is required (IRC R311.7.3).");
    stairs = { risers, riserIn: Math.round(riserIn * 100) / 100, treads, treadRunIn, totalRunIn: treads * treadRunIn, needsLanding };
  }

  // --- Guard (IRC R312): required when walking surface > 30" above grade ---
  const needsGuard = inp.heightFt * 12 > 30;
  const valid = joistOk && inp.projection <= 18;

  return {
    joistSize, joistMaxSpanIn, joistOk, joistCount, joistLinealFt,
    beamSize, beamMaxPostSpacingIn, postCount, postSpacingIn,
    postSize, footingTribSqft: Math.round(tributarySqft * 10) / 10, footingLoadLb: loadLb,
    footingAreaSqft: Math.round(areaSqft * 100) / 100, footingDiameterIn, footingDepthIn,
    footingConcreteCuFt, concreteBags80,
    ledgerLagSpacingIn, ledgerBoltSpacingIn,
    guardHeightIn: 36, needsGuard, stairs, valid,
    warnings, fmt: ftIn,
  };
}

export const DEFAULT_DECK: DeckInputs = {
  width: 16, projection: 12, spacing: 16, species: "sp",
  beam: "auto", joist: "auto", heightFt: 3, state: "new-york", soilBearing: 1500,
};
