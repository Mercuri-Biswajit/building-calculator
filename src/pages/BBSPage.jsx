import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import "../styles/pages/_bbs-calculator.css";

/* ═══════════════════════════════════════════════════════════════════════════
   IS 456 : 2000 — MATERIAL TABLES  (Fe415/500/550 × M20/25/30)
═══════════════════════════════════════════════════════════════════════════ */
const STEEL_GRADES = {
  Fe415: { fy: 415, label: "Fe415", color: "#0A2647" },
  Fe500: { fy: 500, label: "Fe500", color: "#1e40af" },
  Fe550: { fy: 550, label: "Fe550", color: "#6d28d9" },
};
const CONCRETE_GRADES = {
  M20: {
    fck: 20,
    label: "M20",
    tbd_fe415: 1.2,
    tbd_fe500: 1.2,
    tbd_fe550: 1.2,
  },
  M25: {
    fck: 25,
    label: "M25",
    tbd_fe415: 1.4,
    tbd_fe500: 1.4,
    tbd_fe550: 1.4,
  },
  M30: {
    fck: 30,
    label: "M30",
    tbd_fe415: 1.5,
    tbd_fe500: 1.5,
    tbd_fe550: 1.5,
  },
};

/* IS 456 Cl.26.2.1 — Ld = (ϕ·σs)/(4·τbd)
   σs = 0.87·fy for tension bar; τbd values from Table 5 IS 456 */
function getLdFactor(steelGrade, concreteGrade) {
  const fy = STEEL_GRADES[steelGrade].fy;
  const tbd =
    CONCRETE_GRADES[concreteGrade][`tbd_${steelGrade.toLowerCase()}`] || 1.2;
  // Ld = (ϕ × 0.87 × fy) / (4 × τbd)  → factor = (0.87×fy)/(4×τbd)
  return Math.round((0.87 * fy) / (4 * tbd));
}
function getLapFactor(ldFactor) {
  // Lap = 1.3 × Ld, rounded to nearest 5ϕ
  return Math.round((1.3 * ldFactor) / 5) * 5;
}

const MAIN_HOOK_FACTOR = 20;
const STIR_HOOK_FACTOR = 9;
const COVER = 40;
const BAR_LEN = 12000;

const BAR_WEIGHTS = {
  6: 0.222,
  8: 0.395,
  10: 0.617,
  12: 0.888,
  16: 1.578,
  20: 2.466,
  25: 3.853,
  32: 6.313,
};

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════════════════ */
const wtPer = (d) => BAR_WEIGHTS[d] || 0;
const mainHook = (d) => MAIN_HOOK_FACTOR * d;
const stirHook = (d) => STIR_HOOK_FACTOR * d;

function ldFn(d, ldFactor) {
  return ldFactor * d;
}
function lapFn(d, lapFactor) {
  return lapFactor * d;
}

function pickBars(Ast_req, availWidth, cover, stirDia = 8) {
  for (const dia of [10, 12, 16, 20, 25, 32]) {
    const Abar = (Math.PI * dia * dia) / 4;
    const n = Math.ceil(Ast_req / Abar);
    const clearSpan = availWidth - 2 * cover - 2 * stirDia;
    const spacePerBar = clearSpan / n;
    const minSpacing = Math.max(dia, 25);
    if (spacePerBar >= minSpacing && n >= 2 && n <= 10)
      return { dia, n, Ast_prov: Math.round(Abar * n) };
  }
  return { dia: 16, n: 4, Ast_prov: Math.round(4 * Math.PI * 64) };
}

function pickStirDia(mainDia) {
  return mainDia >= 20 ? 10 : 8;
}
function pickTieDia(mainDia) {
  return Math.max(6, Math.floor(mainDia / 4));
}

function calcRow(desc, mark, dia, cutLen, qty, isRef, lapLen = 0) {
  const totalMm = (cutLen + lapLen) * qty;
  const totalLenM = (totalMm / 1000).toFixed(2);
  const weight = ((wtPer(dia) * totalMm) / 1000).toFixed(2);
  return {
    desc,
    mark,
    dia,
    cutLen: Math.round(cutLen),
    lapLen: Math.round(lapLen),
    qty,
    totalLenM,
    wtPerM: wtPer(dia).toFixed(3),
    weight,
    isRef,
  };
}

function optimizeBars(rows) {
  const byDia = {};
  rows.forEach((r) => {
    if (!byDia[r.dia]) byDia[r.dia] = [];
    byDia[r.dia].push(r);
  });
  return Object.entries(byDia).map(([dia, rs]) => {
    const d = Number(dia);
    const totalPieces = rs.reduce((a, r) => a + r.qty, 0);
    const cutLen = rs[0]?.cutLen || 0;
    const piecesPerBar = cutLen > 0 ? Math.floor(BAR_LEN / cutLen) || 1 : 1;
    const fullBars = Math.ceil(totalPieces / piecesPerBar);
    const totalUsed = totalPieces * cutLen;
    const totalPurchd = fullBars * BAR_LEN;
    const wastageM = ((totalPurchd - totalUsed) / 1000).toFixed(2);
    const wastagePct =
      totalPurchd > 0
        ? (((totalPurchd - totalUsed) / totalPurchd) * 100).toFixed(1)
        : "0.0";
    return {
      dia: d,
      fullBars,
      piecesPerBar,
      totalPieces,
      wastageM,
      wastagePct,
    };
  });
}

function buildSummary(allElements) {
  const byDia = {};
  allElements.forEach((el) =>
    el.rows.forEach((r) => {
      if (!byDia[r.dia]) byDia[r.dia] = 0;
      byDia[r.dia] += parseFloat(r.weight);
    }),
  );
  let totalKg = 0;
  const arr = Object.entries(byDia)
    .sort((a, b) => a[0] - b[0])
    .map(([dia, kg]) => {
      const rounded = parseFloat(kg.toFixed(2));
      totalKg += rounded;
      const bars12m = Math.ceil(
        ((rounded / wtPer(Number(dia))) * 1000) / BAR_LEN + 0.5,
      );
      return { dia: Number(dia), totalKg: rounded, bars12m };
    });
  return { byDia: arr, totalKg: parseFloat(totalKg.toFixed(2)) };
}

/* ═══════════════════════════════════════════════════════════════════════════
   CALCULATOR 1 — BEAM  (Simple + Multi-span)
   Multi-span: uses moment coefficients IS 456 Table 12 / Cl.22.5
═══════════════════════════════════════════════════════════════════════════ */
function calcBeam({ span, width, depth, nSpans, steelGrade, concreteGrade }) {
  const warnings = [];
  const fy = STEEL_GRADES[steelGrade].fy;
  const ldFactor = getLdFactor(steelGrade, concreteGrade);
  const lapFactor = getLapFactor(ldFactor);
  const bw = width - 2 * COVER;
  const d = depth - COVER - 8 - 8;
  const Ast_min = (0.85 * bw * d) / fy;
  const Ast_req = Math.max(Ast_min, 0.004 * bw * d);
  const stirDia = pickStirDia(16);
  const {
    dia: mainDia,
    n: mainBars,
    Ast_prov,
  } = pickBars(Ast_req, width, COVER, stirDia);
  const stirDiaA = pickStirDia(mainDia);
  const stirrSp = Math.round(Math.min(0.75 * d, 300));
  const topBars = nSpans > 1 ? Math.max(2, mainBars) : 2;
  const topDia = mainDia >= 16 ? 12 : 10;

  if (Ast_prov < Ast_min)
    warnings.push(
      `⚠ Ast prov (${Ast_prov}mm²) < Ast_min (${Ast_min.toFixed(0)}mm²) — IS 456 Cl.26.5.2.1`,
    );
  if (depth < span / 12)
    warnings.push(
      `⚠ Depth/Span = ${(depth / span).toFixed(2)} < 1/12 — check deflection IS 456 Cl.23.2`,
    );
  if (width < 200) warnings.push("⚠ Beam width < 200mm — check adequacy");
  if (nSpans > 1)
    warnings.push(
      `ℹ Multi-span (${nSpans} spans): Top bars continuous at supports — IS 456 Cl.22.5. Support bars = bottom bars qty.`,
    );

  const spanNote = nSpans > 1 ? ` (×${nSpans} spans)` : "";
  const totalSpan = span * nSpans;

  // For multi-span: full-length bottom + top continuous bars
  // Each span needs its own bottom bars; top bars run full continuous length
  const mainCut =
    span + 2 * ldFn(mainDia, ldFactor) + 2 * mainHook(mainDia) - 2 * COVER;
  const topCut =
    totalSpan + 2 * ldFn(topDia, ldFactor) + 2 * mainHook(topDia) - 2 * COVER;
  const perim = 2 * (width - 2 * COVER + (depth - 2 * COVER));
  const stirCut = perim + 2 * stirHook(stirDiaA);
  const stirQty = (Math.ceil(span / stirrSp) + 1) * nSpans;
  const mainQty = mainBars * nSpans;

  // Extra short top bars at each intermediate support (IS 456 — 0.25L each side)
  const supportBarLen = Math.round(0.25 * span * 2 + width); // both sides + support width
  const supportBarQty = nSpans > 1 ? mainBars * (nSpans - 1) : 0;

  const designCards = [
    {
      label: "Bottom Main Bars",
      type: "main-bottom",
      color: "#0A2647",
      qty: mainQty,
      dia: mainDia,
      spacing: null,
      Ast_req: Math.round(Ast_req),
      Ast_prov,
      ld_mm: ldFn(mainDia, ldFactor),
      hook_mm: mainHook(mainDia),
      hook_label: `${MAIN_HOOK_FACTOR}ϕ (90°)`,
      lap_mm: lapFn(mainDia, lapFactor),
      lap_label: `${lapFactor}ϕ`,
      clause: "IS 456 Cl.26.5.2.1",
      reason: `Ast_min=0.85bwd/fy=${Ast_min.toFixed(0)}mm² | ${steelGrade}/${concreteGrade} | Ld=${ldFactor}ϕ | Lap=${lapFactor}ϕ`,
    },
    {
      label: nSpans > 1 ? "Top Continuous Bars" : "Top Hanger Bars",
      type: "main-top",
      color: "#144272",
      qty: topBars,
      dia: topDia,
      spacing: null,
      Ast_req: null,
      Ast_prov: Math.round((topBars * Math.PI * topDia * topDia) / 4),
      ld_mm: ldFn(topDia, ldFactor),
      hook_mm: mainHook(topDia),
      hook_label: `${MAIN_HOOK_FACTOR}ϕ (90°)`,
      lap_mm: lapFn(topDia, lapFactor),
      lap_label: `${lapFactor}ϕ`,
      clause: nSpans > 1 ? "IS 456 Cl.22.5 (continuous)" : "IS 456 Cl.26.5.1.2",
      reason:
        nSpans > 1
          ? `Continuous top bars full ${totalSpan}mm length — hogging at supports`
          : "Min 2 top bars as hanger/compression steel",
    },
    {
      label: "Stirrups (2-legged)",
      type: "stirrup",
      color: "#e8552a",
      qty: stirQty,
      dia: stirDiaA,
      spacing: stirrSp,
      Ast_req: null,
      Ast_prov: null,
      ld_mm: null,
      hook_mm: stirHook(stirDiaA),
      hook_label: `${STIR_HOOK_FACTOR}ϕ (135°)`,
      lap_mm: null,
      clause: "IS 456 Cl.26.5.2.2",
      reason: `Sv=min(0.75d,300)=${stirrSp}mm | Total ${stirQty} nos for ${nSpans} span(s)`,
    },
  ];

  const rows = [
    calcRow(
      `Bottom Main Bars${spanNote} (${mainBars}–Ø${mainDia})`,
      "M1",
      mainDia,
      mainCut,
      mainQty,
      "IS 456 Cl.26.5.2",
      lapFn(mainDia, lapFactor),
    ),
    calcRow(
      `Top ${nSpans > 1 ? "Continuous" : "Hanger"} Bars (${topBars}–Ø${topDia})`,
      "M2",
      topDia,
      topCut,
      topBars,
      "IS 456 Cl.26.5.2",
      lapFn(topDia, lapFactor),
    ),
    calcRow(
      `Stirrups Ø${stirDiaA}@${stirrSp}mm${spanNote}`,
      "S1",
      stirDiaA,
      stirCut,
      stirQty,
      "IS 456 Cl.26.5.2.2",
      0,
    ),
  ];

  if (nSpans > 1 && supportBarQty > 0) {
    rows.push(
      calcRow(
        `Support Extra Top Bars (${mainBars}–Ø${mainDia} × ${nSpans - 1} supports)`,
        "M3",
        mainDia,
        supportBarLen,
        supportBarQty,
        "IS 456 Cl.22.5",
        0,
      ),
    );
  }

  return {
    rows,
    warnings,
    designCards,
    meta: { ldFactor, lapFactor, steelGrade, concreteGrade },
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   CALCULATOR 2 — COLUMN  (Rectangular + Circular)
═══════════════════════════════════════════════════════════════════════════ */
function calcColumn({
  height,
  width,
  depth,
  colShape,
  diameter,
  steelGrade,
  concreteGrade,
}) {
  const warnings = [];
  const ldFactor = getLdFactor(steelGrade, concreteGrade);
  const lapFactor = getLapFactor(ldFactor);
  const isCirc = colShape === "circular";

  let Ag, Ast_min, Ast_req, mainDia, mainBars, Ast_prov;

  if (isCirc) {
    Ag = (Math.PI * diameter * diameter) / 4;
    Ast_min = 0.008 * Ag;
    Ast_req = Math.max(Ast_min, 0.01 * Ag);
    // For circular: bars equally spaced on perimeter, min 6
    for (const dia of [12, 16, 20, 25]) {
      const Abar = (Math.PI * dia * dia) / 4;
      const n = Math.max(6, Math.ceil(Ast_req / Abar));
      if (n <= 12) {
        mainDia = dia;
        mainBars = n;
        Ast_prov = Math.round(Abar * n);
        break;
      }
    }
    if (!mainDia) {
      mainDia = 16;
      mainBars = 8;
      Ast_prov = Math.round(8 * Math.PI * 64);
    }
    if (mainBars < 6)
      warnings.push("⚠ Min 6 bars for circular column — IS 456 Cl.26.5.3.1c");
  } else {
    Ag = width * depth;
    Ast_min = 0.008 * Ag;
    Ast_req = Math.max(Ast_min, 0.01 * Ag);
    ({
      dia: mainDia,
      n: mainBars,
      Ast_prov,
    } = pickBars(Ast_req, Math.min(width, depth), COVER, 8));
    if (mainBars < 4)
      warnings.push("⚠ Min 4 bars for rectangular column — IS 456 Cl.26.5.3.1");
    if (width < 200 || depth < 200)
      warnings.push("⚠ Column dimension < 200mm — check adequacy");
  }

  const tieDia = pickTieDia(mainDia);
  const leastDim = isCirc ? diameter : Math.min(width, depth);
  const tieSpacing = Math.round(Math.min(leastDim, 16 * mainDia, 300));

  if (Ast_prov < Ast_min)
    warnings.push(
      `⚠ Asc (${Ast_prov}mm²) < 0.8%Ag (${Ast_min.toFixed(0)}mm²) — IS 456 Cl.26.5.3.1`,
    );

  const mainCut = height + 2 * ldFn(mainDia, ldFactor);

  let tieCut, tiePerim;
  if (isCirc) {
    // Helical / circular tie — perimeter of hoop inside cover
    const hoop_d = diameter - 2 * COVER;
    tiePerim = Math.PI * hoop_d;
    tieCut = Math.round(tiePerim + 2 * stirHook(tieDia));
  } else {
    tiePerim = 2 * (width - 2 * COVER + (depth - 2 * COVER));
    tieCut = Math.round(tiePerim + 2 * stirHook(tieDia));
  }
  const tieQty = Math.ceil(height / tieSpacing) + 1;

  const sizeLabel = isCirc
    ? `Ø${diameter}mm (circular)`
    : `${width}×${depth}mm`;

  const designCards = [
    {
      label: isCirc ? "Main Vertical Bars (Circular)" : "Main Vertical Bars",
      type: "main-vert",
      color: "#2a6ee8",
      qty: mainBars,
      dia: mainDia,
      spacing: null,
      Ast_req: Math.round(Ast_req),
      Ast_prov,
      ld_mm: ldFn(mainDia, ldFactor),
      hook_mm: null,
      lap_mm: lapFn(mainDia, lapFactor),
      lap_label: `${lapFactor}ϕ`,
      clause: "IS 456 Cl.26.5.3.1",
      reason: `Asc_min=0.8%Ag=${Ast_min.toFixed(0)}mm² | ${sizeLabel} | ${steelGrade}/${concreteGrade} | Ld=${ldFactor}ϕ`,
    },
    {
      label: isCirc ? "Circular Ties / Helical" : "Lateral Ties",
      type: "tie",
      color: "#1e40af",
      qty: tieQty,
      dia: tieDia,
      spacing: tieSpacing,
      Ast_req: null,
      Ast_prov: null,
      ld_mm: null,
      hook_mm: stirHook(tieDia),
      hook_label: `${STIR_HOOK_FACTOR}ϕ (135°)`,
      lap_mm: null,
      clause: "IS 456 Cl.26.5.3.2",
      reason: `Sv=min(${leastDim}, 16×${mainDia}=${16 * mainDia}, 300)=${tieSpacing}mm | Tie Ø=${tieDia}mm`,
    },
  ];

  const rows = [
    calcRow(
      `Main Vertical Bars (${mainBars}–Ø${mainDia})`,
      "M1",
      mainDia,
      mainCut,
      mainBars,
      "IS 456 Cl.26.5.3",
      lapFn(mainDia, lapFactor),
    ),
    calcRow(
      `${isCirc ? "Circular Ties" : "Lateral Ties"} Ø${tieDia}@${tieSpacing}mm`,
      "L1",
      tieDia,
      tieCut,
      tieQty,
      "IS 456 Cl.26.5.3.2",
      0,
    ),
  ];
  return {
    rows,
    warnings,
    designCards,
    meta: { ldFactor, lapFactor, steelGrade, concreteGrade, isCirc },
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   CALCULATOR 3 — SLAB  (One-way / Two-way auto-detect via Lx/Ly ratio)
   IS 456 Cl.24.1 — two-way if Ly/Lx ≤ 2, else one-way
═══════════════════════════════════════════════════════════════════════════ */
function calcSlab({ lx, ly, thickness, steelGrade, concreteGrade }) {
  const warnings = [];
  const fy = STEEL_GRADES[steelGrade].fy;
  const ldFactor = getLdFactor(steelGrade, concreteGrade);
  const lapFactor = getLapFactor(ldFactor);
  const d = thickness - COVER - 5;
  const ratio = ly / lx;
  const isTwoWay = ratio <= 2.0; // IS 456 Cl.24.1

  // Ast_min per IS 456 Cl.26.5.2.1
  const Ast_min_m =
    fy <= 415 ? 0.0012 * 1000 * thickness : 0.001 * 1000 * thickness;

  // Main bar (Lx direction)
  let mainDia = 10,
    mainSpacing = 150;
  const Ast_req_main = Math.max(Ast_min_m, 0.003 * 1000 * d);
  for (const dia of [8, 10, 12]) {
    const Abar = (Math.PI * dia * dia) / 4;
    const sp = Math.floor((Abar / Ast_req_main) * 1000);
    const maxSp = Math.min(3 * thickness, 300);
    if (sp >= 75 && sp <= maxSp) {
      mainDia = dia;
      mainSpacing = sp;
      break;
    }
  }

  // Dist / Ly bars
  const distDia = 8;
  let distSpacing;
  if (isTwoWay) {
    // Two-way: Ly bars carry actual moment too — use same Ast_req
    let distSp = 150;
    const Ast_req_dist = Math.max(Ast_min_m, 0.003 * 1000 * d);
    for (const dia of [8, 10]) {
      const Abar = (Math.PI * dia * dia) / 4;
      const sp = Math.floor((Abar / Ast_req_dist) * 1000);
      const maxSp = Math.min(3 * thickness, 300);
      if (sp >= 75 && sp <= maxSp) {
        distSp = sp;
        break;
      }
    }
    distSpacing = distSp;
  } else {
    // One-way: dist bars = 0.12% (HYSD) / 0.15% (mild)
    const Ast_dist = Ast_min_m;
    const sp2Raw = Math.floor(
      ((Math.PI * distDia * distDia) / 4 / Ast_dist) * 1000,
    );
    distSpacing = Math.min(sp2Raw, Math.min(5 * thickness, 450));
  }

  const slabType = isTwoWay ? "Two-Way" : "One-Way";
  if (isTwoWay)
    warnings.push(
      `ℹ Two-way slab detected (Ly/Lx = ${ratio.toFixed(2)} ≤ 2.0) — Both directions carry structural moments per IS 456 Cl.24.4`,
    );
  else
    warnings.push(
      `ℹ One-way slab detected (Ly/Lx = ${ratio.toFixed(2)} > 2.0) — Main bars in Lx; distribution bars in Ly per IS 456 Cl.24.1`,
    );
  if (thickness < 125)
    warnings.push("⚠ Slab thickness < 125mm — IS 456 Cl.24.1");

  const mainAst_prov = Math.round(
    ((Math.PI * mainDia * mainDia) / 4) * (1000 / mainSpacing),
  );
  const distAst_prov = Math.round(
    ((Math.PI * distDia * distDia) / 4) * (1000 / distSpacing),
  );

  const mainCut = lx + 2 * mainHook(mainDia);
  const mainQty = Math.ceil(ly / mainSpacing) + 1;
  const distCut = ly + 2 * mainHook(distDia);
  const distQty = Math.ceil(lx / distSpacing) + 1;

  const designCards = [
    {
      label: `Main Bars — Lx dir (${slabType})`,
      type: "slab-main",
      color: "#27a96b",
      qty: mainQty,
      dia: mainDia,
      spacing: mainSpacing,
      Ast_req: Math.round(Ast_req_main),
      Ast_prov: mainAst_prov,
      ld_mm: null,
      hook_mm: mainHook(mainDia),
      hook_label: `${MAIN_HOOK_FACTOR}ϕ (90°)`,
      lap_mm: null,
      clause: "IS 456 Cl.26.5.2.1 + Cl.26.3.3",
      reason: `${slabType} slab | Ly/Lx=${ratio.toFixed(2)} | Ast_min=${Math.round(Ast_min_m)}mm²/m | ${steelGrade}/${concreteGrade}`,
    },
    {
      label: isTwoWay
        ? "Main Bars — Ly dir (Two-Way)"
        : "Distribution Bars — Ly dir",
      type: "slab-dist",
      color: "#059669",
      qty: distQty,
      dia: distDia,
      spacing: distSpacing,
      Ast_req: isTwoWay ? Math.round(Ast_req_main) : null,
      Ast_prov: distAst_prov,
      ld_mm: null,
      hook_mm: mainHook(distDia),
      hook_label: `${MAIN_HOOK_FACTOR}ϕ (90°)`,
      lap_mm: null,
      clause: isTwoWay ? "IS 456 Cl.24.4 (two-way)" : "IS 456 Cl.26.5.2.1",
      reason: isTwoWay
        ? `Two-way: Ly dir also carries moment — same Ast as Lx`
        : `Dist bars=0.12%bD | Spacing≤min(5D,450)=${Math.min(5 * thickness, 450)}mm`,
    },
  ];

  const rows = [
    calcRow(
      `Main Bars Ø${mainDia}@${mainSpacing}mm (Lx — ${slabType})`,
      "M1",
      mainDia,
      mainCut,
      mainQty,
      "IS 456 Cl.26.5.2.1",
      0,
    ),
    calcRow(
      `${isTwoWay ? "Main" : "Dist"} Bars Ø${distDia}@${distSpacing}mm (Ly)`,
      "D1",
      distDia,
      distCut,
      distQty,
      "IS 456 Cl.26.5.2.1",
      0,
    ),
  ];
  return {
    rows,
    warnings,
    designCards,
    meta: { ldFactor, lapFactor, steelGrade, concreteGrade, isTwoWay, ratio },
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   CALCULATOR 4 — FOOTING
═══════════════════════════════════════════════════════════════════════════ */
function calcFooting({ length, width, thickness, steelGrade, concreteGrade }) {
  const warnings = [];
  const ldFactor = getLdFactor(steelGrade, concreteGrade);
  const lapFactor = getLapFactor(ldFactor);
  const Ast_min_m = 0.0012 * 1000 * thickness;
  const Ast_req = Math.max(Ast_min_m, 0.002 * 1000 * thickness);

  let mainDia = 16,
    spacing = 150;
  for (const dia of [12, 16, 20]) {
    const Abar = (Math.PI * dia * dia) / 4;
    const sp = Math.floor((Abar / Ast_req) * 1000);
    if (sp >= 100 && sp <= 300) {
      mainDia = dia;
      spacing = sp;
      break;
    }
  }

  if (thickness < 300)
    warnings.push(
      "⚠ Footing thickness < 300mm — check punching shear IS 456 Cl.31.6",
    );

  const footAst_prov = Math.round(
    ((Math.PI * mainDia * mainDia) / 4) * (1000 / spacing),
  );
  const barL = width - 2 * COVER + 2 * mainHook(mainDia);
  const barW = length - 2 * COVER + 2 * mainHook(mainDia);
  const qtyL = Math.ceil((length - 2 * COVER) / spacing) + 1;
  const qtyW = Math.ceil((width - 2 * COVER) / spacing) + 1;

  const designCards = [
    {
      label: "Bars along Length",
      type: "foot-l",
      color: "#8b5cf6",
      qty: qtyL,
      dia: mainDia,
      spacing,
      Ast_req: Math.round(Ast_req),
      Ast_prov: footAst_prov,
      ld_mm: ldFn(mainDia, ldFactor),
      hook_mm: mainHook(mainDia),
      hook_label: `${MAIN_HOOK_FACTOR}ϕ (90°)`,
      lap_mm: null,
      clause: "IS 456 Cl.34.1",
      reason: `Ast_min=0.12%bD=${Math.round(Ast_min_m)}mm²/m | ${steelGrade}/${concreteGrade} | Ld=${ldFactor}ϕ | Cover=50mm soil`,
    },
    {
      label: "Bars along Width",
      type: "foot-w",
      color: "#7c3aed",
      qty: qtyW,
      dia: mainDia,
      spacing,
      Ast_req: Math.round(Ast_req),
      Ast_prov: footAst_prov,
      ld_mm: ldFn(mainDia, ldFactor),
      hook_mm: mainHook(mainDia),
      hook_label: `${MAIN_HOOK_FACTOR}ϕ (90°)`,
      lap_mm: null,
      clause: "IS 456 Cl.34.1",
      reason: `Both ways reinforcement | Cover=50mm per IS 456 Cl.26.4.2`,
    },
  ];

  const rows = [
    calcRow(
      `Bars along Length Ø${mainDia}@${spacing}mm`,
      "M1",
      mainDia,
      barL,
      qtyL,
      "IS 456 Cl.34.1",
      0,
    ),
    calcRow(
      `Bars along Width  Ø${mainDia}@${spacing}mm`,
      "M2",
      mainDia,
      barW,
      qtyW,
      "IS 456 Cl.34.1",
      0,
    ),
  ];
  return {
    rows,
    warnings,
    designCards,
    meta: { ldFactor, lapFactor, steelGrade, concreteGrade },
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   ELEMENT DEFINITIONS  — now include extra fields per element type
═══════════════════════════════════════════════════════════════════════════ */
const ELEMENTS = {
  beam: {
    label: "Beam",
    icon: "⬛",
    color: "#e8552a",
    defaults: {
      span: 5000,
      width: 300,
      depth: 450,
      nSpans: 1,
      steelGrade: "Fe415",
      concreteGrade: "M20",
    },
    fields: [
      {
        id: "span",
        label: "Clear Span (mm)",
        hint: "single span / per span",
        min: 1000,
        max: 20000,
      },
      {
        id: "nSpans",
        label: "No. of Spans",
        hint: "1=simply supported, 2+ = continuous",
        min: 1,
        max: 6,
        isInt: true,
      },
      {
        id: "width",
        label: "Width b (mm)",
        hint: "beam width",
        min: 150,
        max: 1000,
      },
      {
        id: "depth",
        label: "Overall Depth D (mm)",
        hint: "including cover",
        min: 200,
        max: 2000,
      },
    ],
    calculate: calcBeam,
  },
  column: {
    label: "Column",
    icon: "🟫",
    color: "#2a6ee8",
    defaults: {
      height: 3000,
      width: 300,
      depth: 300,
      colShape: "rectangular",
      diameter: 400,
      steelGrade: "Fe415",
      concreteGrade: "M20",
    },
    fields: [
      {
        id: "height",
        label: "Column Height (mm)",
        hint: "floor to floor",
        min: 1500,
        max: 15000,
      },
      {
        id: "colShape",
        label: "Shape",
        hint: "rectangular or circular",
        type: "shape",
      },
      {
        id: "width",
        label: "Width b (mm)",
        hint: "shorter side (rect only)",
        min: 150,
        max: 1000,
        showIf: "rectangular",
      },
      {
        id: "depth",
        label: "Depth D (mm)",
        hint: "longer side (rect only)",
        min: 150,
        max: 1500,
        showIf: "rectangular",
      },
      {
        id: "diameter",
        label: "Diameter (mm)",
        hint: "circular column dia",
        min: 200,
        max: 2000,
        showIf: "circular",
      },
    ],
    calculate: calcColumn,
  },
  slab: {
    label: "Slab",
    icon: "▬",
    color: "#27a96b",
    defaults: {
      lx: 4000,
      ly: 6000,
      thickness: 150,
      steelGrade: "Fe415",
      concreteGrade: "M20",
    },
    fields: [
      {
        id: "lx",
        label: "Short Span Lx (mm)",
        hint: "shorter direction",
        min: 1000,
        max: 10000,
      },
      {
        id: "ly",
        label: "Long Span Ly (mm)",
        hint: "longer direction",
        min: 1000,
        max: 15000,
      },
      {
        id: "thickness",
        label: "Thickness D (mm)",
        hint: "min 125mm",
        min: 100,
        max: 500,
      },
    ],
    calculate: calcSlab,
  },
  footing: {
    label: "Footing",
    icon: "◼",
    color: "#8b5cf6",
    defaults: {
      length: 2000,
      width: 2000,
      thickness: 500,
      steelGrade: "Fe415",
      concreteGrade: "M20",
    },
    fields: [
      {
        id: "length",
        label: "Length (mm)",
        hint: "plan dimension",
        min: 500,
        max: 8000,
      },
      {
        id: "width",
        label: "Width (mm)",
        hint: "plan dimension",
        min: 500,
        max: 8000,
      },
      {
        id: "thickness",
        label: "Thickness (mm)",
        hint: "min 300mm",
        min: 200,
        max: 1500,
      },
    ],
    calculate: calcFooting,
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   IS CODES — grouped
═══════════════════════════════════════════════════════════════════════════ */
const IS_CODE_GROUPS = [
  {
    group: "Common — All Elements",
    icon: "📐",
    codes: [
      {
        clause: "IS 456 Cl.26.4",
        title: "Nominal Cover",
        detail:
          "Moderate: 40mm | Mild: 25mm | Severe: 45mm | Very Severe: 50mm | Extreme: 75mm",
        applies: "All elements",
      },
      {
        clause: "IS 456 Cl.26.2.1",
        title: "Development Length (Ld)",
        detail:
          "Ld = ϕ·σs/(4·τbd) | Fe415+M20=47ϕ | Fe500+M20=57ϕ | Fe415+M25=40ϕ | Fe500+M25=48ϕ | Fe415+M30=37ϕ",
        applies: "All bars",
      },
      {
        clause: "IS 456 Cl.26.2.5",
        title: "Lap Splice Length",
        detail:
          "Lap = 1.3×Ld (tension) | Bars must be staggered | Fe415+M20≈61ϕ | Fe500+M20≈74ϕ",
        applies: "All",
      },
      {
        clause: "IS 456 Cl.26.3.1",
        title: "Min Clear Bar Spacing",
        detail: "Max of: bar dia | 25mm | (4/3)×max aggregate size",
        applies: "Beam, Slab",
      },
      {
        clause: "IS 2502 / SP 34",
        title: "Hook Lengths",
        detail:
          "90° standard hook=20ϕ | 135° stirrup/tie hook=9ϕ | 180° hook=16ϕ",
        applies: "All hooked bars",
      },
    ],
  },
  {
    group: "Beam",
    icon: "⬛",
    codes: [
      {
        clause: "IS 456 Cl.26.5.2.1",
        title: "Min Ast — Beams",
        detail: "Ast_min=0.85·bw·d/fy | Max Ast=4%bD",
        applies: "Beam",
      },
      {
        clause: "IS 456 Cl.26.5.2.2",
        title: "Stirrup Spacing",
        detail: "Max Sv=0.75d or 300mm | In shear zone: 0.5d | Min dia=6mm",
        applies: "Beam stirrups",
      },
      {
        clause: "IS 456 Cl.22.5",
        title: "Multi-span / Continuous",
        detail:
          "Top bars continuous over supports | Support bars = 0.25L each side | Curtailment as per BM diagram",
        applies: "Continuous beam",
      },
    ],
  },
  {
    group: "Column",
    icon: "🟫",
    codes: [
      {
        clause: "IS 456 Cl.26.5.3.1",
        title: "Column — Longitudinal",
        detail:
          "Asc_min=0.8%Ag | Asc_max=4%Ag | Min 4 bars rectangular, Min 6 bars circular",
        applies: "Column",
      },
      {
        clause: "IS 456 Cl.26.5.3.2",
        title: "Column — Lateral Ties",
        detail: "Sv=min(least lateral dim, 16ϕ, 300mm) | Tie dia=max(ϕ/4, 6mm)",
        applies: "Column",
      },
    ],
  },
  {
    group: "Slab & Footing",
    icon: "▬",
    codes: [
      {
        clause: "IS 456 Cl.24.1",
        title: "One-way vs Two-way",
        detail:
          "Two-way slab: Ly/Lx ≤ 2 — both directions carry moments. One-way: Ly/Lx > 2 — main bars in short span only",
        applies: "Slab",
      },
      {
        clause: "IS 456 Cl.26.3.3",
        title: "Max Spacing — Slab",
        detail: "Main: min(3D,300mm) | Dist: min(5D,450mm)",
        applies: "Slab",
      },
      {
        clause: "IS 456 Cl.26.5.2.1",
        title: "Min Ast — Slab",
        detail:
          "Fe415 HYSD: 0.12%bD | Fe500/550: 0.10%bD | Mild steel: 0.15%bD",
        applies: "Slab",
      },
      {
        clause: "IS 456 Cl.24.1",
        title: "Min Slab Thickness",
        detail: "Min 125mm for RCC slabs",
        applies: "Slab",
      },
      {
        clause: "IS 456 Cl.34.1",
        title: "Footing Reinforcement",
        detail: "Ast_min=0.12%bD both ways | Cover=50mm soil face",
        applies: "Footing",
      },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   EXPORT
═══════════════════════════════════════════════════════════════════════════ */
function exportToCSV(allElements, projectInfo, steelRate) {
  const q = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [];
  lines.push([q("BAR BENDING SCHEDULE"), ...Array(9).fill(q(""))].join(","));
  lines.push(
    [
      q(`Project: ${projectInfo.projectName || "-"}`),
      q(`Engineer: ${projectInfo.engineer || "-"}`),
      q(`Location: ${projectInfo.location || "-"}`),
      ...Array(7).fill(q("")),
    ].join(","),
  );
  lines.push(
    [
      q(`Generated: ${new Date().toLocaleDateString("en-IN")}`),
      q("IS 456:2000"),
      ...Array(8).fill(q("")),
    ].join(","),
  );
  lines.push(Array(10).fill("").join(","));
  allElements.forEach((el, idx) => {
    const mat = el.meta
      ? `${el.meta.steelGrade}/${el.meta.concreteGrade} | Ld=${el.meta.ldFactor}ϕ`
      : "Fe415/M20";
    lines.push(
      [
        q(`ELEMENT ${idx + 1}: ${el.elementId} (${el.elementType}) — ${mat}`),
        ...Array(9).fill(q("")),
      ].join(","),
    );
    lines.push(
      [
        q("Mark"),
        q("Description"),
        q("Ø(mm)"),
        q("Qty"),
        q("Cut Len(mm)"),
        q("Lap(mm)"),
        q("Length(m)"),
        q("kg/m"),
        q("Weight(kg)"),
        q("IS Ref"),
      ].join(","),
    );
    el.rows.forEach((r) =>
      lines.push(
        [
          q(r.mark),
          q(r.desc),
          q(`Ø${r.dia}`),
          q(r.qty),
          q(r.cutLen),
          q(r.lapLen || 0),
          q(r.totalLenM),
          q(r.wtPerM),
          q(r.weight),
          q(r.isRef),
        ].join(","),
      ),
    );
    lines.push(
      [
        q(""),
        q("ELEMENT TOTAL"),
        q(""),
        q(""),
        q(""),
        q(""),
        q(""),
        q(""),
        q(el.totalKg + " kg"),
        q(""),
      ].join(","),
    );
    lines.push(Array(10).fill("").join(","));
  });
  const summ = buildSummary(allElements);
  lines.push(
    [q("STEEL SUMMARY BY DIAMETER"), ...Array(9).fill(q(""))].join(","),
  );
  lines.push(
    [
      q("Dia"),
      q("Weight(kg)"),
      q("12m Bars"),
      q("Cost(₹)"),
      ...Array(6).fill(q("")),
    ].join(","),
  );
  summ.byDia.forEach((s) =>
    lines.push(
      [
        q(`Ø${s.dia}`),
        q(s.totalKg),
        q(s.bars12m),
        q((s.totalKg * steelRate).toFixed(0)),
        ...Array(6).fill(q("")),
      ].join(","),
    ),
  );
  lines.push(
    [
      q("GRAND TOTAL"),
      q(summ.totalKg),
      q(""),
      q((summ.totalKg * steelRate).toFixed(0)),
      ...Array(6).fill(q("")),
    ].join(","),
  );
  const blob = new Blob(["\uFEFF" + lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(blob),
    download: `BBS_${projectInfo.projectName || "Schedule"}_${new Date().toISOString().split("T")[0]}.csv`,
  });
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ═══════════════════════════════════════════════════════════════════════════
   SVG COMPONENTS
═══════════════════════════════════════════════════════════════════════════ */
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
  const botY = H - cx - mr - 4,
    topY = cx + tr + 4;
  const botXs = Array.from(
    { length: nb },
    (_, i) => cx + 8 + (i * (bw - 16)) / Math.max(nb - 1, 1),
  );
  const topXs = [cx + 12, W - cx - 12];
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="bbs-vs-svg"
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
        fontFamily="DM Mono,monospace"
      >
        b={width}mm
      </text>
      <text
        x={W - 4}
        y={H / 2}
        textAnchor="end"
        fontSize={7.5}
        fill="#666"
        fontFamily="DM Mono,monospace"
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
        className="bbs-vs-svg"
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
          fontFamily="DM Mono,monospace"
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
  const bars = [];
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
      className="bbs-vs-svg"
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
        fontFamily="DM Mono,monospace"
      >
        {width}mm
      </text>
      <text
        x={W - 4}
        y={H / 2}
        textAnchor="end"
        fontSize={7.5}
        fill="#666"
        fontFamily="DM Mono,monospace"
        transform={`rotate(-90,${W - 4},${H / 2})`}
      >
        {depth}mm
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
      className="bbs-vs-svg"
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
        fontFamily="DM Mono,monospace"
      >
        Lx={lx}mm
      </text>
      <text
        x={W - 4}
        y={H / 2 + 14}
        textAnchor="end"
        fontSize={7.5}
        fill="#666"
        fontFamily="DM Mono,monospace"
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
      className="bbs-vs-svg"
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
        fontFamily="DM Mono,monospace"
      >
        {length}mm
      </text>
      <text
        x={cx - 4}
        y={H / 2}
        textAnchor="end"
        fontSize={7.5}
        fill="#666"
        fontFamily="DM Mono,monospace"
        transform={`rotate(-90,${cx - 4},${H / 2})`}
      >
        {width}mm
      </text>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MATERIAL SELECTOR COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
function MaterialSelector({
  steelGrade,
  concreteGrade,
  onSteelChange,
  onConcreteChange,
  ldFactor,
  lapFactor,
}) {
  return (
    <div className="bbs-material-selector">
      <div className="bbs-material-title">
        <span className="bbs-material-icon">🔧</span>
        Material Grade
      </div>
      <div className="bbs-material-row">
        <div className="bbs-material-group">
          <div className="bbs-material-label">Steel</div>
          <div className="bbs-material-pills">
            {Object.keys(STEEL_GRADES).map((g) => (
              <button
                key={g}
                className={`bbs-mat-pill ${steelGrade === g ? "active" : ""}`}
                style={{ "--mp-color": STEEL_GRADES[g].color }}
                onClick={() => onSteelChange(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
        <div className="bbs-material-group">
          <div className="bbs-material-label">Concrete</div>
          <div className="bbs-material-pills">
            {Object.keys(CONCRETE_GRADES).map((g) => (
              <button
                key={g}
                className={`bbs-mat-pill ${concreteGrade === g ? "active" : ""}`}
                style={{ "--mp-color": "#059669" }}
                onClick={() => onConcreteChange(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>
      {ldFactor && (
        <div className="bbs-material-result">
          <span>
            Ld = <b>{ldFactor}ϕ</b>
          </span>
          <span className="bbs-mat-divider" />
          <span>
            Lap = <b>{lapFactor}ϕ</b>
          </span>
          <span className="bbs-mat-divider" />
          <span className="bbs-mat-grade-tag">
            {steelGrade} / {concreteGrade}
          </span>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   VISUAL RESULT SUMMARY
═══════════════════════════════════════════════════════════════════════════ */
function VisualResultSummary({ result, elementType, inputs, steelRate }) {
  if (!result) return null;
  const totalKg = parseFloat(result.totalKg);
  const cost = (totalKg * steelRate).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });
  const dc = result.designCards || [];
  const mainCard = dc.find((c) =>
    ["main-bottom", "main-vert", "slab-main", "foot-l"].includes(c.type),
  );
  const topCard = dc.find((c) => c.type === "main-top");
  const stirCard = dc.find((c) => ["stirrup", "tie"].includes(c.type));
  const distCard = dc.find((c) => c.type === "slab-dist");

  const bullets = result.rows.map((r) => ({
    label: r.desc,
    detail: `${r.qty} × ${r.totalLenM}m = ${r.weight} kg`,
    color:
      r.mark === "M1"
        ? "#0A2647"
        : r.mark === "M2"
          ? "#144272"
          : r.mark === "S1"
            ? "#e8552a"
            : r.mark === "L1"
              ? "#2a6ee8"
              : r.mark === "D1"
                ? "#059669"
                : r.mark === "M3"
                  ? "#7c3aed"
                  : "#8b5cf6",
  }));

  let Diagram = null;
  if (elementType === "Beam" && mainCard && stirCard)
    Diagram = (
      <BeamSVG
        mainBars={mainCard.qty}
        mainDia={mainCard.dia}
        topBars={topCard?.qty || 2}
        topDia={topCard?.dia || 12}
        stirDia={stirCard.dia}
        width={inputs.width}
        depth={inputs.depth}
        nSpans={inputs.nSpans || 1}
      />
    );
  else if (elementType === "Column" && mainCard && stirCard)
    Diagram = (
      <ColumnSVG
        mainBars={mainCard.qty}
        mainDia={mainCard.dia}
        tieDia={stirCard.dia}
        width={inputs.width}
        depth={inputs.depth}
        isCirc={inputs.colShape === "circular"}
        diameter={inputs.diameter}
      />
    );
  else if (elementType === "Slab" && mainCard)
    Diagram = (
      <SlabSVG
        mainDia={mainCard.dia}
        mainSpacing={mainCard.spacing}
        distDia={distCard?.dia || 8}
        distSpacing={distCard?.spacing || 200}
        thickness={inputs.thickness}
        lx={inputs.lx}
        isTwoWay={result.meta?.isTwoWay}
      />
    );
  else if (elementType === "Footing" && mainCard)
    Diagram = (
      <FootingSVG
        mainDia={mainCard.dia}
        spacing={mainCard.spacing}
        length={inputs.length}
        width={inputs.width}
      />
    );

  return (
    <div className="bbs-vs-card">
      <div className="bbs-vs-title">
        BBS Result Summary
        {result.meta && (
          <span className="bbs-vs-grade-badge">
            {result.meta.steelGrade}/{result.meta.concreteGrade} · Ld=
            {result.meta.ldFactor}ϕ · Lap={result.meta.lapFactor}ϕ
          </span>
        )}
      </div>
      <div className="bbs-vs-body">
        {Diagram && (
          <div className="bbs-vs-diagram">
            {Diagram}
            <div className="bbs-vs-diagram-labels">
              {mainCard && (
                <span className="bbs-vs-lbl bbs-vs-lbl--bottom">
                  {elementType === "Slab" ? "Main Lx" : "Bottom Bars"}
                </span>
              )}
              {topCard && (
                <span className="bbs-vs-lbl bbs-vs-lbl--top">Top Bars</span>
              )}
              {stirCard && (
                <span className="bbs-vs-lbl bbs-vs-lbl--stir">
                  {stirCard.type === "tie" ? "Ties" : "Stirrups"}
                </span>
              )}
              {distCard && (
                <span className="bbs-vs-lbl bbs-vs-lbl--dist">
                  {result.meta?.isTwoWay ? "Main Ly" : "Dist Bars"}
                </span>
              )}
            </div>
          </div>
        )}
        <div className="bbs-vs-bullets">
          {bullets.map((b, i) => (
            <div key={i} className="bbs-vs-bullet">
              <span className="bbs-vs-dot" style={{ background: b.color }} />
              <div className="bbs-vs-bullet-text">
                <span className="bbs-vs-bullet-label">
                  {b.label.replace(/\(.*\)/, "").trim()}:
                </span>
                <span className="bbs-vs-bullet-detail">{b.detail}</span>
              </div>
            </div>
          ))}
          {mainCard?.ld_mm && (
            <div className="bbs-vs-bullet">
              <span className="bbs-vs-dot" style={{ background: "#475569" }} />
              <div className="bbs-vs-bullet-text">
                <span className="bbs-vs-bullet-label">Dev. Length:</span>
                <span className="bbs-vs-bullet-detail">
                  {result.meta?.ldFactor}ϕ ({mainCard.ld_mm}mm)
                </span>
              </div>
            </div>
          )}
          <div className="bbs-vs-total">
            <span>Total Steel:</span>
            <b>{result.totalKg} kg</b>
          </div>
          <div className="bbs-vs-cost">
            <span>Est. Cost @ ₹{steelRate}/kg:</span>
            <b>₹{cost}</b>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DESIGN CARD COMPONENT (collapsible clause)
═══════════════════════════════════════════════════════════════════════════ */
function DesignCard({ c }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bbs-dscard">
      <div className="bbs-dscard-head" style={{ background: c.color }}>
        <div className="bbs-dscard-dot" />
        <div className="bbs-dscard-head-title">{c.label}</div>
        <span className="bbs-dscard-chevron">▾</span>
      </div>
      <div className="bbs-dscard-body">
        <div className="bbs-dscard-main-row">
          <span className="bbs-dscard-qty">{c.qty}</span>
          <span className="bbs-dscard-x">×</span>
          <span className="bbs-dscard-dia" style={{ "--dc": c.color }}>
            Ø{c.dia}mm
          </span>
          {c.spacing && <span className="bbs-dscard-sp">@{c.spacing}mm</span>}
        </div>
        <div className="bbs-dscard-rows">
          {c.ld_mm && (
            <div className="bbs-dscard-row">
              <span>Dev. Length</span>
              <b>{c.ld_mm}mm</b>
            </div>
          )}
          {c.hook_mm && (
            <div className="bbs-dscard-row">
              <span>Hook Length</span>
              <b>
                {c.hook_mm}mm = {c.hook_label}
              </b>
            </div>
          )}
          {c.lap_mm && (
            <div className="bbs-dscard-row">
              <span>Lap Splice</span>
              <b>
                {c.lap_mm}mm = {c.lap_label}
              </b>
            </div>
          )}
        </div>
        {c.Ast_prov && (
          <div className="bbs-dscard-ast">
            <span className="bbs-dscard-ast-label">
              {c.Ast_req ? "Ast_req → prov" : "Ast_prov"}
            </span>
            <span className="bbs-dscard-ast-vals">
              {c.Ast_req
                ? `${c.Ast_req} → ${c.Ast_prov} mm²`
                : `${c.Ast_prov} mm²`}
            </span>
          </div>
        )}
        <div
          className={`bbs-dscard-clause-toggle ${open ? "open" : ""}`}
          onClick={() => setOpen((p) => !p)}
        >
          <span className="bbs-dscard-clause-toggle-arrow">▶</span>
          {c.clause} — {open ? "hide" : "show"} reasoning
        </div>
        <div className={`bbs-dscard-clause ${open ? "" : "hidden"}`}>
          <span className="bbs-dscard-clause-code">{c.clause}</span>
          <span className="bbs-dscard-clause-reason">{c.reason}</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   IS CODE GROUP
═══════════════════════════════════════════════════════════════════════════ */
function ISCodeGroup({ group }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className={`bbs-iscode-group ${collapsed ? "collapsed" : ""}`}>
      <div
        className="bbs-iscode-group-header"
        onClick={() => setCollapsed((p) => !p)}
      >
        <span>{group.icon}</span>
        <span>{group.group}</span>
        <span className="bbs-iscode-group-header-arrow">▾</span>
      </div>
      <div className="bbs-iscode-grid">
        {group.codes.map((c, i) => (
          <div key={i} className="bbs-iscode-card">
            <div className="bbs-iscode-clause">{c.clause}</div>
            <div className="bbs-iscode-title">{c.title}</div>
            <div className="bbs-iscode-detail">{c.detail}</div>
            <span className="bbs-iscode-applies">Applies to: {c.applies}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function BBSGenerator() {
  const [activeEl, setActiveEl] = useState("beam");
  const [inputs, setInputs] = useState(ELEMENTS.beam.defaults);
  const [result, setResult] = useState(null);
  const [allElements, setAllElements] = useState([]);
  const [steelRate, setSteelRate] = useState(78.5);
  const [projInfo, setProjInfo] = useState({
    projectName: "",
    engineer: "",
    location: "",
  });
  const [activeTab, setActiveTab] = useState("inputs");
  const [elementId, setElementId] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const wrapperTopRef = useRef(null);
  const resultPanelRef = useRef(null);
  const [stickyVisible, setStickyVisible] = useState(false);

  const cfg = ELEMENTS[activeEl];

  // Derived Ld/Lap for live display
  const liveLdFactor = useMemo(
    () =>
      getLdFactor(inputs.steelGrade || "Fe415", inputs.concreteGrade || "M20"),
    [inputs.steelGrade, inputs.concreteGrade],
  );
  const liveLapFactor = useMemo(
    () => getLapFactor(liveLdFactor),
    [liveLdFactor],
  );

  // Step indicator
  const currentStep = !result
    ? elementId
      ? 2
      : Object.values(inputs).some(
            (v, i) => v !== Object.values(cfg.defaults)[i],
          )
        ? 1
        : 0
    : 3;

  // Live estimate
  const liveEstKg = useMemo(() => {
    try {
      if (
        !Object.values(inputs).every((v) =>
          typeof v === "number" ? v > 0 : true,
        )
      )
        return null;
      const { rows } = cfg.calculate(inputs);
      return rows.reduce((a, r) => a + parseFloat(r.weight), 0).toFixed(1);
    } catch {
      return null;
    }
  }, [inputs, activeEl]);

  // Sticky scroll detect
  useEffect(() => {
    if (!resultPanelRef.current) return;
    const el = resultPanelRef.current;
    const h = () => setStickyVisible(el.scrollTop > 120);
    el.addEventListener("scroll", h);
    return () => el.removeEventListener("scroll", h);
  }, [result]);

  const handleElChange = (key) => {
    setActiveEl(key);
    setInputs(ELEMENTS[key].defaults);
    setResult(null);
    setElementId("");
    setErrors({});
  };

  const handleInput = (id, val) => {
    setInputs((p) => ({
      ...p,
      [id]: val === "" ? "" : isNaN(Number(val)) ? val : Number(val),
    }));
    setErrors((p) => ({ ...p, [id]: null }));
  };

  const validate = () => {
    const errs = {};
    cfg.fields
      .filter(
        (f) =>
          (!f.type && !f.showIf) ||
          (f.showIf && inputs.colShape === f.showIf) ||
          f.showIf === undefined,
      )
      .forEach((f) => {
        if (f.type || f.id === "nSpans" || f.id === "colShape") return;
        const visibleIf = f.showIf ? inputs.colShape === f.showIf : true;
        if (!visibleIf) return;
        const v = inputs[f.id];
        if (!v || v <= 0) {
          errs[f.id] = "Required";
          return;
        }
        if (f.min && v < f.min) errs[f.id] = `Min ${f.min}mm`;
        if (f.max && v > f.max) errs[f.id] = `Max ${f.max}mm`;
      });
    if (activeEl === "slab" && inputs.lx && inputs.ly && inputs.lx >= inputs.ly)
      errs.ly = "Ly must be > Lx (short span first)";
    return errs;
  };

  const handleCalculate = useCallback(() => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      try {
        const { rows, warnings, designCards, meta } = cfg.calculate(inputs);
        const totalKg = rows.reduce((a, r) => a + parseFloat(r.weight), 0);
        setResult({
          rows,
          warnings,
          designCards,
          totalKg: totalKg.toFixed(2),
          opt: optimizeBars(rows),
          meta,
        });
        setTimeout(() => {
          if (wrapperTopRef.current)
            wrapperTopRef.current.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          else window.scrollTo({ top: 0, behavior: "smooth" });
        }, 60);
      } catch (e) {
        setErrors({ _general: "Calculation error: " + e.message });
      }
      setIsLoading(false);
    }, 400);
  }, [activeEl, inputs]);

  const handleAdd = () => {
    if (!result) return;
    setAllElements((p) => [
      ...p,
      {
        elementType: cfg.label,
        elementId: elementId || `${cfg.label}-${p.length + 1}`,
        rows: result.rows,
        warnings: result.warnings,
        totalKg: result.totalKg,
        designCards: result.designCards,
        inputs: { ...inputs },
        meta: result.meta,
      },
    ]);
    setResult(null);
    setElementId("");
    setActiveTab("summary");
  };

  const handleRemove = (idx) =>
    setAllElements((p) => p.filter((_, i) => i !== idx));
  const summary = useMemo(() => buildSummary(allElements), [allElements]);

  const stepDefs = [
    { label: "Element" },
    { label: "Dimensions" },
    { label: "Calculate" },
    { label: "Schedule" },
  ];

  // Visible fields for column (shape-dependent)
  const visibleFields = cfg.fields.filter((f) => {
    if (f.id === "colShape") return true;
    if (f.showIf) return inputs.colShape === f.showIf;
    return true;
  });

  return (
    <div className="bbs-wrapper">
      <div ref={wrapperTopRef} style={{ position: "absolute", top: 0 }} />

      {/* HERO */}
      <div className="bbs-hero">
        <div className="bbs-hero-container">
          <div className="bbs-hero-badge">IS 456 : 2000 · Auto BBS Engine</div>
          <h1 className="bbs-hero-title">
            Bar Bending Schedule <span>Generator</span>
          </h1>
          <p className="bbs-hero-sub">
            Dimensions only — bars, spacing, Ld auto-calculated. Fe415/500/550 ·
            M20/25/30 · Multi-span · Circular column · Two-way slab
          </p>
        </div>
      </div>

      <div className="bbs-outer">
        {/* TABS */}
        <div className="bbs-tabs">
          {[
            ["inputs", "⚙ Calculate"],
            ["summary", "📊 Schedule"],
            ["iscodes", "📋 IS Codes"],
          ].map(([k, l]) => (
            <button
              key={k}
              className={`bbs-tab${activeTab === k ? " active" : ""}`}
              onClick={() => setActiveTab(k)}
            >
              {l}
              {k === "summary" && allElements.length > 0 && (
                <span className="bbs-tab-dot" />
              )}
              {k === "summary" &&
                allElements.length > 0 &&
                ` (${allElements.length})`}
            </button>
          ))}
        </div>

        {/* PROJECT BAR */}
        <div className="bbs-project-bar">
          {[
            ["projectName", "Project Name"],
            ["engineer", "Engineer / EIC"],
            ["location", "Site / Location"],
          ].map(([k, ph]) => (
            <input
              key={k}
              className="bbs-proj-input"
              placeholder={ph}
              value={projInfo[k]}
              onChange={(e) =>
                setProjInfo((p) => ({ ...p, [k]: e.target.value }))
              }
            />
          ))}
          <div className="bbs-rate-wrap">
            <span className="bbs-rate-label">Steel ₹/kg</span>
            <input
              type="number"
              className="bbs-proj-input bbs-rate-input"
              value={steelRate}
              onChange={(e) => setSteelRate(Number(e.target.value))}
            />
          </div>
        </div>

        {/* ══ TAB: INPUTS ══ */}
        {activeTab === "inputs" && (
          <div className="bbs-layout">
            {/* INPUT PANEL */}
            <div className="bbs-panel bbs-input-panel">
              {/* 01 Element selector */}
              <div className="bbs-section-label">01 — Select Element</div>
              <div className="bbs-element-dropdown-wrap">
                {Object.entries(ELEMENTS).map(([key, el]) => (
                  <button
                    key={key}
                    className={`bbs-element-seg-btn${activeEl === key ? " active" : ""}`}
                    style={{ "--seg-color": el.color }}
                    onClick={() => handleElChange(key)}
                  >
                    <span className="bbs-element-seg-icon">{el.icon}</span>
                    <span className="bbs-element-seg-label">{el.label}</span>
                  </button>
                ))}
              </div>

              {/* MATERIAL SELECTOR — NEW */}
              <MaterialSelector
                steelGrade={inputs.steelGrade || "Fe415"}
                concreteGrade={inputs.concreteGrade || "M20"}
                onSteelChange={(g) =>
                  setInputs((p) => ({ ...p, steelGrade: g }))
                }
                onConcreteChange={(g) =>
                  setInputs((p) => ({ ...p, concreteGrade: g }))
                }
                ldFactor={liveLdFactor}
                lapFactor={liveLapFactor}
              />

              {/* 02 Element ID */}
              <div className="bbs-section-label">
                02 — Element ID{" "}
                <span className="bbs-label-optional">optional</span>
              </div>
              <div className="bbs-fields bbs-fields--mb">
                <div className="bbs-field">
                  <input
                    className="bbs-input"
                    placeholder="e.g. B1, B2, C1, S1 …"
                    value={elementId}
                    onChange={(e) => setElementId(e.target.value)}
                  />
                </div>
              </div>

              {/* 03 Dimensions */}
              <div className="bbs-section-label">03 — Dimensions</div>
              <div className="bbs-fields">
                {visibleFields.map((f) => {
                  // Shape toggle for column
                  if (f.id === "colShape")
                    return (
                      <div className="bbs-field" key={f.id}>
                        <label className="bbs-field-label">Column Shape</label>
                        <div className="bbs-shape-toggle">
                          {["rectangular", "circular"].map((shape) => (
                            <button
                              key={shape}
                              className={`bbs-shape-btn${inputs.colShape === shape ? " active" : ""}`}
                              onClick={() => handleInput("colShape", shape)}
                            >
                              {shape === "rectangular"
                                ? "▬ Rectangular"
                                : "◯ Circular"}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  // nSpans: numeric stepper
                  if (f.id === "nSpans")
                    return (
                      <div className="bbs-field" key={f.id}>
                        <label className="bbs-field-label">
                          {f.label}
                          <span className="bbs-field-hint">{f.hint}</span>
                        </label>
                        <div className="bbs-stepper">
                          <button
                            className="bbs-stepper-btn"
                            onClick={() =>
                              handleInput(
                                "nSpans",
                                Math.max(1, (inputs.nSpans || 1) - 1),
                              )
                            }
                          >
                            −
                          </button>
                          <span className="bbs-stepper-val">
                            {inputs.nSpans || 1} span
                            {(inputs.nSpans || 1) > 1 ? "s" : ""}
                          </span>
                          <button
                            className="bbs-stepper-btn"
                            onClick={() =>
                              handleInput(
                                "nSpans",
                                Math.min(6, (inputs.nSpans || 1) + 1),
                              )
                            }
                          >
                            +
                          </button>
                        </div>
                        {(inputs.nSpans || 1) > 1 && (
                          <div className="bbs-span-info">
                            Total length:{" "}
                            {(
                              (inputs.span || 5000) * (inputs.nSpans || 1)
                            ).toLocaleString()}
                            mm · Support bars at {(inputs.nSpans || 1) - 1}{" "}
                            intermediate supports
                          </div>
                        )}
                      </div>
                    );
                  return (
                    <div className="bbs-field" key={f.id}>
                      <label className="bbs-field-label">
                        {f.label}
                        {f.hint && (
                          <span className="bbs-field-hint">{f.hint}</span>
                        )}
                      </label>
                      <input
                        type="number"
                        className={`bbs-input ${errors[f.id] ? "bbs-input--error" : inputs[f.id] > 0 ? "bbs-input--success" : ""}`}
                        value={inputs[f.id] ?? ""}
                        onChange={(e) => handleInput(f.id, e.target.value)}
                        onBlur={() => {
                          const ev = validate();
                          if (ev[f.id])
                            setErrors((p) => ({ ...p, [f.id]: ev[f.id] }));
                        }}
                      />
                      {errors[f.id] && (
                        <span className="bbs-field-error">
                          ⚠ {errors[f.id]}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Slab type preview */}
              {activeEl === "slab" && inputs.lx > 0 && inputs.ly > 0 && (
                <div
                  className={`bbs-slab-type-badge ${inputs.ly / inputs.lx <= 2 ? "two-way" : "one-way"}`}
                >
                  {inputs.ly / inputs.lx <= 2
                    ? `🔷 Two-Way Slab (Ly/Lx = ${(inputs.ly / inputs.lx).toFixed(2)} ≤ 2.0)`
                    : `➡ One-Way Slab (Ly/Lx = ${(inputs.ly / inputs.lx).toFixed(2)} > 2.0)`}
                </div>
              )}

              {/* Live estimate */}
              {liveEstKg && !result && (
                <div className="bbs-live-preview">
                  <span className="bbs-live-preview-pulse" />
                  <span className="bbs-live-preview-label">Live Est.</span>
                  <span className="bbs-live-preview-val">
                    ~{liveEstKg} kg · ₹
                    {(parseFloat(liveEstKg) * steelRate).toLocaleString(
                      "en-IN",
                      { maximumFractionDigits: 0 },
                    )}
                  </span>
                </div>
              )}

              {errors._general && (
                <div
                  className="bbs-warn-item bbs-warn-error"
                  style={{ marginBottom: "1rem" }}
                >
                  {errors._general}
                </div>
              )}

              {/* Assumptions */}
              <div className="bbs-assumptions">
                <div className="bbs-assumptions-title">Active Defaults</div>
                Cover: {COVER}mm | Ld: {liveLdFactor}ϕ | Hook(main):{" "}
                {MAIN_HOOK_FACTOR}ϕ | Hook(stir): {STIR_HOOK_FACTOR}ϕ | Lap:{" "}
                {liveLapFactor}ϕ | {inputs.steelGrade || "Fe415"} /{" "}
                {inputs.concreteGrade || "M20"}
              </div>

              <div className="bbs-actions">
                <button
                  className={`bbs-btn-primary ${isLoading ? "bbs-btn-loading" : ""}`}
                  onClick={handleCalculate}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="bbs-btn-spinner" />
                      <span>Calculating…</span>
                    </>
                  ) : (
                    <>
                      <span>⚙</span>
                      <span>Calculate</span>
                    </>
                  )}
                </button>
                <button
                  className="bbs-btn-ghost"
                  onClick={() => {
                    setInputs(cfg.defaults);
                    setResult(null);
                    setErrors({});
                  }}
                >
                  Reset
                </button>
              </div>
            </div>

            {/* RESULT PANEL */}
            <div className="bbs-panel bbs-result-panel" ref={resultPanelRef}>
              {!result ? (
                <div className="bbs-empty">
                  <div className="bbs-empty-icon">📐</div>
                  <h3 className="bbs-empty-title">Ready to Calculate</h3>
                  <p className="bbs-empty-sub">
                    Select material grade, enter dimensions, click Calculate.
                    Multi-span beams, circular columns and two-way slabs
                    auto-detected.
                  </p>
                </div>
              ) : (
                <>
                  {/* Sticky mini header */}
                  <div
                    className={`bbs-result-sticky ${stickyVisible ? "visible" : ""}`}
                  >
                    <span className="bbs-result-sticky-name">
                      {cfg.label}
                      {elementId && ` — ${elementId}`}
                    </span>
                    <span className="bbs-result-sticky-kg">
                      {result.totalKg} kg
                    </span>
                    <button
                      className="bbs-add-btn"
                      style={{ fontSize: "0.75rem", padding: "0.4rem 0.9rem" }}
                      onClick={handleAdd}
                    >
                      + Add
                    </button>
                  </div>

                  {/* Design cards */}
                  {result.designCards?.length > 0 && (
                    <>
                      <div className="bbs-section-label bbs-section-label--gap">
                        Auto Design Summary{" "}
                        <span className="bbs-label-optional bbs-label-optional--normal">
                          IS 456 · {result.meta?.steelGrade || "Fe415"}/
                          {result.meta?.concreteGrade || "M20"}
                        </span>
                      </div>
                      <div className="bbs-dscard-grid">
                        {result.designCards.map((c, i) => (
                          <DesignCard key={i} c={c} />
                        ))}
                      </div>
                    </>
                  )}

                  {/* Warnings */}
                  {result.warnings?.length > 0 && (
                    <div className="bbs-warnings">
                      {result.warnings.map((w, i) => (
                        <div
                          key={i}
                          className={`bbs-warn-item ${w.startsWith("ℹ") ? "bbs-warn-info" : w.includes("ERROR") ? "bbs-warn-error" : "bbs-warn-warn"}`}
                        >
                          {w}
                        </div>
                      ))}
                    </div>
                  )}

                  <VisualResultSummary
                    result={result}
                    elementType={cfg.label}
                    inputs={inputs}
                    steelRate={steelRate}
                  />

                  {/* Result header */}
                  <div className="bbs-result-header">
                    <div>
                      <div className="bbs-section-label bbs-section-label--small">
                        BBS Result
                      </div>
                      <h2 className="bbs-result-title">
                        {cfg.label}
                        {elementId && (
                          <span className="bbs-result-id"> — {elementId}</span>
                        )}
                      </h2>
                    </div>
                    <button className="bbs-add-btn" onClick={handleAdd}>
                      + Add to Schedule
                    </button>
                  </div>

                  {/* BBS Table */}
                  <div className="bbs-table-wrap">
                    <table className="bbs-table">
                      <thead>
                        <tr>
                          <th>Mark</th>
                          <th>Description</th>
                          <th>Ø</th>
                          <th>Qty</th>
                          <th>Cut Len (mm)</th>
                          <th>Lap (mm)</th>
                          <th>Length (m)</th>
                          <th>kg/m</th>
                          <th>Weight (kg)</th>
                          <th>IS Ref</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.rows.map((r, i) => (
                          <tr key={i}>
                            <td>
                              <b>{r.mark}</b>
                            </td>
                            <td className="bbs-td-desc">{r.desc}</td>
                            <td>
                              <span className="bbs-dia-badge">Ø{r.dia}</span>
                            </td>
                            <td className="bbs-td-num">{r.qty}</td>
                            <td className="bbs-td-num">
                              {Number(r.cutLen).toLocaleString()}
                            </td>
                            <td className="bbs-td-num bbs-lap">
                              {r.lapLen || 0}
                            </td>
                            <td className="bbs-td-num">{r.totalLenM}</td>
                            <td className="bbs-td-num bbs-muted">{r.wtPerM}</td>
                            <td className="bbs-td-num bbs-weight">
                              {r.weight}
                            </td>
                            <td className="bbs-is-ref">{r.isRef}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={8} className="bbs-total-label">
                            TOTAL STEEL WEIGHT
                          </td>
                          <td colSpan={2} className="bbs-total-value">
                            {result.totalKg} kg
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Cost cards */}
                  <div className="bbs-cost-cards">
                    <div className="bbs-cost-card">
                      <div className="bbs-cost-label">Total Weight</div>
                      <div className="bbs-cost-value">
                        {result.totalKg} <small>kg</small>
                      </div>
                    </div>
                    <div className="bbs-cost-card bbs-cost-highlight">
                      <div className="bbs-cost-label">Estimated Cost</div>
                      <div className="bbs-cost-value">
                        ₹
                        {(
                          parseFloat(result.totalKg) * steelRate
                        ).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </div>
                      <div className="bbs-cost-sub">@ ₹{steelRate}/kg</div>
                    </div>
                  </div>

                  {/* 12m Optimization */}
                  <div className="bbs-section-label bbs-opt-section">
                    12m Bar Optimization
                  </div>
                  <div className="bbs-opt-grid">
                    {result.opt.map((o, i) => (
                      <div key={i} className="bbs-opt-card">
                        <div className="bbs-opt-dia">Ø{o.dia}mm</div>
                        <div className="bbs-opt-row">
                          <span>Full Bars (12m)</span>
                          <b>{o.fullBars} nos</b>
                        </div>
                        <div className="bbs-opt-row">
                          <span>Pieces/Bar</span>
                          <b>{o.piecesPerBar}</b>
                        </div>
                        <div className="bbs-opt-row">
                          <span>Total Pieces</span>
                          <b>{o.totalPieces}</b>
                        </div>
                        <div
                          className={`bbs-opt-row ${parseFloat(o.wastagePct) > 8 ? "bbs-opt-waste-high" : "bbs-opt-waste"}`}
                        >
                          <span>Wastage</span>
                          <b>
                            {o.wastageM}m ({o.wastagePct}%)
                          </b>
                        </div>
                        <div className="bbs-opt-waste-bar-wrap">
                          <div
                            className={`bbs-opt-waste-bar ${parseFloat(o.wastagePct) > 8 ? "high" : ""}`}
                            style={{
                              width: `${Math.min(100, parseFloat(o.wastagePct))}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ══ TAB: SUMMARY ══ */}
        {activeTab === "summary" && (
          <div className="bbs-summ-wrap">
            {allElements.length === 0 ? (
              <div className="bbs-panel bbs-summ-empty">
                <div className="bbs-empty-icon">📋</div>
                <h3 className="bbs-empty-title">No Elements Added Yet</h3>
                <p className="bbs-empty-sub">
                  Calculate elements and click "Add to Schedule"
                </p>
              </div>
            ) : (
              <>
                <div className="bbs-el-cards">
                  {allElements.map((el, idx) => (
                    <div key={idx} className="bbs-el-card">
                      <div className="bbs-el-card-header">
                        <div>
                          <div className="bbs-el-card-title">
                            {el.elementType} — {el.elementId}
                          </div>
                          <div className="bbs-el-card-sub">
                            Element {idx + 1}
                            {el.meta && (
                              <span className="bbs-el-card-grade">
                                {" "}
                                · {el.meta.steelGrade}/{el.meta.concreteGrade} ·
                                Ld={el.meta.ldFactor}ϕ
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="bbs-el-card-actions">
                          <span className="bbs-el-card-kg">
                            {el.totalKg} kg
                          </span>
                          <button
                            className="bbs-el-remove-btn"
                            onClick={() => handleRemove(idx)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="bbs-el-card-body">
                        <div className="bbs-table-wrap">
                          <table className="bbs-table">
                            <thead>
                              <tr>
                                <th>Mark</th>
                                <th>Description</th>
                                <th>Ø</th>
                                <th>Qty</th>
                                <th>Cut Len (mm)</th>
                                <th>Lap (mm)</th>
                                <th>Length (m)</th>
                                <th>Weight (kg)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {el.rows.map((r, i) => (
                                <tr key={i}>
                                  <td>
                                    <b>{r.mark}</b>
                                  </td>
                                  <td className="bbs-td-desc">{r.desc}</td>
                                  <td>
                                    <span className="bbs-dia-badge">
                                      Ø{r.dia}
                                    </span>
                                  </td>
                                  <td className="bbs-td-num">{r.qty}</td>
                                  <td className="bbs-td-num">
                                    {Number(r.cutLen).toLocaleString()}
                                  </td>
                                  <td className="bbs-td-num bbs-lap">
                                    {r.lapLen || 0}
                                  </td>
                                  <td className="bbs-td-num">{r.totalLenM}</td>
                                  <td className="bbs-td-num bbs-weight">
                                    {r.weight}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bbs-grand-summ">
                  <div className="bbs-grand-title">
                    Grand Steel Summary — All Elements
                  </div>
                  <div className="bbs-grand-grid">
                    <div className="bbs-grand-card">
                      <div className="bbs-grand-card-label">Elements</div>
                      <div className="bbs-grand-card-val">
                        {allElements.length}
                      </div>
                    </div>
                    <div className="bbs-grand-card">
                      <div className="bbs-grand-card-label">Total Steel</div>
                      <div className="bbs-grand-card-val">
                        {summary.totalKg} <small>kg</small>
                      </div>
                    </div>
                    <div className="bbs-grand-card">
                      <div className="bbs-grand-card-label">Total Cost</div>
                      <div className="bbs-grand-card-val bbs-grand-orange">
                        ₹
                        {(summary.totalKg * steelRate).toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}
                      </div>
                    </div>
                    <div className="bbs-grand-card">
                      <div className="bbs-grand-card-label">Rate Used</div>
                      <div className="bbs-grand-card-val">
                        ₹{steelRate}
                        <small>/kg</small>
                      </div>
                    </div>
                  </div>
                  {summary.byDia.length > 0 && (
                    <>
                      <div className="bbs-grand-dia-label">
                        Steel by Diameter
                      </div>
                      <div className="bbs-grand-dia-rows">
                        {summary.byDia.map((s) => (
                          <div key={s.dia} className="bbs-grand-dia-row">
                            <div className="bbs-grand-dia-name">Ø{s.dia}mm</div>
                            <div className="bbs-grand-dia-bar-wrap">
                              <div
                                className="bbs-grand-dia-bar"
                                style={{
                                  width: `${Math.round((s.totalKg / summary.totalKg) * 100)}%`,
                                }}
                              />
                            </div>
                            <div className="bbs-grand-dia-val">
                              {s.totalKg}kg · {s.bars12m}nos
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  <div className="bbs-export-row">
                    <button
                      className="bbs-export-btn bbs-export-xlsx"
                      onClick={() =>
                        exportToCSV(allElements, projInfo, steelRate)
                      }
                    >
                      📊 Export Excel/CSV
                    </button>
                    <button
                      className="bbs-export-btn bbs-export-print"
                      onClick={() => window.print()}
                    >
                      🖨 Print Schedule
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ══ TAB: IS CODES ══ */}
        {activeTab === "iscodes" && (
          <div className="bbs-iscodes-wrap">
            <div className="bbs-iscodes-header">
              <h2 className="bbs-iscodes-title">IS 456 : 2000 Reference</h2>
              <p className="bbs-iscodes-sub">
                Grouped by element. Ld values shown for all grade combinations.
                Click group header to collapse.
              </p>
            </div>
            {/* Ld quick reference table */}
            <div className="bbs-ld-table-wrap">
              <div className="bbs-ld-table-title">
                Development Length (Ld) Quick Reference — in multiples of ϕ
              </div>
              <table className="bbs-ld-table">
                <thead>
                  <tr>
                    <th>Steel \ Concrete</th>
                    <th>M20</th>
                    <th>M25</th>
                    <th>M30</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(STEEL_GRADES).map((sg) => (
                    <tr key={sg}>
                      <td>
                        <b>{sg}</b>
                      </td>
                      {Object.keys(CONCRETE_GRADES).map((cg) => (
                        <td
                          key={cg}
                          className={
                            inputs.steelGrade === sg &&
                            inputs.concreteGrade === cg
                              ? "bbs-ld-active"
                              : ""
                          }
                        >
                          {getLdFactor(sg, cg)}ϕ
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {IS_CODE_GROUPS.map((g, i) => (
              <ISCodeGroup key={i} group={g} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
