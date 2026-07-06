// Static, SEO-friendly span tables rendered straight from the IRC data in
// deck-tables.ts (single source of truth: same numbers the calculator uses).
// Targets "joist span table" / "beam span table" searches and gives the full
// reference, not just one answer.
import {
  BEAM_SIZES, BEAM_SPAN, JOIST_SIZES, JOIST_SPAN, JOIST_SPAN_COLS, SPACINGS,
  SPECIES_LABEL, ftIn, type Species,
} from "@/lib/deck-tables";

const cell = "border border-line px-2 py-1 text-center tabular-nums";
const head = "border border-line bg-paper-dim px-2 py-1 text-center font-semibold";

export function JoistSpanTable({ species }: { species: Species }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <caption className="mb-2 text-left text-xs text-ink-soft">
          IRC Table R507.6: max deck joist span, {SPECIES_LABEL[species]} No. 2, 40 psf live + 10 psf dead.
        </caption>
        <thead>
          <tr>
            <th className={head}>Joist</th>
            {SPACINGS.map((s) => <th key={s} className={head}>{s}" o.c.</th>)}
          </tr>
        </thead>
        <tbody>
          {JOIST_SIZES.map((size) => (
            <tr key={size}>
              <td className={`${cell} font-medium`}>{size}</td>
              {JOIST_SPAN[species][size].map((v, i) => <td key={i} className={cell}>{ftIn(v)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function BeamSpanTable({ species }: { species: Species }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <caption className="mb-2 text-left text-xs text-ink-soft">
          IRC Table R507.5: max deck beam span between posts, {SPECIES_LABEL[species]}, by supported joist span (ft).
        </caption>
        <thead>
          <tr>
            <th className={head}>Beam</th>
            {JOIST_SPAN_COLS.map((c) => <th key={c} className={head}>{c}′</th>)}
          </tr>
        </thead>
        <tbody>
          {BEAM_SIZES.map((b) => (
            <tr key={b}>
              <td className={`${cell} font-medium`}>{b.replace("-", "×")}</td>
              {BEAM_SPAN[species][b].map((v, i) => <td key={i} className={cell}>{ftIn(v)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
