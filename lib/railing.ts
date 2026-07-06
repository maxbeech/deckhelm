// Deck railing / baluster spacing engine. Pure + deterministic. Enforces the IRC
// R312.1 guard rules: a 4" sphere must not pass between balusters (so the clear
// gap is < 4"; 3.5" is the common build target), and the guard is ≥ 36" tall on a
// residential deck. Solves the even baluster gap a builder actually lays out.

export type BalusterStyle = "wood2x2" | "square075" | "round1" | "colonial";

export const BALUSTER_LABEL: Record<BalusterStyle, string> = {
  wood2x2: "Wood 2×2 (1½″)",
  square075: "Square metal (¾″)",
  round1: "Round metal (1″)",
  colonial: "Colonial / 2×2 turned (1½″)",
};
const BALUSTER_WIDTH: Record<BalusterStyle, number> = {
  wood2x2: 1.5, square075: 0.75, round1: 1.0, colonial: 1.5,
};

export interface RailingInputs {
  railLengthFt: number;   // total guard length (open perimeter)
  postSpacingFt: number;  // center-to-center between rail posts
  style: BalusterStyle;
  maxGapIn: number;       // target clear gap (must be < 4")
  postWidthIn: number;    // rail post nominal width (4x4 = 3.5")
}

export interface RailingResult {
  sections: number;
  sectionClearIn: number;
  balustersPerSection: number;
  evenGapIn: number;
  totalBalusters: number;
  totalPosts: number;
  guardHeightIn: number;
  gapOk: boolean;
  warnings: string[];
}

export function computeRailing(raw: RailingInputs): RailingResult {
  const railLengthFt = Math.max(1, raw.railLengthFt || 0);
  const postSpacingFt = Math.min(8, Math.max(2, raw.postSpacingFt || 6));
  const maxGap = Math.min(3.9, Math.max(2, raw.maxGapIn || 3.5)); // never allow ≥4"
  const postWidthIn = Math.min(7.5, Math.max(1.5, raw.postWidthIn || 3.5));
  const w = BALUSTER_WIDTH[raw.style];
  const warnings: string[] = [];

  const sections = Math.max(1, Math.ceil(railLengthFt / postSpacingFt));
  const totalPosts = sections + 1;
  // Clear opening within a section = post-to-post spacing minus one post width.
  const sectionSpacingIn = (railLengthFt * 12) / sections;
  const sectionClearIn = Math.max(1, sectionSpacingIn - postWidthIn);

  // Smallest baluster count whose even gap is <= maxGap.
  // gaps = n+1; evenGap = (clear - n*w)/(n+1) <= maxGap, so n >= (clear - maxGap)/(w + maxGap)
  const n = Math.max(1, Math.ceil((sectionClearIn - maxGap) / (w + maxGap)));
  const evenGapIn = (sectionClearIn - n * w) / (n + 1);
  const gapOk = evenGapIn > 0 && evenGapIn < 4;
  if (!gapOk) warnings.push("Adjust post spacing or baluster size: the even gap can't be kept under 4\" as entered.");

  return {
    sections,
    sectionClearIn: Math.round(sectionClearIn * 10) / 10,
    balustersPerSection: n,
    evenGapIn: Math.round(evenGapIn * 100) / 100,
    totalBalusters: n * sections,
    totalPosts,
    guardHeightIn: 36,
    gapOk,
    warnings,
  };
}

export const DEFAULT_RAILING: RailingInputs = {
  railLengthFt: 40, postSpacingFt: 6, style: "wood2x2", maxGapIn: 3.5, postWidthIn: 3.5,
};
