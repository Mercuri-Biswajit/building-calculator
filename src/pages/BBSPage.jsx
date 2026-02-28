import { useState, useCallback, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   ENGINEERING CONSTANTS — IS 456 : 2000
═══════════════════════════════════════════════════════════════════════════ */
const COVER        = 40;          // mm – IS 456 Cl.26.4 moderate exposure
const LD_FACTOR    = 40;          // Development length multiplier
const HOOK_FACTOR  = 9;           // Hook = 9d (SP 34)
const LAP_FACTOR   = 50;          // Lap splice = 50d – IS 456 Cl.26.2.5
const BAR_LEN      = 12000;       // Standard bar length (mm)

const BAR_WEIGHTS  = { 8:0.395, 10:0.617, 12:0.888, 16:1.578, 20:2.466, 25:3.853, 32:6.313 };
const DIAMETERS    = [8, 10, 12, 16, 20, 25, 32];

// IS Code references per bar type
const IS_REF = {
  main:    "IS 456 Cl.26.5.2",
  stirrup: "IS 456 Cl.26.5.2.2",
  tie:     "IS 456 Cl.26.5.3.2",
  dist:    "IS 456 Cl.26.5.2.1",
  footing: "IS 456 Cl.34.1",
};

// Default spacing suggestions (mm)
const SPACING_DEFAULTS = {
  beam_stirrup: 150, col_tie: 150, slab_main: 150, slab_dist: 200, footing: 150,
};

// Min reinforcement checks
const MIN_REINF = {
  beam:    { label: "Ast min = 0.85bwd/fy", pct: 0.85 / 415 },
  column:  { label: "Asc min = 0.8% Ag",   pct: 0.008 },
  slab:    { label: "Ast min = 0.12% bD (HYSD)", pct: 0.0012 },
  footing: { label: "Ast min = 0.12% bD", pct: 0.0012 },
};

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════════════════ */
function wtPer(dia)  { return BAR_WEIGHTS[dia] || 0; }
function ld(dia)     { return LD_FACTOR * dia; }
function hook(dia)   { return HOOK_FACTOR * dia; }
function lap(dia)    { return LAP_FACTOR * dia; }

function calcRow(desc, mark, dia, cutLen, qty, isRef, addLap = false) {
  const lapLen    = addLap ? lap(dia) : 0;
  const totalMm   = (cutLen + lapLen) * qty;
  const totalLenM = (totalMm / 1000).toFixed(2);
  const weight    = (wtPer(dia) * totalMm / 1000).toFixed(2);
  return { desc, mark, dia, cutLen: Math.round(cutLen), lapLen: Math.round(lapLen), qty, totalLenM, wtPerM: wtPer(dia).toFixed(3), weight, isRef };
}

// 12m bar optimization
function optimizeBars(rows) {
  const byDia = {};
  rows.forEach(r => {
    const key = r.dia;
    if (!byDia[key]) byDia[key] = { totalCutLen: 0, count: 0 };
    byDia[key].totalCutLen += (r.cutLen + r.lapLen) * r.qty;
    byDia[key].count += r.qty;
  });
  return Object.entries(byDia).map(([dia, v]) => {
    const cutLen       = rows.find(r => r.dia == dia)?.cutLen || 0;
    const piecesPerBar = Math.floor(BAR_LEN / cutLen) || 1;
    const totalPieces  = rows.filter(r => r.dia == dia).reduce((a,r) => a + r.qty, 0);
    const fullBars     = Math.ceil(totalPieces / piecesPerBar);
    const totalUsed    = totalPieces * cutLen;
    const totalPurchd  = fullBars * BAR_LEN;
    const wastageM     = (totalPurchd - totalUsed) / 1000;
    const wastagePct   = ((totalPurchd - totalUsed) / totalPurchd) * 100;
    return { dia: Number(dia), fullBars, piecesPerBar, totalPieces, wastageM, wastagePct: wastagePct.toFixed(1) };
  });
}

// Summary by dia across all elements
function buildSummary(allRows) {
  const byDia = {};
  allRows.forEach(r => {
    const d = r.dia;
    if (!byDia[d]) byDia[d] = 0;
    byDia[d] += parseFloat(r.weight);
  });
  let totalKg = 0;
  const arr = Object.entries(byDia).sort((a,b)=>a[0]-b[0]).map(([dia, kg]) => {
    const roundedKg = parseFloat(kg.toFixed(2));
    totalKg += roundedKg;
    const bars12m = Math.ceil((kg / wtPer(Number(dia))) * 1000 / BAR_LEN + 0.5); // +0.5 wastage buffer
    return { dia: Number(dia), totalKg: roundedKg, bars12m, note: `${bars12m} bars × 12m` };
  });
  return { byDia: arr, totalKg: parseFloat(totalKg.toFixed(2)) };
}

/* ═══════════════════════════════════════════════════════════════════════════
   CALCULATORS
═══════════════════════════════════════════════════════════════════════════ */
function calcBeam(f) {
  const { span, width, depth, mainBars, mainDia, stirrupDia, stirrupSpacing, extraBars, extraDia } = f;
  const warnings = [];
  // Spacing check
  if (stirrupSpacing > 300) warnings.push("⚠ Stirrup spacing > 300mm — reduce (IS 456 Cl.26.5.2.2)");
  if (stirrupSpacing > depth / 2) warnings.push(`⚠ Spacing > d/2 (${Math.round(depth/2)}mm) — check shear zone`);
  // Min reinforcement
  const bw = width - 2 * COVER;
  const d  = depth - COVER - stirrupDia - mainDia / 2;
  const Ast_min = (0.85 * bw * d) / 415;
  const Ast_prov = mainBars * Math.PI * mainDia * mainDia / 4;
  if (Ast_prov < Ast_min) warnings.push(`⚠ Provided Ast (${Ast_prov.toFixed(0)}mm²) < Ast_min (${Ast_min.toFixed(0)}mm²) — IS 456 Cl.26.5.2.1`);

  const mainCut  = span + 2 * ld(mainDia) + 2 * hook(mainDia) - 2 * COVER;
  const rows = [
    calcRow("Bottom Main Bars",  "M1", mainDia,   mainCut,   Number(mainBars), IS_REF.main,    true),
  ];
  if (extraBars > 0 && extraDia > 0) {
    rows.push(calcRow("Top/Extra Bars", "M2", extraDia, mainCut, Number(extraBars), IS_REF.main, true));
  }
  // Stirrups
  const perim    = 2 * ((width - 2*COVER) + (depth - 2*COVER));
  const stirCut  = perim + 2 * hook(stirrupDia);
  const stirQty  = Math.ceil(span / stirrupSpacing) + 1;
  rows.push(calcRow("Stirrups (2-legged)", "S1", stirrupDia, stirCut, stirQty, IS_REF.stirrup, false));

  return { rows, warnings };
}

function calcColumn(f) {
  const { height, width, depth, mainBars, mainDia, tieDia, tieSpacing } = f;
  const warnings = [];
  const Ag = width * depth;
  const Asc_min = 0.008 * Ag;
  const Asc_max = 0.04  * Ag;
  const Asc_prov = mainBars * Math.PI * mainDia * mainDia / 4;
  if (Asc_prov < Asc_min) warnings.push(`⚠ Asc (${Asc_prov.toFixed(0)}mm²) < 0.8%Ag (${Asc_min.toFixed(0)}mm²) — IS 456 Cl.26.5.3.1`);
  if (Asc_prov > Asc_max) warnings.push(`⚠ Asc > 4%Ag — congestion risk`);
  const maxTie = Math.min(Math.min(width, depth), 16 * mainDia, 300);
  if (tieSpacing > maxTie) warnings.push(`⚠ Tie spacing ${tieSpacing}mm > max ${maxTie}mm — IS 456 Cl.26.5.3.2`);

  const mainCut = height + 2 * ld(mainDia);
  const tiePerim = 2 * ((width - 2*COVER) + (depth - 2*COVER));
  const tieCut  = tiePerim + 2 * hook(tieDia);
  const tieQty  = Math.ceil(height / tieSpacing) + 1;
  const rows = [
    calcRow("Main Vertical Bars", "M1", mainDia, mainCut, Number(mainBars), IS_REF.main,    true),
    calcRow("Lateral Ties",       "L1", tieDia,  tieCut,  tieQty,           IS_REF.tie,     false),
  ];
  return { rows, warnings };
}

function calcSlab(f) {
  const { lx, ly, thickness, mainDia, distDia, mainSpacing, distSpacing } = f;
  const warnings = [];
  const Ast_min = 0.0012 * 1000 * thickness;
  const mainSpacingProv = mainSpacing;
  if (mainSpacingProv > 3 * thickness || mainSpacingProv > 300)
    warnings.push(`⚠ Main bar spacing > 3D or 300mm — IS 456 Cl.26.3.3`);
  const Ast_prov = (Math.PI * mainDia * mainDia / 4) * (1000 / mainSpacing);
  if (Ast_prov < Ast_min) warnings.push(`⚠ Ast/m (${Ast_prov.toFixed(0)}mm²) < 0.12% (${Ast_min.toFixed(0)}mm²/m) — IS 456 Cl.26.5.2.1`);
  if (thickness < 125) warnings.push("⚠ Slab thickness < 125mm — IS 456 Cl.24.1");

  const mainCut = lx + 2 * hook(mainDia);
  const mainQty = Math.ceil(ly / mainSpacing) + 1;
  const distCut = ly + 2 * hook(distDia);
  const distQty = Math.ceil(lx / distSpacing) + 1;
  const rows = [
    calcRow("Main Bars (along Lx)", "M1", mainDia, mainCut, mainQty, IS_REF.main, false),
    calcRow("Dist. Bars (along Ly)", "D1", distDia, distCut, distQty, IS_REF.dist, false),
  ];
  return { rows, warnings };
}

function calcFooting(f) {
  const { length, width, thickness, mainDia, spacing } = f;
  const warnings = [];
  if (thickness < 300) warnings.push("⚠ Footing thickness < 300mm — check punching shear");
  const Ast_min = 0.0012 * 1000 * thickness;
  const Ast_prov = (Math.PI * mainDia * mainDia / 4) * (1000 / spacing);
  if (Ast_prov < Ast_min) warnings.push(`⚠ Ast/m (${Ast_prov.toFixed(0)}mm²) < 0.12% — IS 456 Cl.34.1`);

  const barL = width  - 2 * COVER + 2 * hook(mainDia);
  const barW = length - 2 * COVER + 2 * hook(mainDia);
  const qtyL = Math.ceil((length - 2 * COVER) / spacing) + 1;
  const qtyW = Math.ceil((width  - 2 * COVER) / spacing) + 1;
  const rows = [
    calcRow("Bars along Length", "M1", mainDia, barL, qtyL, IS_REF.footing, false),
    calcRow("Bars along Width",  "M2", mainDia, barW, qtyW, IS_REF.footing, false),
  ];
  return { rows, warnings };
}

/* ═══════════════════════════════════════════════════════════════════════════
   ELEMENT DEFINITIONS
═══════════════════════════════════════════════════════════════════════════ */
const ELEMENTS = {
  beam: {
    label: "Beam", icon: "⬛", color: "#e8552a",
    defaults: { span:5000, width:300, depth:450, mainBars:4, mainDia:16, extraBars:2, extraDia:12, stirrupDia:8, stirrupSpacing:150 },
    fields: [
      { id:"span",           label:"Span (mm)",            hint:"c/c length" },
      { id:"width",          label:"Width b (mm)",         hint:"beam width" },
      { id:"depth",          label:"Overall Depth D (mm)", hint:"include cover" },
      { id:"mainBars",       label:"No. Bottom Main Bars", hint:"bottom tension steel" },
      { id:"mainDia",        label:"Main Bar Dia (mm)",    type:"select" },
      { id:"extraBars",      label:"No. Top/Extra Bars",   hint:"0 if none" },
      { id:"extraDia",       label:"Extra Bar Dia (mm)",   type:"select" },
      { id:"stirrupDia",     label:"Stirrup Dia (mm)",     type:"select" },
      { id:"stirrupSpacing", label:"Stirrup Spacing (mm)", hint:"suggested: 150mm" },
    ],
    calculate: calcBeam,
  },
  column: {
    label: "Column", icon: "🟫", color: "#2a6ee8",
    defaults: { height:3000, width:300, depth:300, mainBars:8, mainDia:16, tieDia:8, tieSpacing:150 },
    fields: [
      { id:"height",      label:"Height (mm)",         hint:"floor to floor" },
      { id:"width",       label:"Width b (mm)",         hint:"shorter dim" },
      { id:"depth",       label:"Depth D (mm)",         hint:"longer dim" },
      { id:"mainBars",    label:"No. Main Bars",        hint:"min 4 for rect" },
      { id:"mainDia",     label:"Main Bar Dia (mm)",    type:"select" },
      { id:"tieDia",      label:"Lateral Tie Dia (mm)", type:"select" },
      { id:"tieSpacing",  label:"Tie Spacing (mm)",     hint:"max=min(b,16d,300)" },
    ],
    calculate: calcColumn,
  },
  slab: {
    label: "Slab", icon: "▬", color: "#27a96b",
    defaults: { lx:4000, ly:6000, thickness:150, mainDia:10, distDia:8, mainSpacing:150, distSpacing:200 },
    fields: [
      { id:"lx",           label:"Short Span Lx (mm)",   hint:"shorter direction" },
      { id:"ly",           label:"Long Span Ly (mm)",    hint:"longer direction" },
      { id:"thickness",    label:"Slab Thickness (mm)",  hint:"min 125mm (IS 24.1)" },
      { id:"mainDia",      label:"Main Bar Dia (mm)",    type:"select" },
      { id:"distDia",      label:"Dist. Bar Dia (mm)",   type:"select" },
      { id:"mainSpacing",  label:"Main Spacing (mm)",    hint:"≤3D or 300mm" },
      { id:"distSpacing",  label:"Dist. Spacing (mm)",   hint:"≤5D or 450mm" },
    ],
    calculate: calcSlab,
  },
  footing: {
    label: "Footing", icon: "◼", color: "#8b5cf6",
    defaults: { length:2000, width:2000, thickness:500, mainDia:16, spacing:150 },
    fields: [
      { id:"length",    label:"Length (mm)",     hint:"plan dimension" },
      { id:"width",     label:"Width (mm)",      hint:"plan dimension" },
      { id:"thickness", label:"Thickness (mm)",  hint:"min 300mm" },
      { id:"mainDia",   label:"Main Bar Dia (mm)", type:"select" },
      { id:"spacing",   label:"Bar Spacing (mm)", hint:"both ways" },
    ],
    calculate: calcFooting,
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES (Improved)
═══════════════════════════════════════════════════════════════════════════ */
const styles = `
  .bbs-wrapper {
    min-height: 100vh;
    background: #F7F9FC;
    font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    color: #0f172a;
    padding-bottom: 4rem;
  }

  .bbs-hero {
    background: linear-gradient(135deg, #0A2647 0%, #144272 100%);
    padding: 3.5rem 0;
    position: relative;
    overflow: hidden;
    border-bottom: 3px solid #FF8C00;
  }
  
  .bbs-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 30px 30px;
    pointer-events: none;
  }
  
  .bbs-hero::after {
    content: '';
    position: absolute;
    top: -50px;
    right: -50px;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(255,140,0,0.1) 0%, transparent 70%);
    pointer-events: none;
  }
  
  .bbs-hero-container {
    max-width: 1300px;
    margin: 0 auto;
    padding: 0 2rem;
    position: relative;
    z-index: 1;
  }
  
  .bbs-hero-badge {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: #FF8C00;
    text-transform: uppercase;
    margin-bottom: 1rem;
    background: rgba(255,140,0,0.15);
    padding: 0.45rem 1.1rem;
    border-radius: 20px;
    border: 1.5px solid rgba(255,140,0,0.3);
    display: inline-block;
  }
  
  .bbs-hero-title {
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 700;
    color: #fff;
    line-height: 1.15;
    letter-spacing: -0.03em;
    margin: 0 0 1rem;
  }
  
  .bbs-hero-title span {
    color: #FF8C00;
    display: inline-block;
  }
  
  .bbs-hero-sub {
    font-size: 1.05rem;
    color: rgba(255,255,255,0.8);
    max-width: 680px;
    line-height: 1.65;
    font-weight: 400;
  }
  
  .bbs-outer {
    max-width: 1300px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .bbs-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    background: #EEF2F8;
    padding: 0.4rem;
    border-radius: 14px;
    width: fit-content;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }
  
  .bbs-tab {
    background: transparent;
    border: none;
    border-radius: 10px;
    padding: 0.65rem 1.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }
  
  .bbs-tab:hover {
    color: #0A2647;
    background: rgba(10,38,71,0.05);
  }
  
  .bbs-tab.active {
    background: #fff;
    color: #0A2647;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  }
  
  .bbs-project-bar {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 2rem;
    padding: 1.25rem 1.5rem;
    background: #fff;
    border: 1px solid #E0E8F2;
    border-radius: 14px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }
  
  .bbs-proj-input {
    flex: 1;
    min-width: 180px;
    padding: 0.7rem 1rem;
    border: 1.5px solid #E0E8F2;
    border-radius: 10px;
    font-size: 0.9rem;
    color: #0f172a;
    background: #F7F9FC;
    outline: none;
    transition: all 0.2s ease;
  }
  
  .bbs-proj-input:focus {
    border-color: #0A2647;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(10,38,71,0.08);
  }
  
  .bbs-rate-wrap {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-shrink: 0;
  }
  
  .bbs-rate-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: #64748b;
    white-space: nowrap;
  }
  
  .bbs-rate-input {
    width: 110px !important;
    min-width: unset !important;
  }
  
  .bbs-layout {
    display: grid;
    grid-template-columns: 380px 1fr;
    gap: 2rem;
    align-items: start;
  }
  
  .bbs-panel {
    background: #fff;
    border: 1px solid #E0E8F2;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }
  
  .bbs-input-panel {
    position: sticky;
    top: 20px;
  }
  
  .bbs-result-panel {
    min-height: 400px;
  }
  
  .bbs-section-label {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: #0A2647;
    text-transform: uppercase;
    margin-bottom: 1.25rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #EEF2F8;
  }
  
  .bbs-element-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }
  
  .bbs-element-btn {
    background: #F7F9FC;
    border: 1.5px solid #E0E8F2;
    border-radius: 12px;
    padding: 1rem 0.75rem;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    color: #64748b;
    font-size: 0.85rem;
    font-weight: 600;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
  }
  
  .bbs-element-btn:hover {
    border-color: #0A2647;
    color: #0A2647;
    background: rgba(10,38,71,0.03);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }
  
  .bbs-element-btn.active {
    border-color: #0A2647;
    background: rgba(10,38,71,0.06);
    color: #0A2647;
    box-shadow: 0 4px 16px rgba(10,38,71,0.15);
  }
  
  .bbs-element-btn.active::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--el-color, #FF8C00);
  }
  
  .bbs-el-icon {
    font-size: 1.8rem;
  }
  
  .bbs-el-label {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  
  .bbs-fields {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .bbs-field {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }
  
  .bbs-field-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #0f172a;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .bbs-field-hint {
    font-size: 0.7rem;
    color: #94a3b8;
    font-weight: 400;
    font-style: italic;
  }
  
  .bbs-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1.5px solid #E0E8F2;
    border-radius: 10px;
    font-family: 'DM Mono', monospace;
    font-size: 0.9rem;
    font-weight: 500;
    color: #0f172a;
    background: #fff;
    outline: none;
    transition: all 0.2s ease;
  }
  
  .bbs-input:focus {
    border-color: #0A2647;
    box-shadow: 0 0 0 3px rgba(10,38,71,0.1);
    background: #fff;
  }
  
  .bbs-input::placeholder {
    color: #cbd5e1;
    font-weight: 400;
  }
  
  .bbs-assumptions {
    background: rgba(255,140,0,0.06);
    border: 1px solid rgba(255,140,0,0.2);
    border-left: 3px solid #FF8C00;
    border-radius: 10px;
    padding: 1rem 1.25rem;
    font-size: 0.8rem;
    color: #64748b;
    margin-bottom: 1.5rem;
    font-family: 'DM Mono', monospace;
    line-height: 1.6;
  }
  
  .bbs-assumptions-title {
    font-weight: 700;
    color: #d97706;
    margin-bottom: 0.4rem;
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  
  .bbs-actions {
    display: flex;
    gap: 0.75rem;
  }
  
  .bbs-btn-primary {
    flex: 1;
    padding: 0.95rem 1.5rem;
    background: #0A2647;
    color: #fff;
    border: none;
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.25s ease;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(10,38,71,0.2);
  }
  
  .bbs-btn-primary::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%);
    transform: translateX(-100%);
    transition: transform 0.5s ease;
  }
  
  .bbs-btn-primary:hover::before {
    transform: translateX(100%);
  }
  
  .bbs-btn-primary:hover {
    background: #144272;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(10,38,71,0.3);
  }
  
  .bbs-btn-primary:active {
    transform: translateY(0);
  }
  
  .bbs-btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  .bbs-btn-ghost {
    background: transparent;
    border: 1.5px solid #E0E8F2;
    border-radius: 12px;
    padding: 0.95rem 1.25rem;
    color: #64748b;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .bbs-btn-ghost:hover {
    border-color: #0A2647;
    color: #0A2647;
    background: rgba(10,38,71,0.04);
  }
  
  .bbs-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    text-align: center;
    gap: 1rem;
  }
  
  .bbs-empty-icon {
    font-size: 3.5rem;
    opacity: 0.2;
  }
  
  .bbs-empty-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #64748b;
  }
  
  .bbs-empty-sub {
    font-size: 0.875rem;
    color: #94a3b8;
    max-width: 300px;
    line-height: 1.5;
  }
  
  .bbs-warnings {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    margin-bottom: 1.5rem;
  }
  
  .bbs-warn-item {
    padding: 0.85rem 1rem;
    border-radius: 10px;
    font-size: 0.85rem;
    font-weight: 500;
    line-height: 1.5;
  }
  
  .bbs-warn-warn {
    background: #fef3c7;
    border: 1px solid #fcd34d;
    border-left: 3px solid #d97706;
    color: #78350f;
  }
  
  .bbs-warn-error {
    background: #fee2e2;
    border: 1px solid #fca5a5;
    border-left: 3px solid #dc2626;
    color: #991b1b;
  }
  
  .bbs-result-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .bbs-result-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: #0A2647;
    letter-spacing: -0.02em;
    line-height: 1.1;
  }
  
  .bbs-add-btn {
    background: #FF8C00;
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 0.7rem 1.4rem;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(255,140,0,0.25);
  }
  
  .bbs-add-btn:hover {
    background: #e07b00;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(255,140,0,0.35);
  }
  
  .bbs-table-wrap {
    overflow-x: auto;
    margin-bottom: 1.5rem;
    border-radius: 12px;
    border: 1px solid #E0E8F2;
  }
  
  .bbs-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
  }
  
  .bbs-table th {
    background: #0A2647;
    color: #fff;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 0.75rem 1rem;
    text-align: left;
    white-space: nowrap;
  }
  
  .bbs-table td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #F0F4F8;
    vertical-align: middle;
    color: #0f172a;
  }
  
  .bbs-table tbody tr:nth-child(even) td {
    background: #F7F9FC;
  }
  
  .bbs-table tbody tr:hover td {
    background: rgba(10,38,71,0.03);
  }
  
  .bbs-table tbody tr:last-child td {
    border-bottom: 2px solid #E0E8F2;
  }
  
  .bbs-td-desc {
    font-weight: 500;
  }
  
  .bbs-td-num {
    font-family: 'DM Mono', monospace;
    text-align: right;
  }
  
  .bbs-td-note {
    font-size: 0.7rem;
    color: #94a3b8;
  }
  
  .bbs-weight {
    font-weight: 700;
    color: #059669;
    font-family: 'DM Mono', monospace;
  }
  
  .bbs-lap {
    color: #2563eb;
    font-family: 'DM Mono', monospace;
  }
  
  .bbs-muted {
    color: #94a3b8;
  }
  
  .bbs-is-ref {
    color: #2563eb;
    font-size: 0.7rem;
    font-family: 'DM Mono', monospace;
  }
  
  .bbs-dia-badge {
    background: #EEF2F8;
    border: 1px solid #E0E8F2;
    border-radius: 6px;
    padding: 2px 8px;
    font-family: 'DM Mono', monospace;
    font-size: 0.7rem;
    color: #0A2647;
    font-weight: 700;
  }
  
  .bbs-table tfoot td {
    background: #F7F9FC;
    padding: 1rem;
  }
  
  .bbs-total-label {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #64748b;
  }
  
  .bbs-total-value {
    font-family: 'DM Mono', monospace;
    font-size: 1.25rem;
    font-weight: 700;
    color: #059669;
    text-align: right;
  }
  
  .bbs-cost-cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .bbs-cost-card {
    background: #F7F9FC;
    border: 1.5px solid #E0E8F2;
    border-radius: 12px;
    padding: 1.5rem;
  }
  
  .bbs-cost-highlight {
    background: rgba(10,38,71,0.04);
    border-color: rgba(10,38,71,0.15);
  }
  
  .bbs-cost-label {
    font-size: 0.7rem;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 0.6rem;
  }
  
  .bbs-cost-value {
    font-family: 'DM Mono', monospace;
    font-size: 1.75rem;
    font-weight: 700;
    color: #0A2647;
    line-height: 1;
  }
  
  .bbs-cost-highlight .bbs-cost-value {
    color: #FF8C00;
  }
  
  .bbs-cost-value small {
    font-size: 0.85rem;
    color: #64748b;
    font-family: 'DM Sans', sans-serif;
  }
  
  .bbs-cost-sub {
    font-size: 0.7rem;
    color: #94a3b8;
    margin-top: 0.4rem;
    font-family: 'DM Mono', monospace;
  }
  
  .bbs-opt-section {
    margin-bottom: 1rem;
  }
  
  .bbs-opt-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 0.85rem;
  }
  
  .bbs-opt-card {
    background: #F7F9FC;
    border: 1px solid #E0E8F2;
    border-radius: 12px;
    padding: 1rem;
    transition: all 0.2s ease;
  }
  
  .bbs-opt-card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
    border-color: #0A2647;
    transform: translateY(-2px);
  }
  
  .bbs-opt-dia {
    font-family: 'DM Mono', monospace;
    font-size: 1rem;
    font-weight: 700;
    color: #0A2647;
    margin-bottom: 0.85rem;
    padding-bottom: 0.6rem;
    border-bottom: 1px solid #EEF2F8;
  }
  
  .bbs-opt-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.75rem;
    color: #64748b;
    padding: 4px 0;
  }
  
  .bbs-opt-row span {
    font-weight: 500;
  }
  
  .bbs-opt-row b {
    font-family: 'DM Mono', monospace;
    color: #0f172a;
  }
  
  .bbs-opt-waste b {
    color: #059669;
  }
  
  .bbs-opt-waste-high b {
    color: #d97706;
  }
  
  @media (max-width: 900px) {
    .bbs-layout {
      grid-template-columns: 1fr;
    }
    
    .bbs-input-panel {
      position: static;
    }
  }
  
  @media (max-width: 768px) {
    .bbs-outer {
      padding: 1rem;
    }
    
    .bbs-panel {
      padding: 1.5rem;
    }
    
    .bbs-hero {
      padding: 2.5rem 0;
    }
    
    .bbs-hero-container {
      padding: 0 1rem;
    }
    
    .bbs-element-grid {
      grid-template-columns: repeat(4, 1fr);
    }
    
    .bbs-el-label {
      display: none;
    }
    
    .bbs-table {
      min-width: 600px;
    }
    
    .bbs-cost-cards {
      grid-template-columns: 1fr;
    }
  }
  
  @media (max-width: 480px) {
    .bbs-element-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .bbs-el-label {
      display: block;
    }
    
    .bbs-tabs {
      width: 100%;
      overflow-x: auto;
    }
    
    .bbs-project-bar {
      flex-direction: column;
    }
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function BBSGenerator() {
  const [activeEl,     setActiveEl]     = useState("beam");
  const [inputs,       setInputs]       = useState(ELEMENTS.beam.defaults);
  const [result,       setResult]       = useState(null);
  const [allElements,  setAllElements]  = useState([]);
  const [steelRate,    setSteelRate]    = useState(78.5);
  const [projectInfo,  setProjectInfo]  = useState({ projectName:"", engineer:"", location:"" });
  const [activeTab,    setActiveTab]    = useState("inputs");
  const [elementId,    setElementId]    = useState("");

  const cfg = ELEMENTS[activeEl];

  const handleElChange = (key) => {
    setActiveEl(key);
    setInputs(ELEMENTS[key].defaults);
    setResult(null);
    setElementId("");
  };

  const handleInput = (id, val) => {
    setInputs(p => ({ ...p, [id]: isNaN(val) || val === "" ? val : Number(val) }));
  };

  const handleCalculate = useCallback(() => {
    try {
      const { rows, warnings } = cfg.calculate(inputs);
      const totalKg = rows.reduce((a,r) => a + parseFloat(r.weight), 0);
      const opt     = optimizeBars(rows);
      setResult({ rows, warnings, totalKg: totalKg.toFixed(2), opt, elementType: cfg.label });
    } catch(e) { alert("Input error: " + e.message); }
  }, [activeEl, inputs]);

  const handleAdd = () => {
    if (!result) return;
    const el = {
      elementType: cfg.label,
      elementId:   elementId || `${cfg.label}-${allElements.length + 1}`,
      rows:        result.rows,
      warnings:    result.warnings,
      totalKg:     result.totalKg,
      barOptimization: result.opt,
      inputs:      { ...inputs },
    };
    setAllElements(p => [...p, el]);
    setResult(null);
    setElementId("");
    setActiveTab("summary");
  };

  return (
    <>
      <style>{styles}</style>
      <div className="bbs-wrapper">
        {/* Hero */}
        <div className="bbs-hero">
          <div className="bbs-hero-container">
            <div className="bbs-hero-badge">STRUCTURAL ENGINEERING TOOL</div>
            <h1 className="bbs-hero-title">
              Bar Bending Schedule <span>Generator</span>
            </h1>
            <p className="bbs-hero-sub">
              IS 456:2000 compliant · G+1 Residential focused · Auto lapping, optimization & cost estimation
            </p>
          </div>
        </div>

        {/* Main */}
        <div className="bbs-outer">
          {/* Tabs */}
          <div className="bbs-tabs">
            {[["inputs","⚙ Calculate"], ["summary","📊 Schedule"], ["isref","📋 IS Codes"]].map(([k,l]) => (
              <button key={k} className={`bbs-tab ${activeTab===k?"active":""}`} onClick={() => setActiveTab(k)}>
                {l}
              </button>
            ))}
          </div>

          {/* Project Info */}
          <div className="bbs-project-bar">
            {["projectName","engineer","location"].map((k,i) => (
              <input key={k} className="bbs-proj-input" 
                placeholder={["Project Name","Engineer Name","Location / Site"][i]}
                value={projectInfo[k]} 
                onChange={e => setProjectInfo(p => ({...p,[k]:e.target.value}))} />
            ))}
            <div className="bbs-rate-wrap">
              <span className="bbs-rate-label">Steel Rate ₹/kg</span>
              <input type="number" className="bbs-proj-input bbs-rate-input" 
                value={steelRate}
                onChange={e => setSteelRate(Number(e.target.value))} />
            </div>
          </div>

          {/* Inputs Tab */}
          {activeTab === "inputs" && (
            <div className="bbs-layout">
              {/* Input Panel */}
              <div className="bbs-panel bbs-input-panel">
                <div className="bbs-section-label">01 — SELECT ELEMENT</div>
                <div className="bbs-element-grid">
                  {Object.entries(ELEMENTS).map(([key,el]) => (
                    <button key={key} className={`bbs-element-btn ${activeEl===key?"active":""}`}
                      style={{"--el-color":el.color}} onClick={() => handleElChange(key)}>
                      <span className="bbs-el-icon">{el.icon}</span>
                      <span className="bbs-el-label">{el.label}</span>
                    </button>
                  ))}
                </div>

                <div className="bbs-section-label">02 — ELEMENT ID (optional)</div>
                <input className="bbs-input" placeholder="e.g. B1, B2, C1..."
                  value={elementId} onChange={e => setElementId(e.target.value)}
                  style={{marginBottom:"1.5rem"}} />

                <div className="bbs-section-label">03 — DIMENSIONS</div>
                <div className="bbs-fields">
                  {cfg.fields.map(f => (
                    <div className="bbs-field" key={f.id}>
                      <label className="bbs-field-label">
                        {f.label}
                        {f.hint && <span className="bbs-field-hint">{f.hint}</span>}
                      </label>
                      {f.type === "select" ? (
                        <select className="bbs-input" value={inputs[f.id]||""}
                          onChange={e => handleInput(f.id, Number(e.target.value))}>
                          {DIAMETERS.map(d => <option key={d} value={d}>Ø {d} mm</option>)}
                        </select>
                      ) : (
                        <input type="number" className="bbs-input"
                          value={inputs[f.id]||""} onChange={e => handleInput(f.id, e.target.value)} />
                      )}
                    </div>
                  ))}
                </div>

                {/* Assumptions */}
                <div className="bbs-assumptions">
                  <div className="bbs-assumptions-title">IS 456 Defaults Applied</div>
                  Cover: {COVER}mm | Ld: {LD_FACTOR}d | Hook: {HOOK_FACTOR}d | Lap: {LAP_FACTOR}d | Fe415 / M20
                </div>

                <div className="bbs-actions">
                  <button className="bbs-btn-primary" onClick={handleCalculate}>⚙ Calculate</button>
                  <button className="bbs-btn-ghost" onClick={() => { setInputs(cfg.defaults); setResult(null); }}>
                    Reset
                  </button>
                </div>
              </div>

              {/* Result Panel */}
              <div className="bbs-panel bbs-result-panel">
                {!result ? (
                  <div className="bbs-empty">
                    <div className="bbs-empty-icon">📐</div>
                    <div className="bbs-empty-title">Awaiting Calculation</div>
                    <div className="bbs-empty-sub">Fill inputs and click Calculate</div>
                  </div>
                ) : (
                  <>
                    {/* Warnings */}
                    {result.warnings?.length > 0 && (
                      <div className="bbs-warnings">
                        {result.warnings.map((w,i) => (
                          <div key={i} className={`bbs-warn-item ${w.includes('ERROR')?"bbs-warn-error":"bbs-warn-warn"}`}>
                            {w}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="bbs-result-header">
                      <div>
                        <div className="bbs-section-label">BBS RESULT</div>
                        <div className="bbs-result-title">{cfg.label}</div>
                      </div>
                      <button className="bbs-add-btn" onClick={handleAdd}>+ Add to Schedule</button>
                    </div>

                    {/* BBS Table */}
                    <div className="bbs-table-wrap">
                      <table className="bbs-table">
                        <thead><tr>
                          <th>Mark</th><th>Description</th><th>Ø</th><th>Qty</th>
                          <th>Cut Len(mm)</th><th>Lap(mm)</th><th>Total(m)</th>
                          <th>kg/m</th><th>Weight(kg)</th><th>IS Ref</th>
                        </tr></thead>
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
                              <td className="bbs-td-note bbs-is-ref">{r.isRef}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot><tr>
                          <td colSpan={8} className="bbs-total-label">TOTAL STEEL WEIGHT</td>
                          <td colSpan={2} className="bbs-total-value">{result.totalKg} kg</td>
                        </tr></tfoot>
                      </table>
                    </div>

                    {/* Cost Cards */}
                    <div className="bbs-cost-cards">
                      <div className="bbs-cost-card">
                        <div className="bbs-cost-label">Total Weight</div>
                        <div className="bbs-cost-value">{result.totalKg} <small>kg</small></div>
                      </div>
                      <div className="bbs-cost-card bbs-cost-highlight">
                        <div className="bbs-cost-label">Estimated Cost</div>
                        <div className="bbs-cost-value">
                          ₹{(parseFloat(result.totalKg) * steelRate).toLocaleString('en-IN',{maximumFractionDigits:0})}
                        </div>
                        <div className="bbs-cost-sub">@ ₹{steelRate}/kg</div>
                      </div>
                    </div>

                    {/* 12m Bar Optimization */}
                    <div className="bbs-opt-section">
                      <div className="bbs-section-label">12m BAR OPTIMIZATION</div>
                      <div className="bbs-opt-grid">
                        {result.opt.map((o,i) => (
                          <div key={i} className="bbs-opt-card">
                            <div className="bbs-opt-dia">Ø{o.dia} mm</div>
                            <div className="bbs-opt-row"><span>Full Bars (12m)</span><b>{o.fullBars} nos</b></div>
                            <div className="bbs-opt-row"><span>Pieces/Bar</span><b>{o.piecesPerBar}</b></div>
                            <div className="bbs-opt-row"><span>Total Pieces</span><b>{o.totalPieces}</b></div>
                            <div className={`bbs-opt-row bbs-opt-waste ${parseFloat(o.wastagePct)>8?"bbs-opt-waste-high":""}`}>
                              <span>Wastage</span>
                              <b>{parseFloat(o.wastageM).toFixed(2)}m ({o.wastagePct}%)</b>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}