// ═══════════════════════════════════════════════════════════════════════════
// src/components/PlanCanvas.jsx — v3
// SVG renderer — no north arrow, entrance indicator retained
// ═══════════════════════════════════════════════════════════════════════════
import { useRef } from "react";

const PAD = 58;

export default function PlanCanvas({ floorPlan, meta, scale = 12, face = "bottom", showDims = true }) {
  const svgRef = useRef(null);
  if (!floorPlan || !meta) return null;

  const { plotL, plotB, wallThickness } = meta;
  const { rooms, floorLabel } = floorPlan;

  const pxL  = plotL * scale;
  const pxB  = plotB * scale;
  const wt   = wallThickness * scale;
  const svgW = pxL + 2 * PAD;
  const svgH = pxB + 2 * PAD + 20;

  // Entrance arrow geometry per face side
  const entrance = {
    bottom: { line: { x1: PAD + pxL/2, y1: PAD + pxB + 2,  x2: PAD + pxL/2, y2: PAD + pxB + 16 }, tx: PAD + pxL/2, ty: PAD + pxB + 28, anchor: "middle" },
    top:    { line: { x1: PAD + pxL/2, y1: PAD - 2,         x2: PAD + pxL/2, y2: PAD - 16 },        tx: PAD + pxL/2, ty: PAD - 22, anchor: "middle" },
    left:   { line: { x1: PAD - 2,     y1: PAD + pxB/2,     x2: PAD - 16,    y2: PAD + pxB/2 },     tx: PAD - 20,    ty: PAD + pxB/2 - 7, anchor: "end" },
    right:  { line: { x1: PAD + pxL + 2, y1: PAD + pxB/2,   x2: PAD + pxL + 16, y2: PAD + pxB/2 }, tx: PAD + pxL + 20, ty: PAD + pxB/2 - 7, anchor: "start" },
  }[face] || {};

  function handleDownload() {
    const svg = svgRef.current;
    if (!svg) return;
    const blob = new Blob([svg.outerHTML], { type: "image/svg+xml" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `${floorLabel.toLowerCase().replace(/ /g, "-")}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="plan-canvas-wrapper">
      <div className="plan-canvas-toolbar">
        <span className="plan-canvas-floor-label">{floorLabel}</span>
        <span className="plan-canvas-scale-badge">1 ft = {scale} px</span>
        <button className="plan-download-btn" onClick={handleDownload}>↓ SVG</button>
      </div>

      <div className="plan-canvas-scroll">
        <svg
          ref={svgRef}
          width={svgW} height={svgH}
          viewBox={`0 0 ${svgW} ${svgH}`}
          xmlns="http://www.w3.org/2000/svg"
          fontFamily="'DM Sans', sans-serif"
          style={{ display: "block", background: "#fff" }}
        >
          {/* Grid pattern */}
          <defs>
            <pattern id={`g${floorPlan.floorIndex}`} width={scale} height={scale}
                     patternUnits="userSpaceOnUse" x={PAD} y={PAD}>
              <path d={`M${scale} 0L0 0 0 ${scale}`} fill="none" stroke="#e2e8f0" strokeWidth="0.4"/>
            </pattern>
            <marker id={`ea${floorPlan.floorIndex}`} markerWidth="8" markerHeight="8"
                    refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#FF8C00"/>
            </marker>
          </defs>

          {/* Grid fill */}
          <rect x={PAD} y={PAD} width={pxL} height={pxB}
                fill={`url(#g${floorPlan.floorIndex})`} />

          {/* Outer wall */}
          <rect x={PAD} y={PAD} width={pxL} height={pxB}
                fill="none" stroke="#003366" strokeWidth={4} />

          {/* Inner wall dashed */}
          <rect x={PAD + wt} y={PAD + wt} width={pxL - 2*wt} height={pxB - 2*wt}
                fill="none" stroke="#003366" strokeWidth={0.8}
                strokeDasharray="4 3" opacity={0.3} />

          {/* Rooms */}
          {rooms.map((room) => {
            const rx = PAD + room.x * scale;
            const ry = PAD + room.y * scale;
            const rw = room.w * scale;
            const rh = room.h * scale;
            const cx = rx + rw / 2;
            const cy = ry + rh / 2;
            const parts    = room.label.split(" / ");
            const line1    = parts[0];
            const line2    = parts[1] || null;
            const fontSize = Math.min(11, rw / 7.5, rh / 4.5);
            const smallFs  = Math.min(9, rw / 10, rh / 6);

            return (
              <g key={room.id}>
                <rect x={rx} y={ry} width={rw} height={rh}
                      fill={room.fill} stroke={room.stroke} strokeWidth={1.5}/>
                {rw > 26 && rh > 20 && (
                  <>
                    <text x={cx} y={cy + (line2 ? -10 : -4)}
                          textAnchor="middle" fontSize={fontSize}
                          fontWeight="600" fill={room.stroke}
                          style={{ userSelect: "none" }}>
                      {line1}
                    </text>
                    {line2 && (
                      <text x={cx} y={cy + 5}
                            textAnchor="middle"
                            fontSize={Math.min(10, rw/9, rh/5.5)}
                            fontWeight="600" fill={room.stroke}
                            style={{ userSelect: "none" }}>
                        {line2}
                      </text>
                    )}
                    <text x={cx} y={cy + (line2 ? 18 : 9)}
                          textAnchor="middle" fontSize={smallFs}
                          fill="#64748b" style={{ userSelect: "none" }}>
                      {room.w.toFixed(1)}ft × {room.h.toFixed(1)}ft
                    </text>
                  </>
                )}
              </g>
            );
          })}

          {/* Entrance arrow */}
          {entrance.line && (
            <g>
              <line {...entrance.line}
                    stroke="#FF8C00" strokeWidth="2.5"
                    markerEnd={`url(#ea${floorPlan.floorIndex})`}/>
              <text x={entrance.tx} y={entrance.ty}
                    textAnchor={entrance.anchor}
                    fontSize="8.5" fontWeight="700" fill="#FF8C00">
                ENTRANCE
              </text>
            </g>
          )}

          {/* Dimension annotations */}
          {showDims && (
            <>
              {/* Horizontal (top) */}
              <line x1={PAD} y1={PAD-16} x2={PAD+pxL} y2={PAD-16}
                    stroke="#003366" strokeWidth="1"/>
              <line x1={PAD} y1={PAD-20} x2={PAD} y2={PAD-12}
                    stroke="#003366" strokeWidth="1"/>
              <line x1={PAD+pxL} y1={PAD-20} x2={PAD+pxL} y2={PAD-12}
                    stroke="#003366" strokeWidth="1"/>
              <text x={PAD+pxL/2} y={PAD-20}
                    textAnchor="middle" fontSize="11" fontWeight="700" fill="#003366">
                {plotL} ft
              </text>
              {/* Vertical (left) */}
              <line x1={PAD-16} y1={PAD} x2={PAD-16} y2={PAD+pxB}
                    stroke="#003366" strokeWidth="1"/>
              <line x1={PAD-20} y1={PAD} x2={PAD-12} y2={PAD}
                    stroke="#003366" strokeWidth="1"/>
              <line x1={PAD-20} y1={PAD+pxB} x2={PAD-12} y2={PAD+pxB}
                    stroke="#003366" strokeWidth="1"/>
              <text x={PAD-24} y={PAD+pxB/2}
                    textAnchor="middle" fontSize="11" fontWeight="700" fill="#003366"
                    transform={`rotate(-90,${PAD-24},${PAD+pxB/2})`}>
                {plotB} ft
              </text>
            </>
          )}

          {/* Floor label bottom */}
          <text x={PAD + pxL/2} y={svgH - 5}
                textAnchor="middle" fontSize="10" fill="#94a3b8">
            {floorLabel} · {plotL}ft × {plotB}ft · Wall {Math.round(wallThickness * 12)}"
          </text>
        </svg>
      </div>
    </div>
  );
}