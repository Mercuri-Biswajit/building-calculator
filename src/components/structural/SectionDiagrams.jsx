// ═══════════════════════════════════════════════════════════════════════════
// SECTION DIAGRAMS — 2D cross-section SVGs for Beam, Column, Slab, Footing
// Place at: src/components/structural/SectionDiagrams.jsx
// CSS at:   src/styles/pages/_calculator.css  (.sec-diag-*)
// ═══════════════════════════════════════════════════════════════════════════

const COVER = 40; // nominal cover mm

// ── Helpers: estimate reinforcement from inputs ───────────────────────────
function pickBars(Ast_req, availWidth, cover, stirDia = 8) {
  const diameters = [8, 10, 12, 16, 20, 25, 32];
  for (const dia of diameters.slice(2)) {
    const area = (Math.PI * dia * dia) / 4;
    const maxBars = Math.floor(
      (availWidth - 2 * cover - 2 * stirDia + 25) / (dia + 25),
    );
    const n = Math.max(2, Math.ceil(Ast_req / area));
    if (n <= maxBars) return { dia, n };
  }
  return { dia: 16, n: Math.max(2, Math.ceil(Ast_req / 201)) };
}

function pickStirDia(mainDia) {
  return mainDia >= 20 ? 10 : 8;
}
function pickTieDia(mainDia) {
  return Math.max(6, Math.floor(mainDia / 4));
}

function estimateBeamBars(inputs) {
  const bw = parseFloat(inputs.width) || 300;
  const D = parseFloat(inputs.depth) || 450;
  const d = D - COVER - 8 - 8;
  const Ast = (0.85 * bw * d) / 415;
  const { dia: mainDia, n: mainBars } = pickBars(
    Math.max(Ast, 400),
    bw,
    COVER,
    8,
  );
  const topBars = parseInt(inputs.nSpans || 1) > 1 ? Math.max(2, mainBars) : 2;
  const topDia = mainDia >= 16 ? 12 : 10;
  return { mainBars, mainDia, topBars, topDia, stirDia: pickStirDia(mainDia) };
}

function estimateColumnBars(inputs) {
  const isCirc = (inputs.colShape || "rectangular") === "circular";
  const Ag = isCirc
    ? (Math.PI * (parseFloat(inputs.diameter) || 400) ** 2) / 4
    : (parseFloat(inputs.width) || 300) * (parseFloat(inputs.depth) || 300);
  const Asc = 0.008 * Ag;
  const mainDia = Asc > 3000 ? 20 : Asc > 1500 ? 16 : 12;
  const rawBars = Math.max(
    4,
    Math.ceil(Asc / ((Math.PI * mainDia * mainDia) / 4)),
  );
  const mainBars = isCirc
    ? Math.max(6, Math.ceil(rawBars / 2) * 2)
    : Math.ceil(rawBars / 4) * 4;
  return { mainBars, mainDia, tieDia: pickTieDia(mainDia), isCirc };
}

function estimateSlabBars(inputs) {
  const D = parseFloat(inputs.thickness) || 150;
  const ratio =
    (parseFloat(inputs.ly) || 6000) / (parseFloat(inputs.lx) || 4000);
  const isTwoWay = ratio < 2;
  const Ast_min = 0.0012 * 1000 * D;
  const mainDia = Ast_min > 300 ? 12 : 10;
  const mainSpacing = Math.min(
    300,
    Math.floor((((Math.PI * mainDia * mainDia) / 4 / Ast_min) * 1000) / 50) *
      50,
  );
  const distDia = 8;
  const distSpacing = isTwoWay ? mainSpacing : Math.min(450, mainSpacing * 1.5);
  return {
    mainDia,
    mainSpacing: Math.max(100, mainSpacing),
    distDia,
    distSpacing: Math.max(150, distSpacing),
    isTwoWay,
  };
}

function estimateFootingBars(inputs) {
  const D = parseFloat(inputs.thickness) || 500;
  const Ast = 0.0012 * 1000 * D;
  const mainDia = Ast > 400 ? 12 : 10;
  const spacing = Math.min(
    200,
    Math.floor((((Math.PI * mainDia * mainDia) / 4 / Ast) * 1000) / 25) * 25,
  );
  return { mainDia, spacing: Math.max(100, spacing) };
}

// ═══════════════════════════════════════════════════════════════════════════
// RAW SVG COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function BeamSVG({
  mainBars,
  mainDia,
  topBars,
  topDia,
  stirDia,
  width,
  depth,
  nSpans,
}) {
  const W = 220,
    H = 140;
  const cx = COVER,
    bw = W - 2 * cx,
    bh = H - 2 * cx;
  const mr = Math.min(7, Math.max(4, mainDia / 3.5));
  const tr = Math.min(5, Math.max(3, topDia / 4));
  const sr = Math.max(2, stirDia / 4);
  const nb = Math.min(mainBars, 6);
  const botY = H - cx - mr - 4;
  const topY = cx + tr + 4;
  const botXs = Array.from(
    { length: nb },
    (_, i) => cx + 8 + (i * (bw - 16)) / Math.max(nb - 1, 1),
  );
  const topXs = [cx + 12, W - cx - 12];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="sec-diag-svg"
      aria-label="Beam cross-section"
    >
      <rect
        x={1}
        y={1}
        width={W - 2}
        height={H - 2}
        rx={3}
        fill="#f0efe8"
        stroke="#b0a080"
        strokeWidth={2}
      />
      <rect
        x={cx - sr}
        y={cx - sr}
        width={bw + 2 * sr}
        height={bh + 2 * sr}
        rx={2}
        fill="none"
        stroke="#e8552a"
        strokeWidth={Math.max(1.5, sr * 1.2)}
      />
      {botXs.map((x, i) => (
        <circle
          key={i}
          cx={x}
          cy={botY}
          r={mr}
          fill="#0A2647"
          stroke="#fff"
          strokeWidth={1}
        />
      ))}
      {nb < mainBars && (
        <text
          x={W - cx - 6}
          y={botY + 1}
          textAnchor="middle"
          fontSize={8}
          fill="#0A2647"
          fontWeight="700"
        >
          +{mainBars - nb}
        </text>
      )}
      {topXs.map((x, i) => (
        <circle
          key={i}
          cx={x}
          cy={topY}
          r={tr}
          fill="#144272"
          stroke="#fff"
          strokeWidth={1}
        />
      ))}
      <text
        x={W / 2}
        y={H - 3}
        textAnchor="middle"
        fontSize={7.5}
        fill="#666"
        fontFamily="monospace"
      >
        b={width}mm
      </text>
      <text
        x={W - 4}
        y={H / 2}
        textAnchor="end"
        fontSize={7.5}
        fill="#666"
        fontFamily="monospace"
        transform={`rotate(-90,${W - 4},${H / 2})`}
      >
        D={depth}mm
      </text>
      <line
        x1={botXs[0]}
        y1={botY - mr - 2}
        x2={botXs[0] - 18}
        y2={botY - 18}
        stroke="#0A2647"
        strokeWidth={0.8}
      />
      <text
        x={botXs[0] - 22}
        y={botY - 20}
        textAnchor="end"
        fontSize={7}
        fill="#0A2647"
        fontWeight="600"
      >
        {mainBars}×Ø{mainDia}
      </text>
      <line
        x1={topXs[1]}
        y1={topY + tr + 2}
        x2={topXs[1] + 12}
        y2={topY + 22}
        stroke="#144272"
        strokeWidth={0.8}
      />
      <text
        x={topXs[1] + 14}
        y={topY + 24}
        fontSize={7}
        fill="#144272"
        fontWeight="600"
      >
        {topBars}×Ø{topDia}
      </text>
      <text
        x={9}
        y={H / 2 - 4}
        fontSize={7}
        fill="#e8552a"
        fontWeight="600"
        transform={`rotate(-90,9,${H / 2})`}
      >
        Ø{stirDia}
      </text>
      {nSpans > 1 && (
        <text
          x={W / 2}
          y={12}
          textAnchor="middle"
          fontSize={7}
          fill="#FF8C00"
          fontWeight="700"
        >
          {nSpans}-SPAN CONTINUOUS
        </text>
      )}
    </svg>
  );
}

function ColumnSVG({
  mainBars,
  mainDia,
  tieDia,
  width,
  depth,
  isCirc,
  diameter,
}) {
  const W = 180,
    H = 180;
  const cx = COVER;
  const mr = Math.min(8, Math.max(4, mainDia / 3));

  if (isCirc) {
    const R = (W - 20) / 2,
      cx2 = W / 2,
      cy2 = H / 2;
    const barR = R - cx - mr;
    const bars = Array.from({ length: mainBars }, (_, i) => ({
      x: cx2 + barR * Math.cos((2 * Math.PI * i) / mainBars - Math.PI / 2),
      y: cy2 + barR * Math.sin((2 * Math.PI * i) / mainBars - Math.PI / 2),
    }));
    return (
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="sec-diag-svg"
        aria-label="Circular column"
      >
        <circle
          cx={cx2}
          cy={cy2}
          r={R}
          fill="#f0efe8"
          stroke="#b0a080"
          strokeWidth={2}
        />
        <circle
          cx={cx2}
          cy={cy2}
          r={R - cx}
          fill="none"
          stroke="#2a6ee8"
          strokeWidth={1.5}
          strokeDasharray="4,2"
        />
        {bars.map((b, i) => (
          <circle
            key={i}
            cx={b.x}
            cy={b.y}
            r={mr}
            fill="#1e40af"
            stroke="#fff"
            strokeWidth={1.2}
          />
        ))}
        <text
          x={cx2}
          y={H - 4}
          textAnchor="middle"
          fontSize={7.5}
          fill="#666"
          fontFamily="monospace"
        >
          Ø{diameter}mm
        </text>
        <text
          x={cx2}
          y={cy2 + 4}
          textAnchor="middle"
          fontSize={7}
          fill="#2a6ee8"
          fontWeight="600"
        >
          Circular
        </text>
        <text
          x={cx2}
          y={cy2 + 14}
          textAnchor="middle"
          fontSize={7}
          fill="#2a6ee8"
        >
          {mainBars}×Ø{mainDia}
        </text>
      </svg>
    );
  }

  const barsPerSide = Math.max(2, Math.floor(mainBars / 4));
  const sides = [
    {
      x0: cx + mr,
      y0: cx + mr,
      dx: (W - 2 * cx - 2 * mr) / (barsPerSide - 1),
      dy: 0,
      n: barsPerSide,
    },
    {
      x0: W - cx - mr,
      y0: cx + mr,
      dx: 0,
      dy: (H - 2 * cx - 2 * mr) / (barsPerSide - 1),
      n: barsPerSide,
    },
    {
      x0: W - cx - mr,
      y0: H - cx - mr,
      dx: -(W - 2 * cx - 2 * mr) / (barsPerSide - 1),
      dy: 0,
      n: barsPerSide,
    },
    {
      x0: cx + mr,
      y0: H - cx - mr,
      dx: 0,
      dy: -(H - 2 * cx - 2 * mr) / (barsPerSide - 1),
      n: barsPerSide,
    },
  ];
  const seen = new Set();
  const bars = [];
  sides.forEach((s) => {
    for (let i = 0; i < s.n; i++) {
      const bx = Math.round(s.x0 + i * s.dx),
        by = Math.round(s.y0 + i * s.dy);
      const k = `${bx},${by}`;
      if (!seen.has(k)) {
        seen.add(k);
        bars.push({ x: bx, y: by });
      }
    }
  });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="sec-diag-svg"
      aria-label="Column cross-section"
    >
      <rect
        x={1}
        y={1}
        width={W - 2}
        height={H - 2}
        rx={3}
        fill="#f0efe8"
        stroke="#b0a080"
        strokeWidth={2}
      />
      <rect
        x={cx - 2}
        y={cx - 2}
        width={W - 2 * cx + 4}
        height={H - 2 * cx + 4}
        rx={2}
        fill="none"
        stroke="#2a6ee8"
        strokeWidth={2}
        strokeDasharray="4,2"
      />
      {bars.map((b, i) => (
        <circle
          key={i}
          cx={b.x}
          cy={b.y}
          r={mr}
          fill="#1e40af"
          stroke="#fff"
          strokeWidth={1.2}
        />
      ))}
      <text
        x={W / 2}
        y={H - 3}
        textAnchor="middle"
        fontSize={7.5}
        fill="#666"
        fontFamily="monospace"
      >
        {width}mm
      </text>
      <text
        x={W - 4}
        y={H / 2}
        textAnchor="end"
        fontSize={7.5}
        fill="#666"
        fontFamily="monospace"
        transform={`rotate(-90,${W - 4},${H / 2})`}
      >
        {depth}mm
      </text>
      <text x={cx + 4} y={cx + 12} fontSize={7} fill="#1e40af" fontWeight="600">
        {mainBars}×Ø{mainDia}
      </text>
      <text x={cx + 4} y={cx + 22} fontSize={7} fill="#2a6ee8">
        Ties Ø{tieDia}
      </text>
    </svg>
  );
}

function SlabSVG({
  mainDia,
  mainSpacing,
  distDia,
  distSpacing,
  thickness,
  lx,
  isTwoWay,
}) {
  const W = 240,
    H = 110;
  const nMain = Math.min(7, Math.max(3, Math.floor(200 / mainSpacing) + 1));
  const nDist = Math.min(5, Math.max(2, Math.floor(100 / distSpacing) + 1));
  const slabTop = 18,
    slabBot = H - 18;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="sec-diag-svg"
      aria-label="Slab cross-section"
    >
      <rect
        x={10}
        y={slabTop}
        width={W - 20}
        height={slabBot - slabTop}
        rx={3}
        fill="#f0efe8"
        stroke="#b0a080"
        strokeWidth={2}
      />
      {Array.from({ length: nMain }, (_, i) => (
        <circle
          key={`m${i}`}
          cx={22 + i * ((W - 44) / Math.max(nMain - 1, 1))}
          cy={slabBot - 10}
          r={Math.max(2.5, mainDia / 4)}
          fill="#27a96b"
          stroke="#fff"
          strokeWidth={0.8}
        />
      ))}
      {Array.from({ length: nDist }, (_, i) => (
        <rect
          key={`d${i}`}
          x={22 + i * ((W - 44) / Math.max(nDist - 1, 1)) - 1}
          y={slabTop + 8}
          width={3}
          height={Math.max(2, distDia / 3.5)}
          rx={1}
          fill={isTwoWay ? "#27a96b" : "#059669"}
        />
      ))}
      <text
        x={W / 2}
        y={H - 2}
        textAnchor="middle"
        fontSize={7.5}
        fill="#666"
        fontFamily="monospace"
      >
        Lx={lx}mm
      </text>
      <text
        x={W - 4}
        y={H / 2 + 14}
        textAnchor="end"
        fontSize={7.5}
        fill="#666"
        fontFamily="monospace"
        transform={`rotate(-90,${W - 4},${H / 2})`}
      >
        D={thickness}mm
      </text>
      <text x={14} y={slabBot - 5} fontSize={7} fill="#27a96b" fontWeight="700">
        Ø{mainDia}@{mainSpacing}
      </text>
      <text
        x={14}
        y={slabTop + 6}
        fontSize={7}
        fill={isTwoWay ? "#27a96b" : "#059669"}
        fontWeight="700"
      >
        Ø{distDia}@{distSpacing}
      </text>
      {isTwoWay && (
        <text
          x={W / 2}
          y={slabTop - 4}
          textAnchor="middle"
          fontSize={7}
          fill="#FF8C00"
          fontWeight="700"
        >
          TWO-WAY
        </text>
      )}
    </svg>
  );
}

function FootingSVG({ mainDia, spacing, length, width }) {
  const W = 200,
    H = 160,
    cx = 50,
    cy = 30;
  const n = Math.min(7, Math.max(3, Math.floor(150 / spacing) + 1));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="sec-diag-svg"
      aria-label="Footing plan view"
    >
      <rect
        x={cx}
        y={cy}
        width={W - 2 * cx}
        height={H - 2 * cy}
        rx={3}
        fill="#f5f0ff"
        stroke="#8b5cf6"
        strokeWidth={2}
      />
      {Array.from({ length: n }, (_, i) => (
        <line
          key={`l${i}`}
          x1={cx + 6}
          y1={cy + 8 + i * ((H - 2 * cy - 16) / Math.max(n - 1, 1))}
          x2={W - cx - 6}
          y2={cy + 8 + i * ((H - 2 * cy - 16) / Math.max(n - 1, 1))}
          stroke="#8b5cf6"
          strokeWidth={2}
        />
      ))}
      {Array.from({ length: n }, (_, i) => (
        <line
          key={`w${i}`}
          x1={cx + 8 + i * ((W - 2 * cx - 16) / Math.max(n - 1, 1))}
          y1={cy + 6}
          x2={cx + 8 + i * ((W - 2 * cx - 16) / Math.max(n - 1, 1))}
          y2={H - cy - 6}
          stroke="#7c3aed"
          strokeWidth={1.5}
          strokeDasharray="3,2"
        />
      ))}
      <text
        x={W / 2}
        y={H - 4}
        textAnchor="middle"
        fontSize={8}
        fill="#8b5cf6"
        fontWeight="700"
      >
        Plan View
      </text>
      <text
        x={W / 2}
        y={cy - 4}
        textAnchor="middle"
        fontSize={7.5}
        fill="#666"
        fontFamily="monospace"
      >
        {length}mm
      </text>
      <text
        x={cx - 4}
        y={H / 2}
        textAnchor="end"
        fontSize={7.5}
        fill="#666"
        fontFamily="monospace"
        transform={`rotate(-90,${cx - 4},${H / 2})`}
      >
        {width}mm
      </text>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC EXPORTED COMPONENTS  (CSS classes: .sec-diag-*)
// ═══════════════════════════════════════════════════════════════════════════

export function BeamSectionDiagram({ inputs = {}, result = null }) {
  const cards = result?.designCards;
  let mainBars, mainDia, topBars, topDia, stirDia;

  if (cards) {
    const mc = cards.find((c) => c.type === "main-bottom");
    const tc = cards.find((c) => c.type === "main-top");
    const sc = cards.find((c) => c.type === "stirrup");
    mainBars = mc?.qty || 2;
    mainDia = mc?.dia || 12;
    topBars = tc?.qty || 2;
    topDia = tc?.dia || 10;
    stirDia = sc?.dia || 8;
  } else {
    ({ mainBars, mainDia, topBars, topDia, stirDia } =
      estimateBeamBars(inputs));
  }

  const w = parseFloat(inputs.width) || 300;
  const d = parseFloat(inputs.depth) || 450;
  const n = parseInt(inputs.nSpans) || 1;

  return (
    <div className="sec-diag-card">
      <div className="sec-diag-card-title">
        <span>⬛</span> Beam — {w}×{d} mm
        {!cards && <span className="sec-diag-estimated-badge">estimated</span>}
      </div>
      <BeamSVG
        mainBars={mainBars}
        mainDia={mainDia}
        topBars={topBars}
        topDia={topDia}
        stirDia={stirDia}
        width={w}
        depth={d}
        nSpans={n}
      />
      <p className="sec-diag-note">
        Bottom: {mainBars}×Ø{mainDia} &nbsp;·&nbsp; Top: {topBars}×Ø{topDia}{" "}
        &nbsp;·&nbsp; Stirrups: Ø{stirDia} &nbsp;·&nbsp; Cover: {COVER}mm
      </p>
    </div>
  );
}

export function ColumnSectionDiagram({ inputs = {}, result = null }) {
  const cards = result?.designCards;
  const isCirc = (inputs.colShape || "rectangular") === "circular";
  let mainBars, mainDia, tieDia;

  if (cards) {
    const mc = cards.find((c) => c.type === "main-vert");
    const tc = cards.find((c) => c.type === "tie");
    mainBars = mc?.qty || 4;
    mainDia = mc?.dia || 12;
    tieDia = tc?.dia || 8;
  } else {
    ({ mainBars, mainDia, tieDia } = estimateColumnBars(inputs));
  }

  const w = parseFloat(inputs.width) || 300;
  const d = parseFloat(inputs.depth) || 300;
  const dia = parseFloat(inputs.diameter) || 400;

  return (
    <div className="sec-diag-card">
      <div className="sec-diag-card-title">
        <span>🟫</span> Column — {isCirc ? `Ø${dia}` : `${w}×${d}`} mm
        {!cards && <span className="sec-diag-estimated-badge">estimated</span>}
      </div>
      <ColumnSVG
        mainBars={mainBars}
        mainDia={mainDia}
        tieDia={tieDia}
        width={w}
        depth={d}
        isCirc={isCirc}
        diameter={dia}
      />
      <p className="sec-diag-note">
        Main: {mainBars}×Ø{mainDia} &nbsp;·&nbsp; Ties: Ø{tieDia} &nbsp;·&nbsp;
        Cover: {COVER}mm
      </p>
    </div>
  );
}

export function SlabSectionDiagram({ inputs = {}, result = null }) {
  const cards = result?.designCards;
  let mainDia, mainSpacing, distDia, distSpacing, isTwoWay;

  if (cards) {
    const mc = cards.find((c) => c.type === "slab-main");
    const dc = cards.find((c) => c.type === "slab-dist");
    mainDia = mc?.dia || 10;
    mainSpacing = mc?.spacing || 150;
    distDia = dc?.dia || 8;
    distSpacing = dc?.spacing || 200;
    isTwoWay = result?.meta?.isTwoWay || false;
  } else {
    ({ mainDia, mainSpacing, distDia, distSpacing, isTwoWay } =
      estimateSlabBars(inputs));
  }

  const lx = parseFloat(inputs.lx) || 4000;
  const D = parseFloat(inputs.thickness) || 150;

  return (
    <div className="sec-diag-card">
      <div className="sec-diag-card-title">
        <span>▬</span> Slab — D={D}mm
        {!cards && <span className="sec-diag-estimated-badge">estimated</span>}
      </div>
      <SlabSVG
        mainDia={mainDia}
        mainSpacing={mainSpacing}
        distDia={distDia}
        distSpacing={distSpacing}
        thickness={D}
        lx={lx}
        isTwoWay={isTwoWay}
      />
      <p className="sec-diag-note">
        Main: Ø{mainDia}@{mainSpacing}mm &nbsp;·&nbsp; Dist: Ø{distDia}@
        {distSpacing}mm &nbsp;·&nbsp;
        {isTwoWay ? "Two-way" : "One-way"}
      </p>
    </div>
  );
}

export function FootingSectionDiagram({ inputs = {}, result = null }) {
  const cards = result?.designCards;
  let mainDia, spacing;

  if (cards) {
    const mc = cards.find((c) => c.type === "foot-l");
    mainDia = mc?.dia || 12;
    spacing = mc?.spacing || 150;
  } else {
    ({ mainDia, spacing } = estimateFootingBars(inputs));
  }

  const L = parseFloat(inputs.length) || 2000;
  const W = parseFloat(inputs.width) || 2000;

  return (
    <div className="sec-diag-card">
      <div className="sec-diag-card-title">
        <span>◼</span> Footing — {L}×{W} mm
        {!cards && <span className="sec-diag-estimated-badge">estimated</span>}
      </div>
      <FootingSVG mainDia={mainDia} spacing={spacing} length={L} width={W} />
      <p className="sec-diag-note">
        Ø{mainDia}@{spacing}mm both ways &nbsp;·&nbsp; Cover: 50mm
      </p>
    </div>
  );
}

/**
 * AllSectionDiagrams — renders beam + column + slab diagrams in a grid
 * Place after <StructuralDesignTab /> in CalculatorPage
 */
export function AllSectionDiagrams({ beam, column, slab }) {
  const bInputs = beam?.inputs || {};
  const cInputs = column?.inputs || {};
  const sInputs = slab?.inputs || {};

  const hasBeam = Object.keys(bInputs).length > 0;
  const hasColumn = Object.keys(cInputs).length > 0;
  const hasSlab = Object.keys(sInputs).length > 0;

  if (!hasBeam && !hasColumn && !hasSlab) return null;

  return (
    <div className="sec-diag-wrapper">
      <div className="sec-diag-header">
        <span>📐</span> 2D Section Diagrams
        <span className="sec-diag-header-note">auto-generated from inputs</span>
      </div>
      <div className="sec-diag-grid">
        {hasBeam && (
          <BeamSectionDiagram inputs={bInputs} result={beam?.result} />
        )}
        {hasColumn && (
          <ColumnSectionDiagram inputs={cInputs} result={column?.result} />
        )}
        {hasSlab && (
          <SlabSectionDiagram inputs={sInputs} result={slab?.result} />
        )}
      </div>
    </div>
  );
}
