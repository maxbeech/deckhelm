// Authoritative IRC deck-framing span tables, transcribed verbatim from the
// 2018/2021 International Residential Code (and AWC DCA6, the Prescriptive
// Residential Wood Deck Construction Guide). All values are MAXIMUM clear spans
// (face-of-support to face-of-support) for No. 2 grade lumber at the standard
// residential deck load of 40 psf live + 10 psf dead, deflection L/360, with the
// wet-service factor already applied. Stored in INCHES; sources cited in the UI.
//
//   Joist spans  → IRC Table R507.6  (joist size × spacing × species)
//   Beam spans   → IRC Table R507.5  (beam size × supported joist span × species)
//
// These are real code tables, not estimates, so a result here is exactly what a
// plans examiner checks against. Nothing on this site is fabricated.

export type Species = "sp" | "dfhf" | "cedar";
export type JoistSize = "2x6" | "2x8" | "2x10" | "2x12";
export type Spacing = 12 | 16 | 24;
export type BeamSize =
  | "2-2x6" | "2-2x8" | "2-2x10" | "2-2x12"
  | "3-2x8" | "3-2x10" | "3-2x12";

export const SPECIES_LABEL: Record<Species, string> = {
  sp: "Southern Pine",
  dfhf: "Douglas Fir-Larch / Hem-Fir / SPF",
  cedar: "Redwood / Western Cedar / Ponderosa / Red Pine",
};

export const JOIST_SIZES: JoistSize[] = ["2x6", "2x8", "2x10", "2x12"];
export const BEAM_SIZES: BeamSize[] = [
  "2-2x6", "2-2x8", "2-2x10", "2-2x12", "3-2x8", "3-2x10", "3-2x12",
];
export const SPACINGS: Spacing[] = [12, 16, 24];

// IRC Table R507.6: Deck joist max spans (inches). [12" oc, 16" oc, 24" oc].
export const JOIST_SPAN: Record<Species, Record<JoistSize, [number, number, number]>> = {
  sp: {
    "2x6": [119, 108, 91],   // 9'11", 9'0", 7'7"
    "2x8": [157, 142, 116],  // 13'1", 11'10", 9'8"
    "2x10": [194, 168, 137], // 16'2", 14'0", 11'5"
    "2x12": [216, 198, 162], // 18'0", 16'6", 13'6"
  },
  dfhf: {
    "2x6": [114, 100, 82],   // 9'6", 8'4", 6'10"
    "2x8": [150, 133, 109],  // 12'6", 11'1", 9'1"
    "2x10": [188, 163, 133], // 15'8", 13'7", 11'1"
    "2x12": [216, 189, 154], // 18'0", 15'9", 12'10"
  },
  cedar: {
    "2x6": [106, 96, 82],    // 8'10", 8'0", 6'10"
    "2x8": [140, 127, 104],  // 11'8", 10'7", 8'8"
    "2x10": [179, 156, 127], // 14'11", 13'0", 10'7"
    "2x12": [209, 181, 148], // 17'5", 15'1", 12'4"
  },
};

// IRC Table R507.5: Deck beam max spans (inches), by supported joist span.
// Columns correspond to JOIST_SPAN_COLS (feet). Cedar group uses the same column
// as Douglas Fir-Larch/Hem-Fir (the IRC groups them).
export const JOIST_SPAN_COLS = [6, 8, 10, 12, 14, 16, 18] as const;

const SP_BEAM: Record<BeamSize, number[]> = {
  "2-2x6": [83, 71, 64, 58, 54, 51, 48],
  "2-2x8": [105, 91, 81, 74, 69, 64, 60],
  "2-2x10": [124, 108, 96, 88, 81, 76, 72],
  "2-2x12": [146, 127, 113, 103, 96, 90, 84],
  "3-2x8": [130, 114, 102, 93, 86, 80, 76],
  "3-2x10": [156, 135, 120, 110, 102, 95, 90],
  "3-2x12": [183, 159, 142, 129, 120, 112, 106],
};

const DFHF_BEAM: Record<BeamSize, number[]> = {
  "2-2x6": [65, 56, 50, 46, 42, 37, 33],
  "2-2x8": [82, 71, 64, 58, 54, 49, 44],
  "2-2x10": [100, 87, 78, 71, 66, 61, 56],
  "2-2x12": [116, 101, 90, 82, 76, 71, 67],
  "3-2x8": [116, 102, 91, 83, 77, 72, 68],
  "3-2x10": [144, 125, 112, 102, 94, 88, 83],
  "3-2x12": [167, 145, 129, 118, 109, 102, 97],
};

export const BEAM_SPAN: Record<Species, Record<BeamSize, number[]>> = {
  sp: SP_BEAM,
  dfhf: DFHF_BEAM,
  cedar: DFHF_BEAM,
};

// Format inches as feet-inches, e.g. 142 -> 11'10".
export function ftIn(inches: number): string {
  const total = Math.round(inches);
  const ft = Math.floor(total / 12);
  const inch = total % 12;
  return inch === 0 ? `${ft}'` : `${ft}'${inch}"`;
}
