// Itemized deck cost + materials estimate. Real 2026 US ranges: the LOW end is a
// DIY material budget, the HIGH end is contractor-installed (labor included).
// Single source of truth for all pricing/material counts on the site.

export type Decking = "pt" | "cedar" | "composite" | "hardwood";

export const DECKING_LABEL: Record<Decking, string> = {
  pt: "Pressure-treated pine",
  cedar: "Cedar / redwood",
  composite: "Composite (Trex-style)",
  hardwood: "Hardwood (ipe / cumaru)",
};

// Decking surface $/sq ft [DIY material, contractor-installed]
const DECK_SQFT: Record<Decking, [number, number]> = {
  pt: [3, 9],
  cedar: [6, 14],
  composite: [8, 18],
  hardwood: [11, 24],
};

export type CostKind = "decking" | "substructure" | "footings" | "railing" | "stairs" | "permit";
export interface CostItem { kind: CostKind; label: string; low: number; high: number; detail: string }
export interface CostResult {
  items: CostItem[];
  totalLow: number;
  totalHigh: number;
  perSqftLow: number;
  perSqftHigh: number;
  deckAreaSqft: number;
  boardLinealFt: number;   // lineal feet of decking board
  boards16ft: number;      // count of 16-ft deck boards (incl. ~10% waste)
  deckScrews: number;
  railingLinFt: number;
}

const money = (n: number) => Math.round(n / 5) * 5;

export function computeCost(opts: {
  width: number; projection: number; decking: Decking; postCount: number;
  needsGuard: boolean; stairTreads: number; hasStairs: boolean;
}): CostResult {
  const area = Math.max(1, Math.round(opts.width * opts.projection));
  const [dLow, dHigh] = DECK_SQFT[opts.decking];

  // Decking surface
  const deckLow = area * dLow;
  const deckHigh = area * dHigh;
  // Boards: 5.5" board + 1/4" gap = 5.75" coverage → 12/5.75 lineal ft per sq ft.
  const boardLinealFt = Math.round(area * (12 / 5.75) * 1.1); // +10% waste
  const boards16ft = Math.ceil(boardLinealFt / 16);
  const deckScrews = Math.round(area * 3.5); // ~2 face screws per joist crossing

  // Substructure: PT joists, beam, ledger, posts, hardware, flashing ($/sq ft).
  const subLow = area * 6;
  const subHigh = area * 13;

  // Footings: concrete pier + dig, per post.
  const footLow = opts.postCount * 35;
  const footHigh = opts.postCount * 90;

  // Railing (only if a guard is required): 3 open sides of an attached deck.
  const railingLinFt = opts.needsGuard ? Math.round(opts.width + 2 * opts.projection) : 0;
  const railLow = railingLinFt * 15;
  const railHigh = railingLinFt * 60;

  // Stairs: per tread.
  const stairLow = opts.hasStairs ? opts.stairTreads * 30 : 0;
  const stairHigh = opts.hasStairs ? opts.stairTreads * 95 : 0;

  // Permit + misc allowance.
  const permitLow = 75;
  const permitHigh = 500;

  const items: CostItem[] = [
    { kind: "decking", label: `Decking: ${DECKING_LABEL[opts.decking]}`, low: money(deckLow), high: money(deckHigh), detail: `${area} sq ft · ~${boards16ft} × 16′ boards` },
    { kind: "substructure", label: "Substructure (joists, beam, posts, hardware)", low: money(subLow), high: money(subHigh), detail: `${area} sq ft framing` },
    { kind: "footings", label: "Footings (concrete piers)", low: money(footLow), high: money(footHigh), detail: `${opts.postCount} posts` },
  ];
  if (railingLinFt > 0) items.push({ kind: "railing", label: "Railing / guard", low: money(railLow), high: money(railHigh), detail: `${railingLinFt} lin ft` });
  if (opts.hasStairs) items.push({ kind: "stairs", label: "Stairs", low: money(stairLow), high: money(stairHigh), detail: `${opts.stairTreads} treads` });
  items.push({ kind: "permit", label: "Permit + fasteners + misc", low: permitLow, high: permitHigh, detail: "allowance" });

  const totalLow = items.reduce((s, i) => s + i.low, 0);
  const totalHigh = items.reduce((s, i) => s + i.high, 0);
  return {
    items, totalLow, totalHigh,
    perSqftLow: Math.round((totalLow / area) * 10) / 10,
    perSqftHigh: Math.round((totalHigh / area) * 10) / 10,
    deckAreaSqft: area, boardLinealFt, boards16ft, deckScrews, railingLinFt,
  };
}

export const DEFAULT_DECKING: Decking = "pt";
