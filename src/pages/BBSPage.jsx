import { useState, useCallback, useMemo } from "react";
import "../styles/pages/_bbs-generator.css";

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
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function BBSGenerator() {
  const [activeEl,     setActiveEl]     = useState("beam");
  const [inputs,       setInputs]       = useState(ELEMENTS.beam.defaults);
  const [result,       setResult]       = useState(null);
  const [allElements,  setAllElements]  = useState([]);     // multi-element accumulator
  const [steelRate,    setSteelRate]    = useState(78.5);   // ₹/kg
  const [projectInfo,  setProjectInfo]  = useState({ projectName:"", engineer:"", location:"" });
  const [activeTab,    setActiveTab]    = useState("inputs"); // inputs | summary | isref
  const [pdfLoading,   setPdfLoading]   = useState(false);
  const [elementId,    setElementId]    = useState("");

  const cfg = ELEMENTS[activeEl];

  // ── Switch element ────────────────────────────────────────────────────
  const handleElChange = (key) => {
    setActiveEl(key);
    setInputs(ELEMENTS[key].defaults);
    setResult(null);
    setElementId("");
  };

  // ── Input change ──────────────────────────────────────────────────────
  const handleInput = (id, val) => {
    setInputs(p => ({ ...p, [id]: isNaN(val) || val === "" ? val : Number(val) }));
  };

  // ── Calculate ─────────────────────────────────────────────────────────
  const handleCalculate = useCallback(() => {
    try {
      const { rows, warnings } = cfg.calculate(inputs);
      const totalKg = rows.reduce((a,r) => a + parseFloat(r.weight), 0);
      const opt     = optimizeBars(rows);
      setResult({ rows, warnings, totalKg: totalKg.toFixed(2), opt, elementType: cfg.label });
    } catch(e) { alert("Input error: " + e.message); }
  }, [activeEl, inputs]);

  // ── Add to schedule ───────────────────────────────────────────────────
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

  // ── Remove element ────────────────────────────────────────────────────
  const handleRemove = (idx) => setAllElements(p => p.filter((_,i) => i !== idx));

  // ── Summary ───────────────────────────────────────────────────────────
  const summary = useMemo(() => {
    if (!allElements.length) return null;
    const allRows = allElements.flatMap(e => e.rows);
    return buildSummary(allRows);
  }, [allElements]);

  // ── CSV Export ────────────────────────────────────────────────────────
  const handleCSV = () => {
    if (!allElements.length) return;
    let csv = "Element,Bar Mark,Description,Dia (mm),Qty,Cut Length (mm),Lap Length (mm),Total Length (m),Wt/m (kg/m),Weight (kg),IS Ref\n";
    allElements.forEach(el => {
      el.rows.forEach(r => {
        csv += `"${el.elementId}","${r.mark}","${r.desc}",${r.dia},${r.qty},${r.cutLen},${r.lapLen},${r.totalLenM},${r.wtPerM},${r.weight},"${r.isRef}"\n`;
      });
    });
    if (summary) {
      csv += "\nDiameter Summary\nDia (mm),Total Weight (kg),12m Bars Required\n";
      summary.byDia.forEach(s => { csv += `${s.dia},${s.totalKg},${s.bars12m}\n`; });
      csv += `\nGRAND TOTAL,${summary.totalKg},\n`;
    }
    const blob = new Blob([csv], { type:"text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "BBS_Schedule.csv"; a.click();
  };

  // ── PDF Export (calls Python via data URL approach) ───────────────────
  const handlePDF = async () => {
    if (!allElements.length) { alert("Add at least one element first."); return; }
    setPdfLoading(true);
    try {
      const payload = {
        projectInfo,
        elements: allElements,
        steelRates: { default: steelRate },
        summary: summary || {},
      };
      // Build download via a server endpoint OR generate client-side HTML for printing
      generatePrintHTML(payload);
    } catch(e) { alert("PDF error: " + e.message); }
    finally { setPdfLoading(false); }
  };

  // Client-side printable HTML (since no server in React SPA)
  const generatePrintHTML = (payload) => {
    const { projectInfo: pi, elements, summary: sum, steelRates } = payload;
    const rate = steelRates.default;
    let totalCost = 0;
    if (sum?.byDia) sum.byDia.forEach(s => { totalCost += s.totalKg * rate; });

    const rows = elements.map(el => `
      <div class="el-block">
        <div class="el-title">● ${el.elementType.toUpperCase()} &mdash; ${el.elementId}</div>
        ${el.warnings?.map(w => `<div class="warn">${w}</div>`).join('')||''}
        <table>
          <thead><tr>
            <th>Mark</th><th>Description</th><th>Ø(mm)</th><th>Qty</th>
            <th>Cut Length(mm)</th><th>Lap(mm)</th><th>Total(m)</th>
            <th>kg/m</th><th>Weight(kg)</th><th>IS Ref</th>
          </tr></thead>
          <tbody>
            ${el.rows.map(r=>`<tr>
              <td><b>${r.mark}</b></td><td>${r.desc}</td><td><b>${r.dia}</b></td>
              <td>${r.qty}</td><td>${Number(r.cutLen).toLocaleString()}</td>
              <td>${r.lapLen||0}</td><td>${r.totalLenM}</td>
              <td>${r.wtPerM}</td><td><b>${r.weight}</b></td>
              <td class="is-ref">${r.isRef}</td>
            </tr>`).join('')}
            <tr class="subtotal"><td colspan="8"><b>SUBTOTAL</b></td><td><b>${el.totalKg} kg</b></td><td></td></tr>
          </tbody>
        </table>
        ${el.barOptimization?.length ? `
        <div class="opt-title">12m Bar Optimization</div>
        <table class="opt-table">
          <thead><tr><th>Ø(mm)</th><th>Bars(12m)</th><th>Pcs/Bar</th><th>Total Pcs</th><th>Wastage(m)</th><th>Wastage%</th></tr></thead>
          <tbody>${el.barOptimization.map(o=>`<tr>
            <td>Ø${o.dia}</td><td>${o.fullBars}</td><td>${o.piecesPerBar}</td>
            <td>${o.totalPieces}</td><td>${parseFloat(o.wastageM).toFixed(2)}</td><td>${o.wastagePct}%</td>
          </tr>`).join('')}</tbody>
        </table>` : ''}
      </div>`).join('');

    const sumRows = sum?.byDia?.map(s => {
      const cost = (s.totalKg * rate).toFixed(0);
      return `<tr><td>Ø${s.dia}</td><td>${s.totalKg}</td><td>₹${rate}</td><td>₹${Number(cost).toLocaleString()}</td><td>${s.bars12m} nos</td></tr>`;
    }).join('') || '';

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>Bar Bending Schedule — ${pi.projectName||'Project'}</title>
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Segoe UI',Arial,sans-serif;font-size:8.5pt;color:#0f172a;background:#fff}
      .header{background:#003366;color:#fff;padding:10px 14px;display:flex;justify-content:space-between;align-items:center}
      .header h1{font-size:14pt;letter-spacing:.05em}
      .header .sub{font-size:7.5pt;color:#FFD580;margin-top:3px}
      .header .right{text-align:right;font-size:7.5pt}
      .info-box{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;background:#F0F4F8;padding:6px 14px;gap:8px;border-bottom:2px solid #003366}
      .info-item label{font-size:6.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#475569;display:block}
      .info-item span{font-size:8pt;font-weight:600;color:#003366}
      .content{padding:10px 14px}
      .el-block{margin-bottom:16px;page-break-inside:avoid}
      .el-title{font-size:10pt;font-weight:700;color:#003366;margin-bottom:4px;border-left:3px solid #FF8C00;padding-left:8px}
      .warn{font-size:7pt;color:#D97706;margin-bottom:2px;padding:2px 6px;background:#FEF3C7;border-radius:3px}
      table{width:100%;border-collapse:collapse;margin-bottom:6px;font-size:7.5pt}
      th{background:#003366;color:#fff;padding:4px 6px;font-size:7pt;text-align:left}
      td{padding:3px 6px;border-bottom:1px solid #DDE3ED;vertical-align:middle}
      tr:nth-child(even) td{background:#F0F4F8}
      .subtotal td{background:#EEF2F8!important;font-size:8.5pt;border-top:1.5px solid #003366}
      .is-ref{color:#2563EB;font-size:6.5pt}
      .opt-title{font-size:7.5pt;font-weight:700;color:#1A4F8A;margin:4px 0 3px;text-transform:uppercase;letter-spacing:.08em}
      .opt-table th{background:#1A4F8A}
      .summary-section{margin-top:12px;page-break-inside:avoid}
      .summary-title{font-size:10pt;font-weight:700;color:#003366;margin-bottom:6px;padding:4px 8px;background:#F0F4F8;border-left:3px solid #FF8C00}
      .cost-bar{display:grid;grid-template-columns:1fr 1fr;margin-top:8px}
      .cost-item{padding:8px 12px;font-size:10pt;font-weight:700;color:#fff;text-align:center}
      .cost-navy{background:#003366}.cost-orange{background:#FF8C00}
      .is-section{margin-top:12px;page-break-inside:avoid}
      .footer{margin-top:10px;padding:6px 14px;background:#F0F4F8;font-size:6.5pt;color:#475569;border-top:1px solid #DDE3ED;display:flex;justify-content:space-between}
      @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
    </style></head><body>
    <div class="header">
      <div><h1>BAR BENDING SCHEDULE</h1><div class="sub">IS 456:2000 | G+1 Residential | Auto-Generated</div></div>
      <div class="right">
        ${pi.projectName?`<b>Project:</b> ${pi.projectName}<br>`:''}
        ${pi.engineer?`<b>Engineer:</b> ${pi.engineer}<br>`:''}
        <b>Date:</b> ${new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}
      </div>
    </div>
    <div class="info-box">
      <div class="info-item"><label>Project</label><span>${pi.projectName||'—'}</span></div>
      <div class="info-item"><label>Location</label><span>${pi.location||'—'}</span></div>
      <div class="info-item"><label>Grade</label><span>Fe415 / M20</span></div>
      <div class="info-item"><label>Cover | Ld | Lap</label><span>40mm | 40d | 50d</span></div>
    </div>
    <div class="content">
      ${rows}
      <div class="summary-section">
        <div class="summary-title">STEEL SUMMARY BY DIAMETER</div>
        <table>
          <thead><tr><th>Dia (mm)</th><th>Total Wt (kg)</th><th>Rate (₹/kg)</th><th>Cost (₹)</th><th>12m Bars Required</th></tr></thead>
          <tbody>${sumRows}</tbody>
          <tfoot><tr style="background:#003366;color:#fff">
            <td><b>TOTAL</b></td><td><b>${sum?.totalKg||0} kg</b></td><td></td>
            <td><b>₹${totalCost.toLocaleString('en-IN',{maximumFractionDigits:0})}</b></td><td></td>
          </tr></tfoot>
        </table>
        <div class="cost-bar">
          <div class="cost-item cost-navy">TOTAL STEEL: ${sum?.totalKg||0} kg</div>
          <div class="cost-item cost-orange">EST. COST: ₹${totalCost.toLocaleString('en-IN',{maximumFractionDigits:0})}</div>
        </div>
      </div>
      <div class="is-section">
        <div class="summary-title">IS CODE REFERENCES</div>
        <table>
          <thead><tr><th>Clause</th><th>Description</th><th>Value Used</th></tr></thead>
          <tbody>
            <tr><td>IS 456 Cl.26.4</td><td>Nominal Cover (Moderate exp.)</td><td>40 mm</td></tr>
            <tr><td>IS 456 Cl.26.2.1</td><td>Development Length — Fe415/M20</td><td>40d</td></tr>
            <tr><td>IS 456 Cl.26.2.5</td><td>Lap Splice Length (tension)</td><td>50d</td></tr>
            <tr><td>IS 456 Cl.26.5.2.1</td><td>Min. Reinf. in Beams</td><td>0.85bwd/fy</td></tr>
            <tr><td>IS 456 Cl.26.5.3.1</td><td>Min. Reinf. in Columns</td><td>0.8% Ag</td></tr>
            <tr><td>IS 456 Cl.26.5.3.2</td><td>Max Tie Spacing</td><td>min(b, 16d, 300mm)</td></tr>
            <tr><td>IS 456 Cl.24.1</td><td>Min Slab Thickness</td><td>125 mm</td></tr>
            <tr><td>SP 34</td><td>Standard Hook</td><td>9d</td></tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="footer">
      <span>Generated by BBS Generator | IS 456:2000 Compliant | Assumptions: Fe415, M20, Moderate Exposure</span>
      <span>This is a preliminary estimate. Verify with structural engineer before construction.</span>
    </div>
    <script>window.onload=()=>window.print()</script>
    </body></html>`;

    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
  };

  /* ─── RENDER ─────────────────────────────────────────────────────────── */
  return (
    <div className="bbs-wrapper">
      {/* Hero */}
      <div className="bbs-hero">
        <div className="bbs-hero-badge">STRUCTURAL ENGINEERING TOOL</div>
        <h1 className="bbs-hero-title">Bar Bending Schedule <span>Generator</span></h1>
        <p className="bbs-hero-sub">IS 456:2000 compliant · G+1 Residential focused · Auto lapping, optimization &amp; cost estimation</p>
      </div>

      {/* Main */}
      <div className="bbs-outer">
        {/* ── Tab bar ── */}
        <div className="bbs-tabs">
          {[["inputs","⚙ Calculate"], ["summary","📊 Schedule"], ["isref","📋 IS Codes"]].map(([k,l]) => (
            <button key={k} className={`bbs-tab ${activeTab===k?"active":""}`} onClick={() => setActiveTab(k)}>{l}</button>
          ))}
        </div>

        {/* ── PROJECT INFO ── */}
        <div className="bbs-project-bar">
          {["projectName","engineer","location"].map((k,i) => (
            <input key={k} className="bbs-proj-input" placeholder={["Project Name","Engineer Name","Location / Site"][i]}
              value={projectInfo[k]} onChange={e => setProjectInfo(p => ({...p,[k]:e.target.value}))} />
          ))}
          <div className="bbs-rate-wrap">
            <span className="bbs-rate-label">Steel Rate ₹/kg</span>
            <input type="number" className="bbs-proj-input bbs-rate-input" value={steelRate}
              onChange={e => setSteelRate(Number(e.target.value))} />
          </div>
        </div>

        {/* ─────── TAB: INPUTS ─────── */}
        {activeTab === "inputs" && (
          <div className="bbs-layout">
            {/* LEFT: Input Panel */}
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
              <input className="bbs-input" placeholder={`e.g. B1, B2, C1...`}
                value={elementId} onChange={e => setElementId(e.target.value)}
                style={{marginBottom:"var(--sp-5)"}} />

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
                Cover: {COVER}mm &nbsp;|&nbsp; Ld: {LD_FACTOR}d &nbsp;|&nbsp; Hook: {HOOK_FACTOR}d &nbsp;|&nbsp;
                Lap: {LAP_FACTOR}d &nbsp;|&nbsp; Fe415 / M20
              </div>

              <div className="bbs-actions">
                <button className="bbs-btn-primary" onClick={handleCalculate}>⚙ Calculate</button>
                <button className="bbs-btn-ghost"   onClick={() => { setInputs(cfg.defaults); setResult(null); }}>Reset</button>
              </div>
            </div>

            {/* RIGHT: Result Panel */}
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
                        <div key={i} className={`bbs-warn-item ${w.includes('ERROR')?"bbs-warn-error":"bbs-warn-warn"}`}>{w}</div>
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

                  {/* Cost Card */}
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

        {/* ─────── TAB: SUMMARY / SCHEDULE ─────── */}
        {activeTab === "summary" && (
          <div className="bbs-summary-page">
            {!allElements.length ? (
              <div className="bbs-empty" style={{minHeight:"300px"}}>
                <div className="bbs-empty-icon">📋</div>
                <div className="bbs-empty-title">No Elements Added</div>
                <div className="bbs-empty-sub">Calculate elements and click "Add to Schedule"</div>
              </div>
            ) : (
              <>
                {/* Actions */}
                <div className="bbs-sched-actions">
                  <button className="bbs-btn-primary" onClick={handlePDF} disabled={pdfLoading}>
                    {pdfLoading ? "⏳ Generating…" : "🖨 Print / PDF"}
                  </button>
                  <button className="bbs-btn-ghost" onClick={handleCSV}>↓ Export CSV</button>
                  <span className="bbs-sched-count">{allElements.length} element{allElements.length>1?"s":""} added</span>
                </div>

                {/* Per-element cards */}
                {allElements.map((el, idx) => (
                  <div key={idx} className="bbs-sched-card">
                    <div className="bbs-sched-card-header">
                      <span className="bbs-sched-el-type">{el.elementType}</span>
                      <span className="bbs-sched-el-id">{el.elementId}</span>
                      <span className="bbs-sched-el-wt">{el.totalKg} kg</span>
                      <button className="bbs-remove-btn" onClick={() => handleRemove(idx)}>✕</button>
                    </div>
                    {el.warnings?.length > 0 &&
                      <div className="bbs-sched-warns">{el.warnings.map((w,i)=><div key={i} className="bbs-warn-item bbs-warn-warn">{w}</div>)}</div>}
                    <div className="bbs-table-wrap">
                      <table className="bbs-table">
                        <thead><tr>
                          <th>Mark</th><th>Description</th><th>Ø</th><th>Qty</th>
                          <th>Cut(mm)</th><th>Lap(mm)</th><th>Total(m)</th><th>Wt(kg)</th><th>IS Ref</th>
                        </tr></thead>
                        <tbody>{el.rows.map((r,i) => (
                          <tr key={i}>
                            <td><b>{r.mark}</b></td><td className="bbs-td-desc">{r.desc}</td>
                            <td><span className="bbs-dia-badge">Ø{r.dia}</span></td>
                            <td className="bbs-td-num">{r.qty}</td>
                            <td className="bbs-td-num">{Number(r.cutLen).toLocaleString()}</td>
                            <td className="bbs-td-num bbs-lap">{r.lapLen||0}</td>
                            <td className="bbs-td-num">{r.totalLenM}</td>
                            <td className="bbs-td-num bbs-weight">{r.weight}</td>
                            <td className="bbs-td-note bbs-is-ref">{r.isRef}</td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  </div>
                ))}

                {/* Overall Summary */}
                {summary && (
                  <div className="bbs-overall-summary">
                    <div className="bbs-section-label">STEEL SUMMARY BY DIAMETER</div>
                    <div className="bbs-dia-summary-grid">
                      {summary.byDia.map((s,i) => (
                        <div key={i} className="bbs-dia-card">
                          <div className="bbs-dia-head">Ø{s.dia} mm</div>
                          <div className="bbs-dia-kg">{s.totalKg} <small>kg</small></div>
                          <div className="bbs-dia-bars">{s.bars12m} bars × 12m</div>
                          <div className="bbs-dia-cost">₹{(s.totalKg * steelRate).toLocaleString('en-IN',{maximumFractionDigits:0})}</div>
                        </div>
                      ))}
                    </div>
                    <div className="bbs-grand-bar">
                      <div className="bbs-grand-item bbs-grand-navy">
                        <span>TOTAL STEEL</span>
                        <strong>{summary.totalKg} kg</strong>
                      </div>
                      <div className="bbs-grand-item bbs-grand-orange">
                        <span>ESTIMATED COST</span>
                        <strong>₹{(summary.totalKg * steelRate).toLocaleString('en-IN',{maximumFractionDigits:0})}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ─────── TAB: IS CODES ─────── */}
        {activeTab === "isref" && (
          <div className="bbs-isref-page">
            <div className="bbs-section-label">IS 456 : 2000 — KEY CLAUSES USED</div>
            <div className="bbs-isref-grid">
              {[
                { clause:"IS 456 Cl.26.4",     title:"Nominal Cover",              detail:"Mild: 20mm | Moderate: 30mm | Severe: 45mm | Default used: 40mm", color:"#003366" },
                { clause:"IS 456 Cl.26.2.1",   title:"Development Length (Ld)",    detail:"Ld = 40d for Fe415, M20, tension zone. Compression: 25% reduction allowed.", color:"#2563EB" },
                { clause:"IS 456 Cl.26.2.5",   title:"Lap Splice Length",          detail:"Tension: 50d | Compression: 40d | Staggering preferred in columns.", color:"#7C3AED" },
                { clause:"IS 456 Cl.26.5.2.1", title:"Min. Beam Reinforcement",    detail:"Ast_min = 0.85 × b × d / fy (tension). Max: 0.04bD.", color:"#e8552a" },
                { clause:"IS 456 Cl.26.5.3.1", title:"Column Reinforcement",       detail:"Min: 0.8% Ag | Max: 6% Ag (4% preferred). Min 4 bars for rectangular.", color:"#2a6ee8" },
                { clause:"IS 456 Cl.26.5.3.2", title:"Lateral Tie Spacing",        detail:"Max spacing = min(least lateral dim, 16× long bar dia, 300mm).", color:"#1A4F8A" },
                { clause:"IS 456 Cl.26.5.2.2", title:"Stirrup Spacing",            detail:"Max = 0.75d for vertical stirrups | Reduce in shear zones.", color:"#D97706" },
                { clause:"IS 456 Cl.24.1",     title:"Min Slab Thickness",         detail:"One-way: 75mm | Two-way: 125mm | 150mm recommended for residential.", color:"#27a96b" },
                { clause:"IS 456 Cl.26.3.3",   title:"Max Slab Bar Spacing",       detail:"Main: ≤3D or 300mm | Dist: ≤5D or 450mm (D = slab thickness).", color:"#059669" },
                { clause:"IS 456 Cl.34.1",     title:"Footing Reinforcement",      detail:"Min 0.12% of cross-section area. Hooks required at ends.", color:"#8b5cf6" },
                { clause:"SP 34 — Hook",        title:"Standard Hook Dimensions",   detail:"90° hook = 9d + 4d extension. 180° hook = 9d. Minimum bend dia = 4d.", color:"#475569" },
                { clause:"IS 2502",            title:"12m Standard Bar Length",    detail:"Standard mill bar = 12000mm. Wastage allowance: 3–5% typical site.", color:"#0f172a" },
              ].map((item,i) => (
                <div key={i} className="bbs-isref-card" style={{"--ref-color":item.color}}>
                  <div className="bbs-isref-clause">{item.clause}</div>
                  <div className="bbs-isref-title">{item.title}</div>
                  <div className="bbs-isref-detail">{item.detail}</div>
                </div>
              ))}
            </div>
            <div className="bbs-isref-note">
              ⚠ This tool is for preliminary estimation only. Always verify with a qualified structural engineer. Assumptions: Fe415 HYSD, M20 concrete, moderate exposure, normal weight concrete.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}