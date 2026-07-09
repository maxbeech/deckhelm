// Side-elevation (section) of the deck, drawn to scale from the engine result.
// The free tool only shows a plan view; this section — grade line, frost-depth
// footing, post, beam, joist, guard and stair flight — is part of what the Pro
// permit packet adds. Pure SVG, no deps.
import { ftIn } from "@/lib/deck-tables";

export default function ElevationDiagram({
  heightFt, footingDepthIn, beamSize, joistSize, needsGuard, guardHeightIn, stairs,
}: {
  heightFt: number; footingDepthIn: number;
  beamSize: string; joistSize: string | null; needsGuard: boolean; guardHeightIn: number;
  stairs: { risers: number; treads: number; totalRunIn: number } | null;
}) {
  const W = 360, padL = 30, padR = 30, padTop = 26;
  const deckW = W - padL - padR;
  // Vertical world (ft): guard above surface + surface height + footing depth below.
  const guardFt = needsGuard ? guardHeightIn / 12 : 0;
  const belowFt = footingDepthIn / 12;
  const worldFt = Math.max(2, guardFt + Math.max(0.5, heightFt) + belowFt);
  const usableH = 190;
  const pxPerFt = usableH / worldFt;
  const H = padTop + usableH + 34;

  const grade = padTop + guardFt * pxPerFt + Math.max(0.5, heightFt) * pxPerFt;
  const surface = grade - Math.max(0.5, heightFt) * pxPerFt;
  const footBot = grade + belowFt * pxPerFt;
  const houseX = padL;
  const beamX = padL + deckW - 10; // beam/post near the outer edge
  const joistTop = surface;
  const joistBot = surface + 8;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label={`Deck side elevation: ${heightFt} ft above grade, ${footingDepthIn} inch footing depth`}>
      {/* Ground */}
      <rect x={0} y={grade} width={W} height={H - grade} fill="#f0e8d8" />
      <line x1={0} y1={grade} x2={W} y2={grade} stroke="#6b6053" strokeWidth={1.5} />
      <text x={4} y={grade - 4} fontSize="8" className="fill-ink-soft">GRADE</text>
      {/* House wall */}
      <line x1={houseX} y1={padTop} x2={houseX} y2={grade} stroke="#211b14" strokeWidth={4} />
      <text x={houseX - 4} y={padTop + 8} fontSize="8" textAnchor="end" className="fill-ink-soft">HOUSE</text>
      {/* Deck surface + joist band */}
      <rect x={houseX} y={joistTop} width={beamX - houseX + 6} height={joistBot - joistTop} fill="#b5410c" opacity={0.85} />
      <line x1={houseX} y1={surface} x2={beamX + 6} y2={surface} stroke="#211b14" strokeWidth={2} />
      {/* Ledger tag */}
      <text x={houseX + 4} y={surface - 3} fontSize="8" className="fill-ink-soft">ledger</text>
      {/* Beam at outer edge */}
      <rect x={beamX - 4} y={joistBot} width={9} height={9} fill="#211b14" />
      {/* Post down to footing */}
      <rect x={beamX - 3} y={joistBot + 9} width={6} height={grade - (joistBot + 9)} fill="#6b6053" />
      {/* Footing below frost line */}
      <rect x={beamX - 8} y={grade} width={16} height={footBot - grade} fill="none" stroke="#6b6053" strokeDasharray="3 2" />
      <line x1={beamX - 8} y1={footBot} x2={beamX + 8} y2={footBot} stroke="#6b6053" strokeWidth={1.5} />
      <text x={beamX + 12} y={(grade + footBot) / 2} fontSize="8" className="fill-ink-soft">{footingDepthIn}&Prime;</text>
      {/* Guard */}
      {needsGuard && (
        <>
          <line x1={houseX + 6} y1={surface} x2={houseX + 6} y2={surface - guardFt * pxPerFt} stroke="#211b14" strokeWidth={2} />
          <line x1={beamX} y1={surface} x2={beamX} y2={surface - guardFt * pxPerFt} stroke="#211b14" strokeWidth={2} />
          <line x1={houseX + 6} y1={surface - guardFt * pxPerFt} x2={beamX} y2={surface - guardFt * pxPerFt} stroke="#211b14" strokeWidth={2} />
          <text x={(houseX + beamX) / 2} y={surface - guardFt * pxPerFt - 3} fontSize="8" textAnchor="middle" className="fill-ink-soft">{guardHeightIn}&Prime; guard</text>
        </>
      )}
      {/* Stairs (schematic flight down from outer edge) */}
      {stairs && stairs.treads > 0 && (() => {
        const steps = Math.min(stairs.treads, 6);
        const runPx = Math.min(deckW * 0.28, 60);
        const risePx = grade - surface;
        const dx = runPx / steps, dy = risePx / steps;
        const pts: string[] = [`${beamX + 6},${surface}`];
        for (let i = 0; i < steps; i++) {
          const x = beamX + 6 + dx * i, y = surface + dy * i;
          pts.push(`${x},${y + dy}`, `${x + dx},${y + dy}`);
        }
        return <polyline points={pts.join(" ")} fill="none" stroke="#211b14" strokeWidth={1.5} />;
      })()}
      {/* Labels */}
      <text x={W / 2} y={H - 6} textAnchor="middle" fontSize="9" className="fill-ink-soft">
        {joistSize ?? "?"} joists · {beamSize.replace("-", " × ")} beam · {ftIn(heightFt * 12)} above grade
      </text>
    </svg>
  );
}
