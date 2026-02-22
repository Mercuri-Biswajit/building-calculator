// ═══════════════════════════════════════════════════════════════════════════
// PlanCanvas.jsx — v7
// Proper architectural SVG:
//   ✓ Double-line filled walls with SVG clipPath (rooms can't overflow)
//   ✓ Door openings cut into wall lines (gap + arc)
//   ✓ Window openings on exterior walls
//   ✓ Furniture symbols per room type
//   ✓ Per-room dimension labels
//   ✓ Print-ready PDF export
// ═══════════════════════════════════════════════════════════════════════════
import { useRef } from "react";

const PAD = 72; // outer padding for dim lines
const WALL_FILL = "#b0bec5";
const WALL_STROKE = "#1a2f4a";

// ─── Scale helpers ─────────────────────────────────────────────────────────
// All room coords are in FEET from plot origin.
// px(ft) converts to SVG pixels.

// ─── Double-line architectural walls ───────────────────────────────────────
// Strategy: draw outer rect filled, then interior rect filled white,
// giving a filled wall band. Rooms are drawn INSIDE the interior rect.
function WallSystem({ px, py, pxL, pxB, wt, scale }) {
  const outerX = px,
    outerY = py;
  const innerX = px + wt * scale;
  const innerY = py + wt * scale;
  const innerW = pxL - 2 * wt * scale;
  const innerH = pxB - 2 * wt * scale;

  return (
    <g>
      {/* Outer filled rect (wall color) */}
      <rect
        x={outerX}
        y={outerY}
        width={pxL}
        height={pxB}
        fill={WALL_FILL}
        stroke={WALL_STROKE}
        strokeWidth={2.5}
      />
      {/* Interior white fill — rooms go on top of this */}
      <rect
        x={innerX}
        y={innerY}
        width={innerW}
        height={innerH}
        fill="#f9fafb"
        stroke="none"
      />
      {/* Inner wall line */}
      <rect
        x={innerX}
        y={innerY}
        width={innerW}
        height={innerH}
        fill="none"
        stroke={WALL_STROKE}
        strokeWidth={1}
      />
    </g>
  );
}

// ─── Door symbol ───────────────────────────────────────────────────────────
// Architectural convention: a thick line (door panel) + quarter-circle arc (swing)
// The door gap is cut into the room border by leaving a gap in the room rect stroke.
// wall: "top"|"bottom"|"left"|"right"
function DoorSymbol({ rx, ry, rw, rh, wall, scale }) {
  const doorFt = 2.8; // standard door width in feet
  const dw = Math.min(doorFt * scale, rw * 0.45, rh * 0.45);

  switch (wall) {
    case "bottom": {
      const x0 = rx + rw / 2 - dw / 2;
      const y0 = ry + rh;
      return (
        <g opacity="0.9">
          {/* Gap in wall line at door position is implied by drawing above it */}
          <line
            x1={x0}
            y1={y0}
            x2={x0 + dw}
            y2={y0}
            stroke="#1a2f4a"
            strokeWidth="2.2"
          />
          <path
            d={`M${x0} ${y0} a${dw} ${dw} 0 0 0 ${dw} ${-dw}`}
            fill="none"
            stroke="#475569"
            strokeWidth="1"
            strokeDasharray="3 2"
          />
          <line
            x1={x0 + dw}
            y1={y0}
            x2={x0 + dw}
            y2={y0 - dw}
            stroke="#475569"
            strokeWidth="1.2"
          />
        </g>
      );
    }
    case "top": {
      const x0 = rx + rw / 2 - dw / 2;
      const y0 = ry;
      return (
        <g opacity="0.9">
          <line
            x1={x0}
            y1={y0}
            x2={x0 + dw}
            y2={y0}
            stroke="#1a2f4a"
            strokeWidth="2.2"
          />
          <path
            d={`M${x0} ${y0} a${dw} ${dw} 0 0 1 ${dw} ${dw}`}
            fill="none"
            stroke="#475569"
            strokeWidth="1"
            strokeDasharray="3 2"
          />
          <line
            x1={x0 + dw}
            y1={y0}
            x2={x0 + dw}
            y2={y0 + dw}
            stroke="#475569"
            strokeWidth="1.2"
          />
        </g>
      );
    }
    case "right": {
      const x0 = rx + rw;
      const y0 = ry + rh / 2 - dw / 2;
      return (
        <g opacity="0.9">
          <line
            x1={x0}
            y1={y0}
            x2={x0}
            y2={y0 + dw}
            stroke="#1a2f4a"
            strokeWidth="2.2"
          />
          <path
            d={`M${x0} ${y0} a${dw} ${dw} 0 0 1 ${-dw} ${dw}`}
            fill="none"
            stroke="#475569"
            strokeWidth="1"
            strokeDasharray="3 2"
          />
          <line
            x1={x0}
            y1={y0 + dw}
            x2={x0 - dw}
            y2={y0 + dw}
            stroke="#475569"
            strokeWidth="1.2"
          />
        </g>
      );
    }
    case "left":
    default: {
      const x0 = rx;
      const y0 = ry + rh / 2 - dw / 2;
      return (
        <g opacity="0.9">
          <line
            x1={x0}
            y1={y0}
            x2={x0}
            y2={y0 + dw}
            stroke="#1a2f4a"
            strokeWidth="2.2"
          />
          <path
            d={`M${x0} ${y0} a${dw} ${dw} 0 0 0 ${dw} ${dw}`}
            fill="none"
            stroke="#475569"
            strokeWidth="1"
            strokeDasharray="3 2"
          />
          <line
            x1={x0}
            y1={y0 + dw}
            x2={x0 + dw}
            y2={y0 + dw}
            stroke="#475569"
            strokeWidth="1.2"
          />
        </g>
      );
    }
  }
}

// ─── Window symbol ─────────────────────────────────────────────────────────
// Standard: three parallel lines spanning a portion of wall
function WindowSymbol({ rx, ry, rw, rh, wall }) {
  const ww = Math.min(rw * 0.42, 36);
  const wh = Math.min(rh * 0.42, 36);
  const t = 5; // glass thickness px

  switch (wall) {
    case "top": {
      const x0 = rx + rw / 2 - ww / 2,
        y = ry;
      return (
        <g opacity="0.85">
          <rect
            x={x0}
            y={y - 1}
            width={ww}
            height={t + 2}
            fill="#BAE6FD"
            stroke="#0369A1"
            strokeWidth="0.8"
          />
          <line
            x1={x0 + ww * 0.3}
            y1={y - 1}
            x2={x0 + ww * 0.3}
            y2={y + t + 1}
            stroke="#0369A1"
            strokeWidth="0.7"
          />
          <line
            x1={x0 + ww * 0.7}
            y1={y - 1}
            x2={x0 + ww * 0.7}
            y2={y + t + 1}
            stroke="#0369A1"
            strokeWidth="0.7"
          />
        </g>
      );
    }
    case "bottom": {
      const x0 = rx + rw / 2 - ww / 2,
        y = ry + rh - t - 1;
      return (
        <g opacity="0.85">
          <rect
            x={x0}
            y={y}
            width={ww}
            height={t + 2}
            fill="#BAE6FD"
            stroke="#0369A1"
            strokeWidth="0.8"
          />
          <line
            x1={x0 + ww * 0.3}
            y1={y}
            x2={x0 + ww * 0.3}
            y2={y + t + 2}
            stroke="#0369A1"
            strokeWidth="0.7"
          />
          <line
            x1={x0 + ww * 0.7}
            y1={y}
            x2={x0 + ww * 0.7}
            y2={y + t + 2}
            stroke="#0369A1"
            strokeWidth="0.7"
          />
        </g>
      );
    }
    case "right": {
      const x = rx + rw - t - 1,
        y0 = ry + rh / 2 - wh / 2;
      return (
        <g opacity="0.85">
          <rect
            x={x}
            y={y0}
            width={t + 2}
            height={wh}
            fill="#BAE6FD"
            stroke="#0369A1"
            strokeWidth="0.8"
          />
          <line
            x1={x}
            y1={y0 + wh * 0.3}
            x2={x + t + 2}
            y2={y0 + wh * 0.3}
            stroke="#0369A1"
            strokeWidth="0.7"
          />
          <line
            x1={x}
            y1={y0 + wh * 0.7}
            x2={x + t + 2}
            y2={y0 + wh * 0.7}
            stroke="#0369A1"
            strokeWidth="0.7"
          />
        </g>
      );
    }
    case "left":
    default: {
      const x = rx - 1,
        y0 = ry + rh / 2 - wh / 2;
      return (
        <g opacity="0.85">
          <rect
            x={x}
            y={y0}
            width={t + 2}
            height={wh}
            fill="#BAE6FD"
            stroke="#0369A1"
            strokeWidth="0.8"
          />
          <line
            x1={x}
            y1={y0 + wh * 0.3}
            x2={x + t + 2}
            y2={y0 + wh * 0.3}
            stroke="#0369A1"
            strokeWidth="0.7"
          />
          <line
            x1={x}
            y1={y0 + wh * 0.7}
            x2={x + t + 2}
            y2={y0 + wh * 0.7}
            stroke="#0369A1"
            strokeWidth="0.7"
          />
        </g>
      );
    }
  }
}

// ─── Determine which walls get windows (exterior walls) ────────────────────
// A room is on an exterior wall if its edge is at the plot boundary (wt)
function getExteriorWalls(room, plotL, plotB, wt) {
  const walls = [];
  if (Math.abs(room.x - wt) < 0.1) walls.push("left");
  if (Math.abs(room.y - wt) < 0.1) walls.push("top");
  if (Math.abs(room.x + room.w - (plotL - wt)) < 0.1) walls.push("right");
  if (Math.abs(room.y + room.h - (plotB - wt)) < 0.1) walls.push("bottom");
  return walls;
}

const WINDOW_ROOMS = new Set([
  "master_bed",
  "bed2",
  "bed3",
  "bed4",
  "hall",
  "dining",
  "study",
  "kitchen",
  "pooja",
]);

// ─── Furniture symbols ─────────────────────────────────────────────────────
function Furniture({ baseId, rx, ry, rw, rh }) {
  const cx = rx + rw / 2,
    cy = ry + rh / 2;
  const op = 0.35;

  if (baseId === "master_bed") {
    const bw = Math.min(rw * 0.58, rh * 0.72),
      bh = Math.min(rh * 0.58, rw * 0.72);
    const bx = cx - bw / 2,
      by = cy - bh / 2;
    return (
      <g opacity={op}>
        <rect
          x={bx}
          y={by}
          width={bw}
          height={bh}
          rx={3}
          fill="#93C5FD"
          stroke="#2563EB"
          strokeWidth="0.8"
        />
        <rect
          x={bx}
          y={by}
          width={bw}
          height={bh * 0.28}
          rx={2}
          fill="#BFDBFE"
          stroke="#2563EB"
          strokeWidth="0.5"
        />
        <line
          x1={cx}
          y1={by + bh * 0.28}
          x2={cx}
          y2={by + bh}
          stroke="#2563EB"
          strokeWidth="0.5"
        />
        <ellipse
          cx={cx - bw * 0.18}
          cy={by + bh * 0.14}
          rx={bw * 0.1}
          ry={bh * 0.09}
          fill="#DBEAFE"
        />
        <ellipse
          cx={cx + bw * 0.18}
          cy={by + bh * 0.14}
          rx={bw * 0.1}
          ry={bh * 0.09}
          fill="#DBEAFE"
        />
      </g>
    );
  }
  if (baseId === "bed2" || baseId === "bed3" || baseId === "bed4") {
    const bw = Math.min(rw * 0.45, 38),
      bh = Math.min(rh * 0.55, 50);
    const bx = cx - bw / 2,
      by = cy - bh / 2;
    const fc =
      baseId === "bed2" ? "#86EFAC" : baseId === "bed3" ? "#FDE68A" : "#F9A8D4";
    const sc =
      baseId === "bed2" ? "#16A34A" : baseId === "bed3" ? "#CA8A04" : "#DB2777";
    return (
      <g opacity={op}>
        <rect
          x={bx}
          y={by}
          width={bw}
          height={bh}
          rx={2}
          fill={fc}
          stroke={sc}
          strokeWidth="0.8"
        />
        <rect
          x={bx}
          y={by}
          width={bw}
          height={bh * 0.26}
          rx={2}
          fill="white"
          stroke={sc}
          strokeWidth="0.5"
          opacity="0.7"
        />
      </g>
    );
  }
  if (baseId === "hall") {
    const sw = Math.min(rw * 0.6, 56),
      sh = Math.min(rh * 0.32, 24);
    const sx = cx - sw / 2,
      sy = cy - sh / 2;
    return (
      <g opacity={op}>
        <rect
          x={sx}
          y={sy + sh * 0.28}
          width={sw}
          height={sh * 0.72}
          rx={3}
          fill="#C4B5FD"
          stroke="#7C3AED"
          strokeWidth="0.8"
        />
        <rect
          x={sx}
          y={sy}
          width={sw * 0.22}
          height={sh * 0.85}
          rx={2}
          fill="#A78BFA"
          stroke="#7C3AED"
          strokeWidth="0.6"
        />
        <rect
          x={sx + sw * 0.78}
          y={sy}
          width={sw * 0.22}
          height={sh * 0.85}
          rx={2}
          fill="#A78BFA"
          stroke="#7C3AED"
          strokeWidth="0.6"
        />
        <rect
          x={sx + sw * 0.24}
          y={sy}
          width={sw * 0.52}
          height={sh * 0.38}
          rx={2}
          fill="#DDD6FE"
          stroke="#7C3AED"
          strokeWidth="0.5"
        />
      </g>
    );
  }
  if (baseId === "dining") {
    const tw = Math.min(rw * 0.55, 50),
      th = Math.min(rh * 0.45, 36);
    const tx = cx - tw / 2,
      ty = cy - th / 2;
    const cs = Math.min(tw * 0.17, 8);
    return (
      <g opacity={op}>
        <rect
          x={tx}
          y={ty}
          width={tw}
          height={th}
          rx={3}
          fill="#E9D5FF"
          stroke="#9333EA"
          strokeWidth="0.8"
        />
        {[0.25, 0.5, 0.75].map((t, i) => (
          <g key={i}>
            <rect
              x={tx + tw * t - cs / 2}
              y={ty - cs - 1}
              width={cs}
              height={cs}
              rx={1}
              fill="#F3E8FF"
              stroke="#9333EA"
              strokeWidth="0.5"
            />
            <rect
              x={tx + tw * t - cs / 2}
              y={ty + th + 1}
              width={cs}
              height={cs}
              rx={1}
              fill="#F3E8FF"
              stroke="#9333EA"
              strokeWidth="0.5"
            />
          </g>
        ))}
      </g>
    );
  }
  if (baseId === "kitchen") {
    const cw = Math.min(rw * 0.72, 60),
      ch = Math.min(rh * 0.22, 12);
    const cx2 = cx - cw / 2,
      cy2 = cy + rh * 0.12;
    return (
      <g opacity={op}>
        <rect
          x={cx2}
          y={cy2}
          width={cw}
          height={ch}
          rx={1}
          fill="#FED7AA"
          stroke="#EA580C"
          strokeWidth="0.8"
        />
        <circle
          cx={cx2 + cw * 0.18}
          cy={cy2 + ch / 2}
          r={ch * 0.32}
          fill="none"
          stroke="#EA580C"
          strokeWidth="0.8"
        />
        <circle
          cx={cx2 + cw * 0.38}
          cy={cy2 + ch / 2}
          r={ch * 0.32}
          fill="none"
          stroke="#EA580C"
          strokeWidth="0.8"
        />
        <rect
          x={cx2 + cw * 0.6}
          y={cy2 + ch * 0.2}
          width={cw * 0.32}
          height={ch * 0.6}
          rx={1}
          fill="#FFF7ED"
          stroke="#EA580C"
          strokeWidth="0.5"
        />
      </g>
    );
  }
  if (baseId === "wc" || baseId === "wc2") {
    const tw = Math.min(rw * 0.38, 18),
      th = Math.min(rh * 0.48, 22);
    return (
      <g opacity={0.45}>
        <ellipse
          cx={cx}
          cy={cy + rh * 0.1}
          rx={tw * 0.5}
          ry={th * 0.55}
          fill="#BAE6FD"
          stroke="#0284C7"
          strokeWidth="0.8"
        />
        <rect
          x={cx - tw * 0.38}
          y={cy - rh * 0.18}
          width={tw * 0.76}
          height={th * 0.28}
          rx={2}
          fill="#E0F2FE"
          stroke="#0284C7"
          strokeWidth="0.6"
        />
      </g>
    );
  }
  if (baseId === "study") {
    const dw = Math.min(rw * 0.58, 50),
      dh = Math.min(rh * 0.3, 20);
    return (
      <g opacity={op}>
        <rect
          x={cx - dw / 2}
          y={cy - dh / 2}
          width={dw}
          height={dh}
          rx={1}
          fill="#BBF7D0"
          stroke="#15803D"
          strokeWidth="0.8"
        />
        <rect
          x={cx + dw * 0.1}
          y={cy - dh / 2 + dh * 0.2}
          width={dw * 0.32}
          height={dh * 0.6}
          rx={1}
          fill="#DCFCE7"
          stroke="#15803D"
          strokeWidth="0.5"
        />
      </g>
    );
  }
  if (baseId === "pooja") {
    const pw = Math.min(rw * 0.42, 28),
      ph = Math.min(rh * 0.42, 24);
    return (
      <g opacity={op}>
        <rect
          x={cx - pw / 2}
          y={cy - ph / 2}
          width={pw}
          height={ph}
          rx={2}
          fill="#FECACA"
          stroke="#DC2626"
          strokeWidth="0.8"
        />
        <polygon
          points={`${cx},${cy - ph / 2 - 4} ${cx - pw * 0.45},${cy - ph / 2} ${cx + pw * 0.45},${cy - ph / 2}`}
          fill="#FCA5A5"
          stroke="#DC2626"
          strokeWidth="0.6"
        />
      </g>
    );
  }
  if (baseId === "garage") {
    const gw = Math.min(rw * 0.6, 52),
      gh = Math.min(rh * 0.5, 38);
    return (
      <g opacity={op}>
        <rect
          x={cx - gw / 2}
          y={cy - gh / 2 + gh * 0.15}
          width={gw}
          height={gh * 0.65}
          rx={4}
          fill="#FED7AA"
          stroke="#C2410C"
          strokeWidth="0.8"
        />
        <rect
          x={cx - gw * 0.38}
          y={cy - gh / 2}
          width={gw * 0.76}
          height={gh * 0.32}
          rx={3}
          fill="#FFF7ED"
          stroke="#C2410C"
          strokeWidth="0.6"
        />
        <circle
          cx={cx - gw * 0.28}
          cy={cy + gh * 0.32}
          r={gh * 0.12}
          fill="#78716C"
          stroke="#C2410C"
          strokeWidth="0.5"
        />
        <circle
          cx={cx + gw * 0.28}
          cy={cy + gh * 0.32}
          r={gh * 0.12}
          fill="#78716C"
          stroke="#C2410C"
          strokeWidth="0.5"
        />
      </g>
    );
  }
  if (baseId === "staircase") {
    // Step lines
    const steps = Math.max(3, Math.floor(rh / 8));
    return (
      <g opacity={0.5}>
        {Array.from({ length: steps }, (_, i) => (
          <line
            key={i}
            x1={rx + 2}
            y1={ry + (i / steps) * rh}
            x2={rx + rw - 2}
            y2={ry + (i / steps) * rh}
            stroke="#D97706"
            strokeWidth="0.8"
          />
        ))}
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fontSize="7"
          fill="#92400E"
          fontWeight="600"
        >
          ↑↑
        </text>
      </g>
    );
  }
  return null;
}

// ─── Setback Lines ─────────────────────────────────────────────────────────
function SetbackLines({ setbacks, px, py, pxL, pxB, scale, plotL, plotB }) {
  if (!setbacks) return null;
  const { front = 0, rear = 0, left: leftSb = 0, right: rightSb = 0 } = setbacks;
  const lines = [];
  const dash = "6 4";
  const color = "#E11D48"; // rose-600
  const opacity = 0.7;
  const labelStyle = { fontSize: "7.5", fill: color, fontWeight: "600" };

  // front = bottom edge setback (y from bottom)
  if (front > 0) {
    const y = py + pxB - front * scale;
    lines.push(
      <g key="sb-front" opacity={opacity}>
        <line x1={px} y1={y} x2={px + pxL} y2={y}
          stroke={color} strokeWidth="1.2" strokeDasharray={dash} />
        <text x={px + 4} y={y - 3} {...labelStyle}>Setback {front}ft (Front)</text>
      </g>
    );
  }
  // rear = top edge setback (y from top)
  if (rear > 0) {
    const y = py + rear * scale;
    lines.push(
      <g key="sb-rear" opacity={opacity}>
        <line x1={px} y1={y} x2={px + pxL} y2={y}
          stroke={color} strokeWidth="1.2" strokeDasharray={dash} />
        <text x={px + 4} y={y + 9} {...labelStyle}>Setback {rear}ft (Rear)</text>
      </g>
    );
  }
  // left setback
  if (leftSb > 0) {
    const x = px + leftSb * scale;
    lines.push(
      <g key="sb-left" opacity={opacity}>
        <line x1={x} y1={py} x2={x} y2={py + pxB}
          stroke={color} strokeWidth="1.2" strokeDasharray={dash} />
        <text x={x + 3} y={py + 10} {...labelStyle}
          transform={`rotate(-90,${x + 3},${py + 10})`}>
          {leftSb}ft
        </text>
      </g>
    );
  }
  // right setback
  if (rightSb > 0) {
    const x = px + pxL - rightSb * scale;
    lines.push(
      <g key="sb-right" opacity={opacity}>
        <line x1={x} y1={py} x2={x} y2={py + pxB}
          stroke={color} strokeWidth="1.2" strokeDasharray={dash} />
        <text x={x - 3} y={py + 10} textAnchor="end" {...labelStyle}
          transform={`rotate(-90,${x - 3},${py + 10})`}>
          {rightSb}ft
        </text>
      </g>
    );
  }
  return <g>{lines}</g>;
}

// ─── Main canvas component ─────────────────────────────────────────────────
export default function PlanCanvas({
  floorPlan,
  meta,
  scale = 12,
  face = "bottom",
  showDims = true,
  setbacks = null,
  svgRef: externalSvgRef,
}) {
  const internalRef = useRef(null);
  if (!floorPlan || !meta) return null;

  const { plotL, plotB, wallThickness: wt } = meta;
  const { rooms, floorLabel } = floorPlan;

  const pxL = plotL * scale;
  const pxB = plotB * scale;
  const wtpx = wt * scale;
  const svgW = pxL + 2 * PAD;
  const svgH = pxB + 2 * PAD + 30;
  const px = PAD; // plot origin X in SVG
  const py = PAD; // plot origin Y in SVG

  // Convert feet to SVG px (relative to plot origin)
  const ftX = (f) => px + f * scale;
  const ftY = (f) => py + f * scale;

  // Entrance arrow
  const ent =
    {
      bottom: {
        x1: ftX(plotL / 2),
        y1: ftY(plotB) + 4,
        x2: ftX(plotL / 2),
        y2: ftY(plotB) + 18,
      },
      top: {
        x1: ftX(plotL / 2),
        y1: ftY(0) - 4,
        x2: ftX(plotL / 2),
        y2: ftY(0) - 18,
      },
      left: {
        x1: ftX(0) - 4,
        y1: ftY(plotB / 2),
        x2: ftX(0) - 18,
        y2: ftY(plotB / 2),
      },
      right: {
        x1: ftX(plotL) + 4,
        y1: ftY(plotB / 2),
        x2: ftX(plotL) + 18,
        y2: ftY(plotB / 2),
      },
    }[face] || {};

  const entTx =
    face === "bottom"
      ? ftX(plotL / 2)
      : face === "top"
        ? ftX(plotL / 2)
        : face === "left"
          ? ftX(0) - 22
          : ftX(plotL) + 22;
  const entTy =
    face === "bottom"
      ? ftY(plotB) + 30
      : face === "top"
        ? ftY(0) - 22
        : ftY(plotB / 2) - 8;
  const entAnchor =
    face === "left" ? "end" : face === "right" ? "start" : "middle";

  const clipId = `interior-clip-${floorPlan.floorIndex}`;

  function handleDownload() {
    const svg = internalRef.current;
    if (!svg) return;
    const blob = new Blob([svg.outerHTML], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${floorLabel.toLowerCase().replace(/ /g, "-")}.svg`;
    a.click();
  }

  return (
    <div className="plan-canvas-wrapper">
      <div className="plan-canvas-toolbar">
        <span className="plan-canvas-floor-label">{floorLabel}</span>
        <span className="plan-canvas-scale-badge">1 ft = {scale} px</span>
        <button className="plan-download-btn" onClick={handleDownload}>
          ↓ SVG
        </button>
      </div>
      <div className="plan-canvas-scroll">
        <svg
          ref={(el) => {
            internalRef.current = el;
            if (typeof externalSvgRef === "function") externalSvgRef(el);
          }}
          width={svgW}
          height={svgH}
          viewBox={`0 0 ${svgW} ${svgH}`}
          xmlns="http://www.w3.org/2000/svg"
          fontFamily="'DM Sans', sans-serif"
          style={{ display: "block", background: "#e8ecf0" }}
        >
          <defs>
            {/* Grid pattern */}
            <pattern
              id={`grid-${floorPlan.floorIndex}`}
              width={scale}
              height={scale}
              patternUnits="userSpaceOnUse"
              x={px + wtpx}
              y={py + wtpx}
            >
              <path
                d={`M${scale},0 L0,0 0,${scale}`}
                fill="none"
                stroke="#d1d9e2"
                strokeWidth="0.3"
              />
            </pattern>
            {/* Clip to interior (inside walls) */}
            <clipPath id={clipId}>
              <rect
                x={px + wtpx}
                y={py + wtpx}
                width={pxL - 2 * wtpx}
                height={pxB - 2 * wtpx}
              />
            </clipPath>
            {/* Entrance arrow marker */}
            <marker
              id={`arr-${floorPlan.floorIndex}`}
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L0,6 L8,3 z" fill="#EA580C" />
            </marker>
          </defs>

          {/* ── 1. Outer background ── */}
          <rect x={px} y={py} width={pxL} height={pxB} fill="#e8ecf0" />

          {/* ── 2. Interior grid (clipped to inside walls) ── */}
          <rect
            x={px + wtpx}
            y={py + wtpx}
            width={pxL - 2 * wtpx}
            height={pxB - 2 * wtpx}
            fill={`url(#grid-${floorPlan.floorIndex})`}
          />

          {/* ── 3. Wall system (double-line filled walls) ── */}
          <WallSystem
            px={px}
            py={py}
            pxL={pxL}
            pxB={pxB}
            wt={wt}
            scale={scale}
          />

          {/* ── 3b. Setback lines (dashed red overlay) ── */}
          {setbacks && (
            <SetbackLines
              setbacks={setbacks}
              px={px}
              py={py}
              pxL={pxL}
              pxB={pxB}
              scale={scale}
              plotL={plotL}
              plotB={plotB}
            />
          )}

          {/* ── 4. Rooms (clipped to interior — cannot overflow walls) ── */}
          <g clipPath={`url(#${clipId})`}>
            {rooms.map((room) => {
              const rx = ftX(room.x);
              const ry = ftY(room.y);
              const rw = room.w * scale;
              const rh = room.h * scale;
              const cx = rx + rw / 2;
              const cy = ry + rh / 2;
              const parts = room.label.split(" / ");
              const line1 = parts[0];
              const line2 = parts[1] || null;
              const fontSize = Math.min(11, rw / 8, rh / 5);
              const dimFs = Math.min(8.5, rw / 11, rh / 7);
              const isStair =
                room.baseId === "staircase" || room.baseId === "landing";

              // Exterior walls for window placement
              const extWalls = WINDOW_ROOMS.has(room.baseId)
                ? getExteriorWalls(room, plotL, plotB, wt)
                : [];
              // Pick window wall — prefer top or left (exterior)
              const winWall =
                extWalls.find((w) => ["top", "left", "right"].includes(w)) ||
                extWalls[0];
              // Door wall from layout hint
              const doorWall = room.doorWall || "right";

              return (
                <g key={room.id}>
                  {/* Room fill */}
                  <rect
                    x={rx}
                    y={ry}
                    width={rw}
                    height={rh}
                    fill={room.fill}
                    stroke={room.stroke}
                    strokeWidth={1.2}
                  />

                  {/* Interior partition line (shared walls between adjacent rooms) */}
                  {/* (room borders act as partition lines) */}

                  {/* Window */}
                  {winWall && rw > 22 && rh > 18 && (
                    <WindowSymbol
                      rx={rx}
                      ry={ry}
                      rw={rw}
                      rh={rh}
                      wall={winWall}
                    />
                  )}

                  {/* Door */}
                  {!isStair && rw > 20 && rh > 16 && (
                    <DoorSymbol
                      rx={rx}
                      ry={ry}
                      rw={rw}
                      rh={rh}
                      wall={doorWall}
                      scale={scale}
                    />
                  )}

                  {/* Furniture */}
                  {!isStair && rw > 28 && rh > 22 && (
                    <Furniture
                      baseId={room.baseId}
                      rx={rx}
                      ry={ry}
                      rw={rw}
                      rh={rh}
                    />
                  )}

                  {/* Room labels */}
                  {rw > 24 && rh > 18 && (
                    <>
                      <text
                        x={cx}
                        y={cy - (line2 ? 8 : 4)}
                        textAnchor="middle"
                        fontSize={fontSize}
                        fontWeight="700"
                        fill={room.stroke}
                        style={{ userSelect: "none" }}
                      >
                        {line1}
                      </text>
                      {line2 && (
                        <text
                          x={cx}
                          y={cy + 5}
                          textAnchor="middle"
                          fontSize={Math.min(10, rw / 9, rh / 6)}
                          fontWeight="700"
                          fill={room.stroke}
                          style={{ userSelect: "none" }}
                        >
                          {line2}
                        </text>
                      )}
                      <text
                        x={cx}
                        y={cy + (line2 ? 16 : 8)}
                        textAnchor="middle"
                        fontSize={dimFs}
                        fill="#64748b"
                        style={{ userSelect: "none" }}
                      >
                        {room.w.toFixed(1)}′ × {room.h.toFixed(1)}′
                      </text>
                    </>
                  )}
                </g>
              );
            })}
          </g>

          {/* ── 5. Wall re-draw on top (crisp wall lines over rooms) ── */}
          {/* Outer boundary */}
          <rect
            x={px}
            y={py}
            width={pxL}
            height={pxB}
            fill="none"
            stroke={WALL_STROKE}
            strokeWidth={3}
          />
          {/* Inner boundary */}
          <rect
            x={px + wtpx}
            y={py + wtpx}
            width={pxL - 2 * wtpx}
            height={pxB - 2 * wtpx}
            fill="none"
            stroke={WALL_STROKE}
            strokeWidth={1}
            opacity={0.4}
          />

          {/* ── 6. Entrance arrow ── */}
          {ent.x1 !== undefined && (
            <g>
              <line
                x1={ent.x1}
                y1={ent.y1}
                x2={ent.x2}
                y2={ent.y2}
                stroke="#EA580C"
                strokeWidth="2.5"
                markerEnd={`url(#arr-${floorPlan.floorIndex})`}
              />
              <text
                x={entTx}
                y={entTy}
                textAnchor={entAnchor}
                fontSize="9"
                fontWeight="700"
                fill="#EA580C"
              >
                ENTRANCE
              </text>
            </g>
          )}

          {/* ── 7. Dimension annotations ── */}
          {showDims && (
            <>
              {/* Top horizontal dim */}
              <line
                x1={px}
                y1={py - 20}
                x2={px + pxL}
                y2={py - 20}
                stroke="#1a2f4a"
                strokeWidth="1"
              />
              <line
                x1={px}
                y1={py - 24}
                x2={px}
                y2={py - 16}
                stroke="#1a2f4a"
                strokeWidth="1.2"
              />
              <line
                x1={px + pxL}
                y1={py - 24}
                x2={px + pxL}
                y2={py - 16}
                stroke="#1a2f4a"
                strokeWidth="1.2"
              />
              <text
                x={px + pxL / 2}
                y={py - 23}
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill="#1a2f4a"
              >
                {plotL} ft
              </text>
              {/* Left vertical dim */}
              <line
                x1={px - 22}
                y1={py}
                x2={px - 22}
                y2={py + pxB}
                stroke="#1a2f4a"
                strokeWidth="1"
              />
              <line
                x1={px - 26}
                y1={py}
                x2={px - 18}
                y2={py}
                stroke="#1a2f4a"
                strokeWidth="1.2"
              />
              <line
                x1={px - 26}
                y1={py + pxB}
                x2={px - 18}
                y2={py + pxB}
                stroke="#1a2f4a"
                strokeWidth="1.2"
              />
              <text
                x={px - 28}
                y={py + pxB / 2}
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill="#1a2f4a"
                transform={`rotate(-90,${px - 28},${py + pxB / 2})`}
              >
                {plotB} ft
              </text>
            </>
          )}

          {/* ── 8. Legend ── */}
          <g transform={`translate(${px}, ${svgH - 22})`}>
            <rect
              x={0}
              y={-5}
              width={10}
              height={10}
              fill="#BAE6FD"
              stroke="#0369A1"
              strokeWidth="0.7"
            />
            <text x={13} y={3} fontSize="8" fill="#64748b">
              Window
            </text>
            <line
              x1={68}
              y1={0}
              x2={78}
              y2={0}
              stroke="#1a2f4a"
              strokeWidth="2.2"
            />
            <path
              d="M68,0 a10,10 0 0 0 10,10"
              fill="none"
              stroke="#475569"
              strokeWidth="0.9"
              strokeDasharray="3 2"
            />
            <text x={81} y={3} fontSize="8" fill="#64748b">
              Door
            </text>
            <rect
              x={125}
              y={-5}
              width={12}
              height={10}
              fill={WALL_FILL}
              stroke={WALL_STROKE}
              strokeWidth="0.7"
            />
            <text x={140} y={3} fontSize="8" fill="#64748b">
              Wall
            </text>
            {setbacks && (
              <>
                <line
                  x1={175}
                  y1={0}
                  x2={195}
                  y2={0}
                  stroke="#E11D48"
                  strokeWidth="1.2"
                  strokeDasharray="4 3"
                />
                <text x={198} y={3} fontSize="8" fill="#64748b">
                  Setback
                </text>
              </>
            )}
          </g>

          {/* ── 9. Floor label ── */}
          <text
            x={px + pxL / 2}
            y={svgH - 7}
            textAnchor="middle"
            fontSize="9.5"
            fill="#94a3b8"
          >
            {floorLabel} · {plotL}ft × {plotB}ft · Wall {Math.round(wt * 12)}"
          </text>
        </svg>
      </div>
    </div>
  );
}

// ─── PDF export button ─────────────────────────────────────────────────────
async function exportToPDF(svgEls, floorLabels, plotL, plotB) {
  const win = window.open("", "_blank");
  if (!win) {
    alert("Allow pop-ups for PDF export");
    return;
  }

  const pages = svgEls
    .map((el, i) =>
      el
        ? `
    <div class="page">
      <div class="titleblock">
        <div class="title">${floorLabels[i].toUpperCase()} — FLOOR PLAN</div>
        <div class="sub">Plot: ${plotL}ft × ${plotB}ft &nbsp;|&nbsp; Date: ${new Date().toLocaleDateString("en-IN")}</div>
      </div>
      ${el.outerHTML}
      <div class="note">Indicative layout only. Consult a licensed Civil Engineer before construction.</div>
    </div>`
        : "",
    )
    .join("");

  win.document.write(`<!DOCTYPE html><html><head><title>Floor Plan</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:Arial,sans-serif;background:#fff}
      .page{page-break-after:always;padding:18px;display:flex;flex-direction:column;align-items:center}
      .titleblock{width:100%;border:2px solid #1a2f4a;border-bottom:none;padding:10px 16px;background:#f0f4f8}
      .title{font-size:15px;font-weight:bold;color:#1a2f4a;letter-spacing:.04em}
      .sub{font-size:10px;color:#555;margin-top:3px}
      svg{border:2px solid #1a2f4a;max-width:100%;display:block}
      .note{margin-top:8px;font-size:9px;color:#888;text-align:center}
      @media print{.page{padding:8px}}
    </style>
  </head><body>${pages}
  <script>window.onload=()=>window.print()</script>
  </body></html>`);
  win.document.close();
}

export function PDFExportButton({ svgRefs, floorLabels, plotL, plotB }) {
  return (
    <button
      className="plan-pdf-btn"
      onClick={() => {
        const els = (svgRefs || []).map((r) =>
          typeof r === "object" && r?.current ? r.current : r,
        );
        exportToPDF(els, floorLabels, plotL, plotB);
      }}
    >
      🖨 Export PDF
    </button>
  );
}