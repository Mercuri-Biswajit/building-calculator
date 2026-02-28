import { useState, useCallback, useMemo } from "react";
import "../styles/pages/_bbs-generator.css";

/* ═══════════════════════════════════════════════════════════════════════════
   IS 456 : 2000 — ENGINEERING CONSTANTS  (corrected)
═══════════════════════════════════════════════════════════════════════════ */
const COVER            = 40;    // mm – IS 456 Cl.26.4 moderate exposure
const LD_FACTOR        = 47;    // Exact: Fe415 + M20 tension bar (IS 456 Cl.26.2.1)
const MAIN_HOOK_FACTOR = 20;    // 90° standard hook – IS 2502 / SP 34
const STIR_HOOK_FACTOR = 9;     // 135° stirrup/tie hook – SP 34
const LAP_FACTOR       = 50;    // Lap splice = 50ϕ (≥1.3Ld) – IS 456 Cl.26.2.5
const BAR_LEN          = 12000; // Standard mill bar length (mm)
const FY               = 415;   // Fe415
const FCK              = 20;    // M20

const BAR_WEIGHTS = { 8:0.395, 10:0.617, 12:0.888, 16:1.578, 20:2.466, 25:3.853, 32:6.313 };

/* ═══════════════════════════════════════════════════════════════════════════
   AUTO-SELECTION LOGIC
═══════════════════════════════════════════════════════════════════════════ */
function pickBars(Ast_req, availWidth, cover, stirDia = 8) {
  for (const dia of [10, 12, 16, 20, 25, 32]) {
    const Abar      = Math.PI * dia * dia / 4;
    const n         = Math.ceil(Ast_req / Abar);
    const clearSpan = availWidth - 2 * cover - 2 * stirDia;
    const spacePerBar = clearSpan / n;
    const minSpacing  = Math.max(dia, 25); // IS 456 Cl.26.3.1
    if (spacePerBar >= minSpacing && n >= 2 && n <= 10)
      return { dia, n, Ast_prov: Math.round(Abar * n) };
  }
  return { dia: 16, n: 4, Ast_prov: Math.round(4 * Math.PI * 64) };
}

function pickStirDia(mainDia)  { return mainDia >= 20 ? 10 : 8; }
function pickTieDia(mainDia)   { return Math.max(6, Math.floor(mainDia / 4)); }

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════════════════ */
const wtPer    = d => BAR_WEIGHTS[d] || 0;
const ld       = d => LD_FACTOR * d;
const mainHook = d => MAIN_HOOK_FACTOR * d;
const stirHook = d => STIR_HOOK_FACTOR * d;
const lap      = d => LAP_FACTOR * d;

function calcRow(desc, mark, dia, cutLen, qty, isRef, addLap = false, isStirrup = false) {
  const hookLen   = isStirrup ? stirHook(dia) : 0;
  const lapLen    = addLap ? lap(dia) : 0;
  const totalMm   = (cutLen + lapLen) * qty;
  const totalLenM = (totalMm / 1000).toFixed(2);
  const weight    = (wtPer(dia) * totalMm / 1000).toFixed(2);
  return { desc, mark, dia, cutLen: Math.round(cutLen), lapLen: Math.round(lapLen),
           qty, totalLenM, wtPerM: wtPer(dia).toFixed(3), weight, isRef };
}

function optimizeBars(rows) {
  const byDia = {};
  rows.forEach(r => { if (!byDia[r.dia]) byDia[r.dia] = []; byDia[r.dia].push(r); });
  return Object.entries(byDia).map(([dia, rs]) => {
    const d            = Number(dia);
    const totalPieces  = rs.reduce((a, r) => a + r.qty, 0);
    const cutLen       = rs[0]?.cutLen || 0;
    const piecesPerBar = cutLen > 0 ? Math.floor(BAR_LEN / cutLen) || 1 : 1;
    const fullBars     = Math.ceil(totalPieces / piecesPerBar);
    const totalUsed    = totalPieces * cutLen;
    const totalPurchd  = fullBars * BAR_LEN;
    const wastageM     = ((totalPurchd - totalUsed) / 1000).toFixed(2);
    const wastagePct   = totalPurchd > 0 ? (((totalPurchd - totalUsed) / totalPurchd) * 100).toFixed(1) : "0.0";
    return { dia: d, fullBars, piecesPerBar, totalPieces, wastageM, wastagePct };
  });
}

function buildSummary(allElements) {
  const byDia = {};
  allElements.forEach(el => el.rows.forEach(r => {
    if (!byDia[r.dia]) byDia[r.dia] = 0;
    byDia[r.dia] += parseFloat(r.weight);
  }));
  let totalKg = 0;
  const arr = Object.entries(byDia).sort((a,b) => a[0]-b[0]).map(([dia, kg]) => {
    const rounded = parseFloat(kg.toFixed(2));
    totalKg += rounded;
    const bars12m = Math.ceil(rounded / wtPer(Number(dia)) * 1000 / BAR_LEN + 0.5);
    return { dia: Number(dia), totalKg: rounded, bars12m };
  });
  return { byDia: arr, totalKg: parseFloat(totalKg.toFixed(2)) };
}

/* ═══════════════════════════════════════════════════════════════════════════
   CALCULATORS  (IS 456 corrected — Ld=47ϕ, mainHook=20ϕ, stirHook=9ϕ)
═══════════════════════════════════════════════════════════════════════════ */
function calcBeam({ span, width, depth }) {
  const warnings = [];
  const bw         = width - 2 * COVER;
  const d          = depth - COVER - 8 - 8;   // d = D - cover - stirDia - mainDia/2 (approx)
  const Ast_min    = (0.85 * bw * d) / FY;     // IS 456 Cl.26.5.2.1
  const Ast_req    = Math.max(Ast_min, 0.004 * bw * d);
  const stirDia    = pickStirDia(16);
  const { dia: mainDia, n: mainBars, Ast_prov } = pickBars(Ast_req, width, COVER, stirDia);
  const auto_stirDia    = pickStirDia(mainDia);
  const stirrupSpacing  = Math.round(Math.min(0.75 * d, 300)); // IS 456 Cl.26.5.2.2
  const topBars = 2;
  const topDia  = mainDia >= 16 ? 12 : 10;

  if (Ast_prov < Ast_min)
    warnings.push(`⚠ Ast provided (${Ast_prov}mm²) < Ast_min (${Ast_min.toFixed(0)}mm²) — IS 456 Cl.26.5.2.1`);
  if (depth < span / 12)
    warnings.push(`⚠ Depth/Span = ${(depth/span).toFixed(2)} < 1/12 — check deflection IS 456 Cl.23.2`);
  if (width < 200)
    warnings.push("⚠ Beam width < 200mm — structural adequacy check needed");

  const designCards = [
    {
      label: "Bottom Main Bars", type: "main-bottom", color: "#0A2647",
      qty: mainBars, dia: mainDia, spacing: null,
      Ast_req: Math.round(Ast_req), Ast_prov,
      ld_mm: ld(mainDia), hook_mm: mainHook(mainDia), hook_label: `${MAIN_HOOK_FACTOR}ϕ (90°)`,
      lap_mm: lap(mainDia), lap_label: `${LAP_FACTOR}ϕ`,
      clause: "IS 456 Cl.26.5.2.1",
      reason: `Ast_min = 0.85·bw·d/fy = ${Ast_min.toFixed(0)}mm² | 0.4% governs = ${Ast_req.toFixed(0)}mm²`,
    },
    {
      label: "Top Hanger Bars", type: "main-top", color: "#144272",
      qty: topBars, dia: topDia, spacing: null,
      Ast_req: null, Ast_prov: Math.round(topBars * Math.PI * topDia * topDia / 4),
      ld_mm: ld(topDia), hook_mm: mainHook(topDia), hook_label: `${MAIN_HOOK_FACTOR}ϕ (90°)`,
      lap_mm: lap(topDia), lap_label: `${LAP_FACTOR}ϕ`,
      clause: "IS 456 Cl.26.5.1.2",
      reason: "Min 2 top bars as hanger/compression steel throughout span",
    },
    {
      label: "Stirrups (2-legged)", type: "stirrup", color: "#e8552a",
      qty: Math.ceil(span / stirrupSpacing) + 1, dia: auto_stirDia, spacing: stirrupSpacing,
      Ast_req: null, Ast_prov: null,
      ld_mm: null, hook_mm: stirHook(auto_stirDia), hook_label: `${STIR_HOOK_FACTOR}ϕ (135°)`,
      lap_mm: null,
      clause: "IS 456 Cl.26.5.2.2",
      reason: `Sv = min(0.75d, 300) = min(${Math.round(0.75*d)}, 300) = ${stirrupSpacing}mm`,
    },
  ];

  const mainCut = span + 2 * ld(mainDia) + 2 * mainHook(mainDia) - 2 * COVER;
  const topCut  = span + 2 * ld(topDia)  + 2 * mainHook(topDia)  - 2 * COVER;
  const perim   = 2 * ((width - 2*COVER) + (depth - 2*COVER));
  const stirCut = perim + 2 * stirHook(auto_stirDia);
  const stirQty = Math.ceil(span / stirrupSpacing) + 1;

  const rows = [
    calcRow(`Bottom Main Bars (${mainBars}–Ø${mainDia})`,           "M1", mainDia,     mainCut, mainBars, "IS 456 Cl.26.5.2",   true,  false),
    calcRow(`Top Hanger Bars (${topBars}–Ø${topDia})`,              "M2", topDia,      topCut,  topBars,  "IS 456 Cl.26.5.2",   true,  false),
    calcRow(`Stirrups Ø${auto_stirDia} @ ${stirrupSpacing}mm c/c`,  "S1", auto_stirDia,stirCut, stirQty,  "IS 456 Cl.26.5.2.2", false, true),
  ];
  return { rows, warnings, designCards };
}

function calcColumn({ height, width, depth }) {
  const warnings = [];
  const Ag         = width * depth;
  const Ast_min    = 0.008 * Ag;
  const Ast_req    = Math.max(Ast_min, 0.01 * Ag);
  const { dia: mainDia, n: mainBars, Ast_prov } = pickBars(Ast_req, Math.min(width, depth), COVER, 8);
  const tieDia     = pickTieDia(mainDia);
  const tieSpacing = Math.round(Math.min(Math.min(width, depth), 16 * mainDia, 300)); // IS 456 Cl.26.5.3.2

  if (Ast_prov < Ast_min)
    warnings.push(`⚠ Asc (${Ast_prov}mm²) < 0.8%Ag (${Ast_min.toFixed(0)}mm²) — IS 456 Cl.26.5.3.1`);
  if (mainBars < 4)
    warnings.push("⚠ Min 4 bars for rectangular column — IS 456 Cl.26.5.3.1");
  if (width < 200 || depth < 200)
    warnings.push("⚠ Column dimension < 200mm — check adequacy");

  const designCards = [
    {
      label: "Main Vertical Bars", type: "main-vert", color: "#2a6ee8",
      qty: mainBars, dia: mainDia, spacing: null,
      Ast_req: Math.round(Ast_req), Ast_prov,
      ld_mm: ld(mainDia), hook_mm: null, lap_mm: lap(mainDia), lap_label: `${LAP_FACTOR}ϕ`,
      clause: "IS 456 Cl.26.5.3.1",
      reason: `Asc_min = 0.8%Ag = ${Ast_min.toFixed(0)}mm² | used 1%Ag = ${Ast_req.toFixed(0)}mm²`,
    },
    {
      label: "Lateral Ties", type: "tie", color: "#1e40af",
      qty: Math.ceil(height / tieSpacing) + 1, dia: tieDia, spacing: tieSpacing,
      Ast_req: null, Ast_prov: null,
      ld_mm: null, hook_mm: stirHook(tieDia), hook_label: `${STIR_HOOK_FACTOR}ϕ (135°)`, lap_mm: null,
      clause: "IS 456 Cl.26.5.3.2",
      reason: `Sv = min(b=${width}, 16ϕ=${16*mainDia}, 300) = ${tieSpacing}mm`,
    },
  ];

  const mainCut  = height + 2 * ld(mainDia);
  const tiePerim = 2 * ((width - 2*COVER) + (depth - 2*COVER));
  const tieCut   = tiePerim + 2 * stirHook(tieDia);
  const tieQty   = Math.ceil(height / tieSpacing) + 1;

  const rows = [
    calcRow(`Main Vertical Bars (${mainBars}–Ø${mainDia})`,   "M1", mainDia, mainCut, mainBars, "IS 456 Cl.26.5.3",   true,  false),
    calcRow(`Lateral Ties Ø${tieDia} @ ${tieSpacing}mm c/c`, "L1", tieDia,  tieCut,  tieQty,   "IS 456 Cl.26.5.3.2", false, true),
  ];
  return { rows, warnings, designCards };
}

function calcSlab({ lx, ly, thickness }) {
  const warnings = [];
  const d          = thickness - COVER - 5;
  const Ast_min_m  = 0.0012 * 1000 * thickness; // IS 456 Cl.26.5.2.1 HYSD
  const Ast_req    = Math.max(Ast_min_m, 0.003 * 1000 * d);

  let mainDia = 10, mainSpacing = 150;
  for (const dia of [8, 10, 12]) {
    const Abar = Math.PI * dia * dia / 4;
    const sp   = Math.floor((Abar / Ast_req) * 1000);
    const maxSp = Math.min(3 * thickness, 300); // IS 456 Cl.26.3.3
    if (sp >= 100 && sp <= maxSp) { mainDia = dia; mainSpacing = sp; break; }
  }

  const distDia     = 8;
  const Ast_dist    = Math.max(Ast_min_m, 0.0006 * 1000 * d);
  const sp2Raw      = Math.floor((Math.PI * distDia * distDia / 4) / Ast_dist * 1000);
  const distSpacing = Math.min(sp2Raw, Math.min(5 * thickness, 450));

  if (thickness < 125) warnings.push("⚠ Slab thickness < 125mm — IS 456 Cl.24.1");
  if (mainSpacing > 3 * thickness || mainSpacing > 300)
    warnings.push(`⚠ Main bar spacing ${mainSpacing}mm > 3D or 300mm — IS 456 Cl.26.3.3`);

  const mainAst_prov = Math.round((Math.PI * mainDia * mainDia / 4) * (1000 / mainSpacing));
  const distAst_prov = Math.round((Math.PI * distDia * distDia / 4) * (1000 / distSpacing));

  const designCards = [
    {
      label: "Main Bars (Lx direction)", type: "slab-main", color: "#27a96b",
      qty: Math.ceil(ly / mainSpacing) + 1, dia: mainDia, spacing: mainSpacing,
      Ast_req: Math.round(Ast_req), Ast_prov: mainAst_prov,
      ld_mm: null, hook_mm: mainHook(mainDia), hook_label: `${MAIN_HOOK_FACTOR}ϕ (90°)`, lap_mm: null,
      clause: "IS 456 Cl.26.5.2.1 + Cl.26.3.3",
      reason: `Ast_min/m = 0.12%bD = ${Math.round(Ast_min_m)}mm²/m | Spacing ≤ min(3D,300) = ${Math.min(3*thickness,300)}mm`,
    },
    {
      label: "Distribution Bars (Ly dir)", type: "slab-dist", color: "#059669",
      qty: Math.ceil(lx / distSpacing) + 1, dia: distDia, spacing: distSpacing,
      Ast_req: null, Ast_prov: distAst_prov,
      ld_mm: null, hook_mm: mainHook(distDia), hook_label: `${MAIN_HOOK_FACTOR}ϕ (90°)`, lap_mm: null,
      clause: "IS 456 Cl.26.5.2.1",
      reason: `Dist bars = 0.12%bD | Spacing ≤ min(5D,450) = ${Math.min(5*thickness,450)}mm`,
    },
  ];

  const mainCut = lx + 2 * mainHook(mainDia);
  const mainQty = Math.ceil(ly / mainSpacing) + 1;
  const distCut = ly + 2 * mainHook(distDia);
  const distQty = Math.ceil(lx / distSpacing) + 1;

  const rows = [
    calcRow(`Main Bars Ø${mainDia} @ ${mainSpacing}mm (Lx dir)`, "M1", mainDia, mainCut, mainQty, "IS 456 Cl.26.5.2.1", false),
    calcRow(`Dist Bars Ø${distDia} @ ${distSpacing}mm (Ly dir)`, "D1", distDia, distCut, distQty, "IS 456 Cl.26.5.2.1", false),
  ];
  return { rows, warnings, designCards };
}

function calcFooting({ length, width, thickness }) {
  const warnings  = [];
  const Ast_min_m = 0.0012 * 1000 * thickness;
  const Ast_req   = Math.max(Ast_min_m, 0.002 * 1000 * thickness);

  let mainDia = 16, spacing = 150;
  for (const dia of [12, 16, 20]) {
    const Abar = Math.PI * dia * dia / 4;
    const sp   = Math.floor((Abar / Ast_req) * 1000);
    if (sp >= 100 && sp <= 300) { mainDia = dia; spacing = sp; break; }
  }

  if (thickness < 300)
    warnings.push("⚠ Footing thickness < 300mm — check punching shear IS 456 Cl.31.6");

  const footAst_prov = Math.round((Math.PI * mainDia * mainDia / 4) * (1000 / spacing));

  const designCards = [
    {
      label: "Bars along Length", type: "foot-l", color: "#8b5cf6",
      qty: Math.ceil((length - 2 * COVER) / spacing) + 1, dia: mainDia, spacing,
      Ast_req: Math.round(Ast_req), Ast_prov: footAst_prov,
      ld_mm: ld(mainDia), hook_mm: mainHook(mainDia), hook_label: `${MAIN_HOOK_FACTOR}ϕ (90°)`, lap_mm: null,
      clause: "IS 456 Cl.34.1",
      reason: `Ast_min = 0.12%bD = ${Math.round(Ast_min_m)}mm²/m | spacing ≤ 300mm | Cover 50mm (soil)`,
    },
    {
      label: "Bars along Width", type: "foot-w", color: "#7c3aed",
      qty: Math.ceil((width - 2 * COVER) / spacing) + 1, dia: mainDia, spacing,
      Ast_req: Math.round(Ast_req), Ast_prov: footAst_prov,
      ld_mm: ld(mainDia), hook_mm: mainHook(mainDia), hook_label: `${MAIN_HOOK_FACTOR}ϕ (90°)`, lap_mm: null,
      clause: "IS 456 Cl.34.1",
      reason: `Both ways reinforcement required | Cover = 50mm (soil face per IS 456 Cl.26.4.2)`,
    },
  ];

  const barL = width  - 2 * COVER + 2 * mainHook(mainDia);
  const barW = length - 2 * COVER + 2 * mainHook(mainDia);
  const qtyL = Math.ceil((length - 2 * COVER) / spacing) + 1;
  const qtyW = Math.ceil((width  - 2 * COVER) / spacing) + 1;

  const rows = [
    calcRow(`Bars along Length Ø${mainDia} @ ${spacing}mm`, "M1", mainDia, barL, qtyL, "IS 456 Cl.34.1", false),
    calcRow(`Bars along Width  Ø${mainDia} @ ${spacing}mm`, "M2", mainDia, barW, qtyW, "IS 456 Cl.34.1", false),
  ];
  return { rows, warnings, designCards };
}

/* ═══════════════════════════════════════════════════════════════════════════
   ELEMENT DEFINITIONS
═══════════════════════════════════════════════════════════════════════════ */
const ELEMENTS = {
  beam:    { label:"Beam",    icon:"⬛", color:"#e8552a", defaults:{ span:5000, width:300, depth:450 },
             fields:[ {id:"span",label:"Clear Span (mm)",hint:"c/c length"}, {id:"width",label:"Width b (mm)",hint:"beam width"}, {id:"depth",label:"Overall Depth D (mm)",hint:"including cover"} ], calculate:calcBeam },
  column:  { label:"Column",  icon:"🟫", color:"#2a6ee8", defaults:{ height:3000, width:300, depth:300 },
             fields:[ {id:"height",label:"Column Height (mm)",hint:"floor to floor"}, {id:"width",label:"Width b (mm)",hint:"shorter dimension"}, {id:"depth",label:"Depth D (mm)",hint:"longer dimension"} ], calculate:calcColumn },
  slab:    { label:"Slab",    icon:"▬",  color:"#27a96b", defaults:{ lx:4000, ly:6000, thickness:150 },
             fields:[ {id:"lx",label:"Short Span Lx (mm)",hint:"shorter direction"}, {id:"ly",label:"Long Span Ly (mm)",hint:"longer direction"}, {id:"thickness",label:"Thickness D (mm)",hint:"min 125mm"} ], calculate:calcSlab },
  footing: { label:"Footing", icon:"◼",  color:"#8b5cf6", defaults:{ length:2000, width:2000, thickness:500 },
             fields:[ {id:"length",label:"Length (mm)",hint:"plan dimension"}, {id:"width",label:"Width (mm)",hint:"plan dimension"}, {id:"thickness",label:"Thickness (mm)",hint:"min 300mm"} ], calculate:calcFooting },
};

/* ═══════════════════════════════════════════════════════════════════════════
   IS CODE REFERENCE DATA  (updated Ld value)
═══════════════════════════════════════════════════════════════════════════ */
const IS_CODES = [
  { clause:"IS 456 Cl.26.4",   title:"Nominal Cover",              detail:"Moderate: 40mm | Mild: 25mm | Severe: 45mm | Very Severe: 50mm | Extreme: 75mm",                                        applies:"All elements" },
  { clause:"IS 456 Cl.26.2.1", title:"Development Length (Ld)",    detail:"Ld = ϕ·σs / (4·τbd) = 47ϕ for Fe415 + M20 tension bar (exact formula value)",                                         applies:"All bars" },
  { clause:"IS 456 Cl.26.2.5", title:"Lap Splice Length",          detail:"Lap = 1.3 × Ld ≈ 50ϕ minimum for tension bars | Bars must be staggered",                                              applies:"Beam, Column" },
  { clause:"IS 456 Cl.26.3.1", title:"Min Clear Bar Spacing",      detail:"Max of: bar dia | 25mm | (4/3) × max aggregate size",                                                                   applies:"Beam, Slab" },
  { clause:"IS 456 Cl.26.3.3", title:"Max Spacing — Slab",         detail:"Main bars: min(3D, 300mm) | Distribution bars: min(5D, 450mm)",                                                        applies:"Slab" },
  { clause:"IS 456 Cl.26.5.2.1",title:"Min Ast — Beams",          detail:"Ast_min = 0.85·bw·d / fy | Max Ast = 4% bD",                                                                           applies:"Beam" },
  { clause:"IS 456 Cl.26.5.2.2",title:"Stirrup Spacing — Beams",  detail:"Max Sv = 0.75d or 300mm | In shear zone: 0.5d | Min dia = 6mm",                                                       applies:"Beam stirrups" },
  { clause:"IS 456 Cl.26.5.3.1",title:"Column — Longitudinal",    detail:"Asc_min = 0.8% Ag | Asc_max = 4% Ag (6% at splices) | Min 4 bars rectangular",                                        applies:"Column" },
  { clause:"IS 456 Cl.26.5.3.2",title:"Column — Lateral Ties",    detail:"Sv = min(least lateral dim, 16ϕ_main, 300mm) | Tie dia = max(ϕ_main/4, 6mm)",                                        applies:"Column ties" },
  { clause:"IS 456 Cl.26.5.2.1",title:"Min Ast — Slab/Footing",   detail:"HYSD: 0.12% bD | Mild steel: 0.15% bD",                                                                               applies:"Slab, Footing" },
  { clause:"IS 456 Cl.24.1",   title:"Min Slab Thickness",         detail:"Min 125mm for RCC slabs (without special deflection study)",                                                            applies:"Slab" },
  { clause:"IS 456 Cl.34.1",   title:"Footing Reinforcement",      detail:"Ast_min = 0.12% bD both ways | Cover = 50mm soil face (Cl.26.4.2)",                                                   applies:"Footing" },
  { clause:"IS 2502 / SP 34",  title:"Hook Lengths",               detail:"90° standard hook = 20ϕ | 135° stirrup/tie hook = 9ϕ | 180° hook = 16ϕ",                                             applies:"All hooked bars" },
];

/* ═══════════════════════════════════════════════════════════════════════════
   EXCEL / CSV EXPORT
═══════════════════════════════════════════════════════════════════════════ */
function exportToCSV(allElements, projectInfo, steelRate) {
  const q = v => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [];
  lines.push([q("BAR BENDING SCHEDULE"), q(""), q(""), q(""), q(""), q(""), q(""), q(""), q(""), q("")].join(","));
  lines.push([q(`Project: ${projectInfo.projectName||"-"}`), q(`Engineer: ${projectInfo.engineer||"-"}`), q(`Location: ${projectInfo.location||"-"}`), ...Array(7).fill(q(""))].join(","));
  lines.push([q(`Generated: ${new Date().toLocaleDateString("en-IN")}`), q("IS 456:2000 | Fe415 / M20"), ...Array(8).fill(q(""))].join(","));
  lines.push(Array(10).fill("").join(","));
  allElements.forEach((el, idx) => {
    lines.push([q(`ELEMENT ${idx+1}: ${el.elementId} (${el.elementType})`), ...Array(9).fill(q(""))].join(","));
    lines.push([q("Mark"),q("Description"),q("Dia (mm)"),q("Qty"),q("Cut Length (mm)"),q("Lap (mm)"),q("Total Length (m)"),q("Wt/m (kg/m)"),q("Weight (kg)"),q("IS Reference")].join(","));
    el.rows.forEach(r => lines.push([q(r.mark),q(r.desc),q(`Ø${r.dia}`),q(r.qty),q(r.cutLen),q(r.lapLen||0),q(r.totalLenM),q(r.wtPerM),q(r.weight),q(r.isRef)].join(",")));
    lines.push([q(""),q("ELEMENT TOTAL"),q(""),q(""),q(""),q(""),q(""),q(""),q(el.totalKg+" kg"),q("")].join(","));
    lines.push(Array(10).fill("").join(","));
  });
  const summ = buildSummary(allElements);
  lines.push([q("STEEL SUMMARY BY DIAMETER"), ...Array(9).fill(q(""))].join(","));
  lines.push([q("Diameter"),q("Weight (kg)"),q("12m Bars"),q("Cost (₹)"), ...Array(6).fill(q(""))].join(","));
  summ.byDia.forEach(s => lines.push([q(`Ø${s.dia}`),q(s.totalKg),q(s.bars12m),q((s.totalKg*steelRate).toFixed(0)), ...Array(6).fill(q(""))].join(",")));
  lines.push([q("GRAND TOTAL"),q(summ.totalKg),q(""),q((summ.totalKg*steelRate).toFixed(0)), ...Array(6).fill(q(""))].join(","));
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type:"text/csv;charset=utf-8;" });
  const a = Object.assign(document.createElement("a"), { href:URL.createObjectURL(blob), download:`BBS_${projectInfo.projectName||"Schedule"}_${new Date().toISOString().split("T")[0]}.csv` });
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   VISUAL RESULT SUMMARY — SVG cross-section + bullet summary
   Renders element-specific diagram with labelled bars
═══════════════════════════════════════════════════════════════════════════ */

function BeamSVG({ mainBars, mainDia, topBars, topDia, stirDia, width, depth }) {
  const W = 220, H = 140;
  const cx = COVER, bw = W - 2*cx, bh = H - 2*cx;
  // bar radii scaled for visual clarity
  const mr = Math.min(7, Math.max(4, mainDia / 3.5));
  const tr = Math.min(5, Math.max(3, topDia / 4));
  const sr = Math.max(2, stirDia / 4);
  // bottom bars spread
  const nb = Math.min(mainBars, 6);
  const botY = H - cx - mr - 4;
  const topY = cx + tr + 4;
  const botXs = Array.from({length: nb}, (_, i) => cx + 8 + (i * (bw - 16)) / Math.max(nb - 1, 1));
  const topXs = [cx + 12, W - cx - 12];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="bbs-vs-svg" aria-label="Beam cross-section">
      {/* Concrete outline */}
      <rect x={1} y={1} width={W-2} height={H-2} rx={3}
        fill="#f0efe8" stroke="#b0a080" strokeWidth={2} />
      {/* Stirrup */}
      <rect x={cx-sr} y={cx-sr} width={bw+2*sr} height={bh+2*sr} rx={2}
        fill="none" stroke="#e8552a" strokeWidth={Math.max(1.5, sr*1.2)} />
      {/* Bottom main bars */}
      {botXs.map((x, i) => (
        <g key={i}>
          <circle cx={x} cy={botY} r={mr} fill="#0A2647" stroke="#fff" strokeWidth={1} />
          {i === 0 && (
            <line x1={x} y1={botY + mr + 2} x2={x} y2={H+12}
              stroke="#0A2647" strokeWidth={0.7} strokeDasharray="2,2" />
          )}
        </g>
      ))}
      {nb < mainBars && (
        <text x={W - cx - 6} y={botY + 1} textAnchor="middle" fontSize={8} fill="#0A2647" fontWeight="700">+{mainBars - nb}</text>
      )}
      {/* Top hanger bars */}
      {topXs.map((x, i) => (
        <circle key={i} cx={x} cy={topY} r={tr} fill="#144272" stroke="#fff" strokeWidth={1} />
      ))}
      {/* Labels */}
      <text x={W/2} y={H - 3} textAnchor="middle" fontSize={7.5} fill="#666" fontFamily="DM Mono, monospace">
        b = {width}mm
      </text>
      <text x={W - 4} y={H/2} textAnchor="end" fontSize={7.5} fill="#666" fontFamily="DM Mono, monospace"
        transform={`rotate(-90, ${W-4}, ${H/2})`}>D = {depth}mm</text>
      {/* Annotation lines */}
      <line x1={botXs[0]} y1={botY - mr - 2} x2={botXs[0] - 18} y2={botY - 18}
        stroke="#0A2647" strokeWidth={0.8} />
      <text x={botXs[0] - 22} y={botY - 20} textAnchor="end" fontSize={7} fill="#0A2647" fontWeight="600">
        {mainBars}×Ø{mainDia}
      </text>
      <line x1={topXs[1]} y1={topY + tr + 2} x2={topXs[1] + 12} y2={topY + 22}
        stroke="#144272" strokeWidth={0.8} />
      <text x={topXs[1] + 14} y={topY + 24} fontSize={7} fill="#144272" fontWeight="600">
        {topBars}×Ø{topDia}
      </text>
      {/* Stirrup label */}
      <text x={3} y={H/2 - 4} fontSize={7} fill="#e8552a" fontWeight="600"
        transform={`rotate(-90, 9, ${H/2})`}>Ø{stirDia}</text>
    </svg>
  );
}

function ColumnSVG({ mainBars, mainDia, tieDia, width, depth }) {
  const W = 180, H = 180;
  const cx = COVER;
  const mr = Math.min(8, Math.max(4, mainDia / 3));
  // Place bars on perimeter
  const bars = [];
  const barsPerSide = Math.max(2, Math.floor(mainBars / 4));
  const sides = [
    { x0: cx + mr, y0: cx + mr, dx: (W - 2*cx - 2*mr) / (barsPerSide - 1), dy: 0, n: barsPerSide },
    { x0: W - cx - mr, y0: cx + mr, dx: 0, dy: (H - 2*cx - 2*mr) / (barsPerSide - 1), n: barsPerSide },
    { x0: W - cx - mr, y0: H - cx - mr, dx: -(W - 2*cx - 2*mr) / (barsPerSide - 1), dy: 0, n: barsPerSide },
    { x0: cx + mr, y0: H - cx - mr, dx: 0, dy: -(H - 2*cx - 2*mr) / (barsPerSide - 1), n: barsPerSide },
  ];
  const seen = new Set();
  sides.forEach(s => {
    for (let i = 0; i < s.n; i++) {
      const bx = Math.round(s.x0 + i * s.dx);
      const by = Math.round(s.y0 + i * s.dy);
      const key = `${bx},${by}`;
      if (!seen.has(key)) { seen.add(key); bars.push({ x: bx, y: by }); }
    }
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="bbs-vs-svg" aria-label="Column cross-section">
      <rect x={1} y={1} width={W-2} height={H-2} rx={3} fill="#f0efe8" stroke="#b0a080" strokeWidth={2} />
      {/* Tie */}
      <rect x={cx-2} y={cx-2} width={W-2*cx+4} height={H-2*cx+4} rx={2}
        fill="none" stroke="#2a6ee8" strokeWidth={2} strokeDasharray="4,2" />
      {/* Main bars */}
      {bars.map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y} r={mr} fill="#1e40af" stroke="#fff" strokeWidth={1.2} />
      ))}
      {/* Labels */}
      <text x={W/2} y={H - 3} textAnchor="middle" fontSize={7.5} fill="#666" fontFamily="DM Mono, monospace">{width}mm</text>
      <text x={W-4} y={H/2} textAnchor="end" fontSize={7.5} fill="#666" fontFamily="DM Mono, monospace"
        transform={`rotate(-90,${W-4},${H/2})`}>{depth}mm</text>
      {/* Annotation */}
      <line x1={bars[0]?.x} y1={(bars[0]?.y||0) - mr - 2} x2={(bars[0]?.x||0) - 10} y2={(bars[0]?.y||0) - 22}
        stroke="#1e40af" strokeWidth={0.8} />
      <text x={(bars[0]?.x||0) - 12} y={(bars[0]?.y||0) - 24} textAnchor="end" fontSize={7.5} fill="#1e40af" fontWeight="600">
        {mainBars}×Ø{mainDia}
      </text>
      <text x={W/2} y={H/2 + 4} textAnchor="middle" fontSize={7} fill="#2a6ee8" fontWeight="600">Tie Ø{tieDia}</text>
    </svg>
  );
}

function SlabSVG({ mainDia, mainSpacing, distDia, distSpacing, thickness, lx }) {
  const W = 240, H = 110;
  const nMain = Math.min(7, Math.max(3, Math.floor(200 / mainSpacing) + 1));
  const nDist = Math.min(5, Math.max(2, Math.floor(100 / distSpacing) + 1));
  const slabTop = 18, slabBot = H - 18;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="bbs-vs-svg" aria-label="Slab cross-section">
      {/* Slab body */}
      <rect x={10} y={slabTop} width={W-20} height={slabBot-slabTop} rx={3} fill="#f0efe8" stroke="#b0a080" strokeWidth={2} />
      {/* Main bars (bottom) */}
      {Array.from({length: nMain}, (_, i) => (
        <circle key={`m${i}`} cx={22 + i * ((W - 44) / Math.max(nMain-1,1))} cy={slabBot - 10}
          r={Math.max(2.5, mainDia/4)} fill="#27a96b" stroke="#fff" strokeWidth={0.8} />
      ))}
      {/* Distribution bars (top) */}
      {Array.from({length: nDist}, (_, i) => (
        <rect key={`d${i}`}
          x={22 + i * ((W - 44) / Math.max(nDist-1,1)) - 1}
          y={slabTop + 8}
          width={3} height={Math.max(2, distDia/3.5)} rx={1} fill="#059669" />
      ))}
      {/* Labels */}
      <text x={W/2} y={H - 2} textAnchor="middle" fontSize={7.5} fill="#666" fontFamily="DM Mono, monospace">Lx = {lx}mm</text>
      <text x={W-4} y={H/2+14} textAnchor="end" fontSize={7.5} fill="#666" fontFamily="DM Mono, monospace"
        transform={`rotate(-90,${W-4},${H/2})`}>D={thickness}mm</text>
      {/* Annotations */}
      <text x={14} y={slabBot - 5} fontSize={7} fill="#27a96b" fontWeight="700">Ø{mainDia}@{mainSpacing}</text>
      <text x={14} y={slabTop + 6} fontSize={7} fill="#059669" fontWeight="700">Ø{distDia}@{distSpacing}</text>
      {/* Cover arrows */}
      <line x1={10} y1={slabBot - 10} x2={10} y2={slabBot} stroke="#999" strokeWidth={0.8} markerEnd="url(#arr)" />
      <text x={12} y={slabBot - 1} fontSize={6.5} fill="#999">40mm</text>
    </svg>
  );
}

function FootingSVG({ mainDia, spacing, length, width }) {
  const W = 200, H = 160;
  const cx = 50, cy = 30;
  const n = Math.min(7, Math.max(3, Math.floor(150 / spacing) + 1));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="bbs-vs-svg" aria-label="Footing plan view">
      {/* Footing plan */}
      <rect x={cx} y={cy} width={W-2*cx} height={H-2*cy} rx={3} fill="#f5f0ff" stroke="#8b5cf6" strokeWidth={2} />
      {/* Bars along length (horizontal lines) */}
      {Array.from({length: n}, (_, i) => (
        <line key={`l${i}`}
          x1={cx+6} y1={cy + 8 + i * ((H-2*cy-16) / Math.max(n-1,1))}
          x2={W-cx-6} y2={cy + 8 + i * ((H-2*cy-16) / Math.max(n-1,1))}
          stroke="#8b5cf6" strokeWidth={2} />
      ))}
      {/* Bars along width (vertical lines) */}
      {Array.from({length: n}, (_, i) => (
        <line key={`w${i}`}
          x1={cx + 8 + i * ((W-2*cx-16) / Math.max(n-1,1))} y1={cy+6}
          x2={cx + 8 + i * ((W-2*cx-16) / Math.max(n-1,1))} y2={H-cy-6}
          stroke="#7c3aed" strokeWidth={1.5} strokeDasharray="3,2" />
      ))}
      {/* Labels */}
      <text x={W/2} y={H-4} textAnchor="middle" fontSize={8} fill="#8b5cf6" fontWeight="700">Plan View</text>
      <text x={W/2} y={cy-4} textAnchor="middle" fontSize={7.5} fill="#666" fontFamily="DM Mono, monospace">{length}mm</text>
      <text x={cx-4} y={H/2} textAnchor="end" fontSize={7.5} fill="#666" fontFamily="DM Mono, monospace"
        transform={`rotate(-90,${cx-4},${H/2})`}>{width}mm</text>
      <text x={cx+4} y={cy+18} fontSize={7} fill="#8b5cf6" fontWeight="600">Ø{mainDia}@{spacing} (L)</text>
      <text x={cx+4} y={cy+28} fontSize={7} fill="#7c3aed" fontWeight="600">Ø{mainDia}@{spacing} (W)</text>
    </svg>
  );
}

function VisualResultSummary({ result, elementType, inputs, steelRate }) {
  if (!result) return null;

  const totalKg  = parseFloat(result.totalKg);
  const cost     = (totalKg * steelRate).toLocaleString("en-IN", { maximumFractionDigits: 0 });
  const dc       = result.designCards || [];

  // Extract key values from designCards for summary bullets
  const mainCard  = dc.find(c => ["main-bottom","main-vert","slab-main","foot-l"].includes(c.type));
  const topCard   = dc.find(c => c.type === "main-top");
  const stirCard  = dc.find(c => ["stirrup","tie"].includes(c.type));
  const distCard  = dc.find(c => c.type === "slab-dist");
  const footWCard = dc.find(c => c.type === "foot-w");

  // Rows for per-bar summary: qty × totalLenM = weight
  const bullets = result.rows.map(r => ({
    label: r.desc,
    detail: `${r.qty} × ${r.totalLenM}m = ${r.weight} kg`,
    color: r.mark === "M1" ? "#0A2647" : r.mark === "M2" ? "#144272" : r.mark === "S1" ? "#e8552a" : r.mark === "L1" ? "#2a6ee8" : r.mark === "D1" ? "#059669" : "#8b5cf6",
  }));

  // SVG diagram
  let Diagram = null;
  if (elementType === "Beam" && mainCard && stirCard) {
    Diagram = <BeamSVG
      mainBars={mainCard.qty} mainDia={mainCard.dia}
      topBars={topCard?.qty || 2} topDia={topCard?.dia || 12}
      stirDia={stirCard.dia}
      width={inputs.width} depth={inputs.depth} />;
  } else if (elementType === "Column" && mainCard && stirCard) {
    Diagram = <ColumnSVG
      mainBars={mainCard.qty} mainDia={mainCard.dia}
      tieDia={stirCard.dia}
      width={inputs.width} depth={inputs.depth} />;
  } else if (elementType === "Slab" && mainCard) {
    Diagram = <SlabSVG
      mainDia={mainCard.dia} mainSpacing={mainCard.spacing}
      distDia={distCard?.dia||8} distSpacing={distCard?.spacing||200}
      thickness={inputs.thickness} lx={inputs.lx} />;
  } else if (elementType === "Footing" && mainCard) {
    Diagram = <FootingSVG
      mainDia={mainCard.dia} spacing={mainCard.spacing}
      length={inputs.length} width={inputs.width} />;
  }

  return (
    <div className="bbs-vs-card">
      <div className="bbs-vs-title">BBS Result Summary</div>

      <div className="bbs-vs-body">
        {/* SVG diagram */}
        {Diagram && (
          <div className="bbs-vs-diagram">
            {Diagram}
            <div className="bbs-vs-diagram-labels">
              {mainCard  && <span className="bbs-vs-lbl bbs-vs-lbl--bottom">Bottom Bars</span>}
              {topCard   && <span className="bbs-vs-lbl bbs-vs-lbl--top">Top Bars</span>}
              {stirCard  && <span className="bbs-vs-lbl bbs-vs-lbl--stir">{stirCard.type === "tie" ? "Ties" : "Stirrups"}</span>}
            </div>
          </div>
        )}

        {/* Summary bullets */}
        <div className="bbs-vs-bullets">
          {bullets.map((b, i) => (
            <div key={i} className="bbs-vs-bullet">
              <span className="bbs-vs-dot" style={{background: b.color}} />
              <div className="bbs-vs-bullet-text">
                <span className="bbs-vs-bullet-label">{b.label.replace(/\(.*\)/,"").trim()}:</span>
                <span className="bbs-vs-bullet-detail">{b.detail}</span>
              </div>
            </div>
          ))}

          {mainCard?.ld_mm && (
            <div className="bbs-vs-bullet">
              <span className="bbs-vs-dot" style={{background:"#475569"}} />
              <div className="bbs-vs-bullet-text">
                <span className="bbs-vs-bullet-label">Development Length:</span>
                <span className="bbs-vs-bullet-detail">{LD_FACTOR}ϕ ({mainCard.ld_mm} mm)</span>
              </div>
            </div>
          )}
          {mainCard?.hook_mm && (
            <div className="bbs-vs-bullet">
              <span className="bbs-vs-dot" style={{background:"#94a3b8"}} />
              <div className="bbs-vs-bullet-text">
                <span className="bbs-vs-bullet-label">Hook Length:</span>
                <span className="bbs-vs-bullet-detail">{mainCard.hook_label} ({mainCard.hook_mm} mm)</span>
              </div>
            </div>
          )}

          <div className="bbs-vs-total">
            <span>Total Steel Weight:</span>
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

export default function BBSGenerator() {
  const [activeEl,     setActiveEl]    = useState("beam");
  const [inputs,       setInputs]      = useState(ELEMENTS.beam.defaults);
  const [result,       setResult]      = useState(null);
  const [allElements,  setAllElements] = useState([]);
  const [steelRate,    setSteelRate]   = useState(78.5);
  const [projInfo,     setProjInfo]    = useState({ projectName:"", engineer:"", location:"" });
  const [activeTab,    setActiveTab]   = useState("inputs");
  const [elementId,    setElementId]   = useState("");

  const cfg = ELEMENTS[activeEl];

  const handleElChange = key => { setActiveEl(key); setInputs(ELEMENTS[key].defaults); setResult(null); setElementId(""); };
  const handleInput    = (id, val) => setInputs(p => ({ ...p, [id]: val===""?"":Number(val) }));

  const handleCalculate = useCallback(() => {
    try {
      const { rows, warnings, designCards } = cfg.calculate(inputs);
      const totalKg = rows.reduce((a,r) => a + parseFloat(r.weight), 0);
      setResult({ rows, warnings, designCards, totalKg:totalKg.toFixed(2), opt:optimizeBars(rows) });
    } catch(e) { alert("Calculation error: " + e.message); }
  }, [activeEl, inputs]);

  const handleAdd = () => {
    if (!result) return;
    setAllElements(p => [...p, { elementType:cfg.label, elementId:elementId||`${cfg.label}-${p.length+1}`,
      rows:result.rows, warnings:result.warnings, totalKg:result.totalKg, designCards:result.designCards, inputs:{...inputs} }]);
    setResult(null); setElementId(""); setActiveTab("summary");
  };

  const handleRemove = idx => setAllElements(p => p.filter((_,i) => i!==idx));
  const summary = useMemo(() => buildSummary(allElements), [allElements]);

  return (
    <div className="bbs-wrapper">

      {/* ── HERO ── */}
      <div className="bbs-hero">
        <div className="bbs-hero-container">
          <div className="bbs-hero-badge">IS 456 : 2000 · Auto BBS Engine</div>
          <h1 className="bbs-hero-title">Bar Bending Schedule <span>Generator</span></h1>
          <p className="bbs-hero-sub">Enter dimensions only — bars, quantities, spacings auto-calculated per IS 456. Ld=47ϕ · Hook=20ϕ/9ϕ · Lap=50ϕ</p>
        </div>
      </div>

      <div className="bbs-outer">

        {/* ── TABS ── */}
        <div className="bbs-tabs">
          {[["inputs","⚙ Calculate"],["summary",`📊 Schedule${allElements.length?` (${allElements.length})`:""}`],["iscodes","📋 IS Codes"]].map(([k,l]) => (
            <button key={k} className={`bbs-tab${activeTab===k?" active":""}`} onClick={() => setActiveTab(k)}>{l}</button>
          ))}
        </div>

        {/* ── PROJECT BAR ── */}
        <div className="bbs-project-bar">
          {[["projectName","Project Name"],["engineer","Engineer / EIC"],["location","Site / Location"]].map(([k,ph]) => (
            <input key={k} className="bbs-proj-input" placeholder={ph} value={projInfo[k]} onChange={e => setProjInfo(p => ({...p,[k]:e.target.value}))} />
          ))}
          <div className="bbs-rate-wrap">
            <span className="bbs-rate-label">Steel ₹/kg</span>
            <input type="number" className="bbs-proj-input bbs-rate-input" value={steelRate} onChange={e => setSteelRate(Number(e.target.value))} />
          </div>
        </div>

        {/* ════════ TAB: INPUTS ════════ */}
        {activeTab === "inputs" && (
          <div className="bbs-layout">

            {/* INPUT PANEL */}
            <div className="bbs-panel bbs-input-panel">
              <div className="bbs-section-label">01 — Select Element</div>
              <div className="bbs-element-grid">
                {Object.entries(ELEMENTS).map(([key, el]) => (
                  <button key={key} className={`bbs-element-btn${activeEl===key?" active":""}`}
                    style={{"--el-color": el.color}} onClick={() => handleElChange(key)}>
                    <span className="bbs-el-icon">{el.icon}</span>
                    <span className="bbs-el-label">{el.label}</span>
                  </button>
                ))}
              </div>

              <div className="bbs-section-label">
                02 — Element ID <span className="bbs-label-optional">optional</span>
              </div>
              <div className="bbs-fields bbs-fields--mb">
                <div className="bbs-field">
                  <input className="bbs-input" placeholder="e.g. B1, B2, C1, S1 …" value={elementId} onChange={e => setElementId(e.target.value)} />
                </div>
              </div>

              <div className="bbs-section-label">03 — Dimensions Only</div>
              <div className="bbs-fields">
                {cfg.fields.map(f => (
                  <div className="bbs-field" key={f.id}>
                    <label className="bbs-field-label">
                      {f.label}
                      {f.hint && <span className="bbs-field-hint">{f.hint}</span>}
                    </label>
                    <input type="number" className="bbs-input" value={inputs[f.id]??""} onChange={e => handleInput(f.id,e.target.value)} />
                  </div>
                ))}
              </div>

              <div className="bbs-assumptions">
                <div className="bbs-assumptions-title">IS 456 Auto Defaults</div>
                Cover: {COVER}mm | Ld: {LD_FACTOR}ϕ | Hook(main): {MAIN_HOOK_FACTOR}ϕ | Hook(stir): {STIR_HOOK_FACTOR}ϕ | Lap: {LAP_FACTOR}ϕ | Fe415 / M20
              </div>

              <div className="bbs-actions">
                <button className="bbs-btn-primary" onClick={handleCalculate}>⚙ Calculate</button>
                <button className="bbs-btn-ghost" onClick={() => { setInputs(cfg.defaults); setResult(null); }}>Reset</button>
              </div>
            </div>

            {/* RESULT PANEL */}
            <div className="bbs-panel bbs-result-panel">
              {!result ? (
                <div className="bbs-empty">
                  <div className="bbs-empty-icon">📐</div>
                  <h3 className="bbs-empty-title">Ready to Calculate</h3>
                  <p className="bbs-empty-sub">Enter dimensions and click Calculate. All bar sizes, hook lengths, dev lengths auto-selected per IS 456:2000.</p>
                </div>
              ) : (
                <>
                  {/* DESIGN SUMMARY CARDS */}
                  {result.designCards?.length > 0 && (
                    <>
                      <div className="bbs-section-label bbs-section-label--gap">
                        Auto Design Summary <span className="bbs-label-optional bbs-label-optional--normal">IS 456 calculated</span>
                      </div>
                      <div className="bbs-dscard-grid">
                        {result.designCards.map((c, i) => (
                          <div key={i} className="bbs-dscard">
                            <div className="bbs-dscard-head" style={{background: c.color}}>
                              <div className="bbs-dscard-dot" />
                              <div className="bbs-dscard-head-title">{c.label}</div>
                            </div>
                            <div className="bbs-dscard-body">
                              <div className="bbs-dscard-main-row">
                                <span className="bbs-dscard-qty">{c.qty}</span>
                                <span className="bbs-dscard-x">×</span>
                                <span className="bbs-dscard-dia" style={{"--dc": c.color}}>Ø{c.dia}mm</span>
                                {c.spacing && <span className="bbs-dscard-sp">@ {c.spacing}mm c/c</span>}
                              </div>
                              <div className="bbs-dscard-rows">
                                {c.ld_mm   && <div className="bbs-dscard-row"><span>Dev. Length (Ld)</span><b>{c.ld_mm}mm = {LD_FACTOR}ϕ</b></div>}
                                {c.hook_mm && <div className="bbs-dscard-row"><span>Hook Length</span><b>{c.hook_mm}mm = {c.hook_label}</b></div>}
                                {c.lap_mm  && <div className="bbs-dscard-row"><span>Lap Splice</span><b>{c.lap_mm}mm = {c.lap_label}</b></div>}
                              </div>
                              {c.Ast_prov && (
                                <div className="bbs-dscard-ast">
                                  <span className="bbs-dscard-ast-label">{c.Ast_req ? "Ast_req → Ast_prov" : "Ast_prov"}</span>
                                  <span className="bbs-dscard-ast-vals">{c.Ast_req ? `${c.Ast_req} → ${c.Ast_prov} mm²` : `${c.Ast_prov} mm²`}</span>
                                </div>
                              )}
                              <div className="bbs-dscard-clause">
                                <span className="bbs-dscard-clause-code">{c.clause}</span>
                                <span className="bbs-dscard-clause-reason">{c.reason}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* WARNINGS */}
                  {result.warnings?.length > 0 && (
                    <div className="bbs-warnings">
                      {result.warnings.map((w,i) => (
                        <div key={i} className={`bbs-warn-item ${w.includes("ERROR")?"bbs-warn-error":"bbs-warn-warn"}`}>{w}</div>
                      ))}
                    </div>
                  )}

                  {/* VISUAL SUMMARY CARD */}
                  <VisualResultSummary
                    result={result}
                    elementType={cfg.label}
                    inputs={inputs}
                    steelRate={steelRate}
                  />

                  {/* RESULT HEADER */}
                  <div className="bbs-result-header">
                    <div>
                      <div className="bbs-section-label bbs-section-label--small">BBS Result</div>
                      <h2 className="bbs-result-title">
                        {cfg.label}{elementId && <span className="bbs-result-id"> — {elementId}</span>}
                      </h2>
                    </div>
                    <button className="bbs-add-btn" onClick={handleAdd}>+ Add to Schedule</button>
                  </div>

                  {/* BBS TABLE */}
                  <div className="bbs-table-wrap">
                    <table className="bbs-table">
                      <thead>
                        <tr>
                          <th>Mark</th><th>Description</th><th>Ø</th><th>Qty</th>
                          <th>Cut Len (mm)</th><th>Lap (mm)</th><th>Length (m)</th>
                          <th>kg/m</th><th>Weight (kg)</th><th>IS Ref</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.rows.map((r,i) => (
                          <tr key={i}>
                            <td><b>{r.mark}</b></td>
                            <td className="bbs-td-desc">{r.desc}</td>
                            <td><span className="bbs-dia-badge">Ø{r.dia}</span></td>
                            <td className="bbs-td-num">{r.qty}</td>
                            <td className="bbs-td-num">{Number(r.cutLen).toLocaleString()}</td>
                            <td className="bbs-td-num bbs-lap">{r.lapLen||0}</td>
                            <td className="bbs-td-num">{r.totalLenM}</td>
                            <td className="bbs-td-num bbs-muted">{r.wtPerM}</td>
                            <td className="bbs-td-num bbs-weight">{r.weight}</td>
                            <td className="bbs-is-ref">{r.isRef}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={8} className="bbs-total-label">TOTAL STEEL WEIGHT</td>
                          <td colSpan={2} className="bbs-total-value">{result.totalKg} kg</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* COST CARDS */}
                  <div className="bbs-cost-cards">
                    <div className="bbs-cost-card">
                      <div className="bbs-cost-label">Total Weight</div>
                      <div className="bbs-cost-value">{result.totalKg} <small>kg</small></div>
                    </div>
                    <div className="bbs-cost-card bbs-cost-highlight">
                      <div className="bbs-cost-label">Estimated Cost</div>
                      <div className="bbs-cost-value">₹{(parseFloat(result.totalKg)*steelRate).toLocaleString("en-IN",{maximumFractionDigits:0})}</div>
                      <div className="bbs-cost-sub">@ ₹{steelRate}/kg</div>
                    </div>
                  </div>

                  {/* 12M OPTIMIZATION */}
                  <div className="bbs-section-label bbs-opt-section">12m Bar Optimization</div>
                  <div className="bbs-opt-grid">
                    {result.opt.map((o,i) => (
                      <div key={i} className="bbs-opt-card">
                        <div className="bbs-opt-dia">Ø{o.dia} mm</div>
                        <div className="bbs-opt-row"><span>Full Bars (12m)</span><b>{o.fullBars} nos</b></div>
                        <div className="bbs-opt-row"><span>Pieces/Bar</span><b>{o.piecesPerBar}</b></div>
                        <div className="bbs-opt-row"><span>Total Pieces</span><b>{o.totalPieces}</b></div>
                        <div className={`bbs-opt-row ${parseFloat(o.wastagePct)>8?"bbs-opt-waste-high":"bbs-opt-waste"}`}>
                          <span>Wastage</span><b>{o.wastageM}m ({o.wastagePct}%)</b>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

          </div>
        )}

        {/* ════════ TAB: SUMMARY ════════ */}
        {activeTab === "summary" && (
          <div className="bbs-summ-wrap">
            {allElements.length === 0 ? (
              <div className="bbs-panel bbs-summ-empty">
                <div className="bbs-empty-icon">📋</div>
                <h3 className="bbs-empty-title">No Elements Added Yet</h3>
                <p className="bbs-empty-sub">Calculate elements and click "Add to Schedule"</p>
              </div>
            ) : (
              <>
                <div className="bbs-el-cards">
                  {allElements.map((el, idx) => (
                    <div key={idx} className="bbs-el-card">
                      <div className="bbs-el-card-header">
                        <div>
                          <div className="bbs-el-card-title">{el.elementType} — {el.elementId}</div>
                          <div className="bbs-el-card-sub">Element {idx+1}</div>
                        </div>
                        <div className="bbs-el-card-actions">
                          <span className="bbs-el-card-kg">{el.totalKg} kg</span>
                          <button className="bbs-el-remove-btn" onClick={() => handleRemove(idx)}>Remove</button>
                        </div>
                      </div>
                      <div className="bbs-el-card-body">
                        <div className="bbs-table-wrap">
                          <table className="bbs-table">
                            <thead>
                              <tr><th>Mark</th><th>Description</th><th>Ø</th><th>Qty</th><th>Cut Len (mm)</th><th>Lap (mm)</th><th>Length (m)</th><th>Weight (kg)</th></tr>
                            </thead>
                            <tbody>
                              {el.rows.map((r,i) => (
                                <tr key={i}>
                                  <td><b>{r.mark}</b></td>
                                  <td className="bbs-td-desc">{r.desc}</td>
                                  <td><span className="bbs-dia-badge">Ø{r.dia}</span></td>
                                  <td className="bbs-td-num">{r.qty}</td>
                                  <td className="bbs-td-num">{Number(r.cutLen).toLocaleString()}</td>
                                  <td className="bbs-td-num bbs-lap">{r.lapLen||0}</td>
                                  <td className="bbs-td-num">{r.totalLenM}</td>
                                  <td className="bbs-td-num bbs-weight">{r.weight}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* GRAND SUMMARY */}
                <div className="bbs-grand-summ">
                  <div className="bbs-grand-title">Grand Steel Summary — All Elements</div>
                  <div className="bbs-grand-grid">
                    <div className="bbs-grand-card"><div className="bbs-grand-card-label">Elements</div><div className="bbs-grand-card-val">{allElements.length}</div></div>
                    <div className="bbs-grand-card"><div className="bbs-grand-card-label">Total Steel</div><div className="bbs-grand-card-val">{summary.totalKg} <small>kg</small></div></div>
                    <div className="bbs-grand-card"><div className="bbs-grand-card-label">Total Cost</div><div className="bbs-grand-card-val bbs-grand-orange">₹{(summary.totalKg*steelRate).toLocaleString("en-IN",{maximumFractionDigits:0})}</div></div>
                    <div className="bbs-grand-card"><div className="bbs-grand-card-label">Rate Used</div><div className="bbs-grand-card-val">₹{steelRate}<small>/kg</small></div></div>
                  </div>

                  {summary.byDia.length > 0 && (
                    <>
                      <div className="bbs-grand-dia-label">Steel by Diameter</div>
                      <div className="bbs-grand-dia-rows">
                        {summary.byDia.map(s => (
                          <div key={s.dia} className="bbs-grand-dia-row">
                            <div className="bbs-grand-dia-name">Ø{s.dia}mm</div>
                            <div className="bbs-grand-dia-bar-wrap">
                              <div className="bbs-grand-dia-bar" style={{width:`${Math.round((s.totalKg/summary.totalKg)*100)}%`}} />
                            </div>
                            <div className="bbs-grand-dia-val">{s.totalKg}kg · {s.bars12m}nos</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <div className="bbs-export-row">
                    <button className="bbs-export-btn bbs-export-xlsx" onClick={() => exportToCSV(allElements,projInfo,steelRate)}>📊 Export Excel/CSV</button>
                    <button className="bbs-export-btn bbs-export-print" onClick={() => window.print()}>🖨 Print Schedule</button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ════════ TAB: IS CODES ════════ */}
        {activeTab === "iscodes" && (
          <div className="bbs-iscodes-wrap">
            <div className="bbs-iscodes-header">
              <h2 className="bbs-iscodes-title">IS 456 : 2000 Reference</h2>
              <p className="bbs-iscodes-sub">Clauses applied automatically. Fe415 / M20 assumed. Ld corrected to 47ϕ exact formula value.</p>
            </div>
            <div className="bbs-iscode-grid">
              {IS_CODES.map((c,i) => (
                <div key={i} className="bbs-iscode-card">
                  <div className="bbs-iscode-clause">{c.clause}</div>
                  <div className="bbs-iscode-title">{c.title}</div>
                  <div className="bbs-iscode-detail">{c.detail}</div>
                  <span className="bbs-iscode-applies">Applies to: {c.applies}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}