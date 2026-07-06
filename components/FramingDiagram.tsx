// Top-down plan-view of the deck framing, drawn to scale from the engine result.
// Pure SVG (no deps): shows ledger, joists, beam, posts/footings and dimensions
// so the numbers turn into a picture a builder can actually read.
import { ftIn } from "@/lib/deck-tables";

export default function FramingDiagram({
  width, projection, joistCount, postCount, joistSize, beamSize, postSpacingIn, valid,
}: {
  width: number; projection: number; joistCount: number; postCount: number;
  joistSize: string | null; beamSize: string; postSpacingIn: number; valid: boolean;
}) {
  // Layout: 360-wide canvas, deck height scaled to projection (keep aspect sane).
  const W = 360, padX = 30, padTop = 26, padBot = 34;
  const deckW = W - padX * 2;
  const aspect = Math.min(1.1, Math.max(0.5, projection / width));
  const deckH = Math.round(deckW * aspect);
  const H = deckH + padTop + padBot;
  const left = padX, right = padX + deckW, top = padTop, bot = padTop + deckH;
  const beamY = bot - 10;

  // Joists: draw up to 28 evenly (representative when there are many).
  const drawN = Math.min(joistCount, 28);
  const joists = Array.from({ length: drawN }, (_, i) => left + (deckW * i) / (drawN - 1 || 1));
  // Posts along the beam.
  const posts = Array.from({ length: Math.max(2, postCount) }, (_, i) =>
    left + (deckW * i) / (Math.max(2, postCount) - 1));

  const ink = valid ? "#b5410c" : "#be123c"; // rust ok / rose invalid

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label={`Deck framing plan: ${width} ft wide by ${projection} ft projection, ${joistCount} joists, ${postCount} posts`}>
      <rect x={left} y={top} width={deckW} height={deckH} fill="#f9e6d8" stroke="#ddd0b8" />
      {/* House wall + ledger */}
      <text x={W / 2} y={12} textAnchor="middle" className="fill-ink-soft" fontSize="10">HOUSE</text>
      <line x1={left} y1={top} x2={right} y2={top} stroke="#6b6053" strokeWidth={4} />
      {/* Joists */}
      {joists.map((x, i) => (
        <line key={i} x1={x} y1={top} x2={x} y2={beamY} stroke={ink} strokeWidth={1} opacity={0.55} />
      ))}
      {/* Beam */}
      <line x1={left} y1={beamY} x2={right} y2={beamY} stroke="#211b14" strokeWidth={4} />
      {/* Posts / footings */}
      {posts.map((x, i) => (
        <g key={i}>
          <circle cx={x} cy={beamY} r={4.5} fill="#211b14" />
          <circle cx={x} cy={beamY} r={8} fill="none" stroke="#6b6053" strokeDasharray="2 2" />
        </g>
      ))}
      {/* Dimensions */}
      <text x={W / 2} y={top - 6} textAnchor="middle" className="fill-ink-soft" fontSize="9">
        ← {width} ft wide ({joistCount} × {joistSize ?? "?"} joists) →
      </text>
      <text x={W / 2} y={H - 6} textAnchor="middle" className="fill-ink-soft" fontSize="9">
        beam: {beamSize.replace("-", " × ")} · {postCount} posts @ {ftIn(postSpacingIn)} o.c.
      </text>
      <text x={right + 2} y={(top + beamY) / 2} className="fill-ink-soft" fontSize="9"
        transform={`rotate(90 ${right + 2} ${(top + beamY) / 2})`} textAnchor="middle">
        {projection} ft projection
      </text>
    </svg>
  );
}
