/* eslint-disable no-unused-vars */
// ═══════════════════════════════════════════════════════════════════════════
// USE SLAB DESIGN HOOK — IS 456:2000
// Place in: src/pages/CalculatorPage/hooks/useSlabDesign.js
// ═══════════════════════════════════════════════════════════════════════════

import { useState } from "react";

const DEFAULT_INPUTS = {
  lx: "", // Short span (m)
  ly: "", // Long span (m)
  slabType: "two_way", // "one_way" | "two_way"
  supportType: "simply_supported", // "simply_supported" | "one_end_cont" | "both_end_cont" | "cantilever"
  ll: "3", // Live load (kN/m²)
  ff: "1.5", // Floor finish load (kN/m²)
  fck: "20", // Concrete grade (MPa)
  fy: "500", // Steel grade (MPa)
  cover: "20", // Clear cover (mm)
  exposure: "mild", // Exposure condition
};

// ── IS 456 Table 26 — Basic span/depth ratios ─────────────────────────────
const BASIC_SD_RATIO = {
  simply_supported: 20,
  one_end_cont: 26,
  both_end_cont: 32,
  cantilever: 7,
};

// ── IS 456 Table 27 — Two-way slab moment coefficients (αx, αy) ────────────
const TWO_WAY_COEFF = {
  1.0: { ax: 0.062, ay: 0.062 },
  1.1: { ax: 0.074, ay: 0.061 },
  1.2: { ax: 0.084, ay: 0.059 },
  1.3: { ax: 0.093, ay: 0.055 },
  1.4: { ax: 0.099, ay: 0.051 },
  1.5: { ax: 0.104, ay: 0.046 },
  1.75: { ax: 0.113, ay: 0.037 },
  2.0: { ax: 0.118, ay: 0.029 },
};

function getTwoWayCoeff(ratio) {
  const keys = Object.keys(TWO_WAY_COEFF)
    .map(Number)
    .sort((a, b) => a - b);
  if (ratio <= keys[0]) return TWO_WAY_COEFF[keys[0]];
  if (ratio >= keys[keys.length - 1])
    return TWO_WAY_COEFF[keys[keys.length - 1]];
  for (let i = 0; i < keys.length - 1; i++) {
    if (ratio >= keys[i] && ratio <= keys[i + 1]) {
      const t = (ratio - keys[i]) / (keys[i + 1] - keys[i]);
      const a = TWO_WAY_COEFF[keys[i]];
      const b = TWO_WAY_COEFF[keys[i + 1]];
      return { ax: a.ax + t * (b.ax - a.ax), ay: a.ay + t * (b.ay - a.ay) };
    }
  }
  return TWO_WAY_COEFF[keys[keys.length - 1]];
}

const XU_MAX_D = { 415: 0.48, 500: 0.46, 550: 0.44 };
const BOND_STRESS = {
  15: 1.28,
  20: 1.6,
  25: 1.76,
  30: 1.92,
  35: 2.08,
  40: 2.24,
};

function r2(n) {
  return Math.round(n * 100) / 100;
}
function r0(n) {
  return Math.round(n);
}

// COV is passed in so Ast_min uses the actual clear cover from inputs,
// not the previously hardcoded literal 20.
function designAst(Mu_kNm, d, fck, fy, cov) {
  const Mu = Mu_kNm * 1e6;
  const b = 1000;
  const R = Mu / (b * d * d);
  const term = 1 - Math.sqrt(1 - (4.6 * R) / fck);
  const pt = ((50 * fck) / fy) * term;
  const Ast_req = (pt / 100) * b * d;

  // FIX: was (d + parseFloat(20)) — now uses the actual cover value (cov)
  // IS 456 Cl. 26.5.2: Ast_min = 0.12% of b × D (overall depth = d + cov)
  const D_overall = d + cov;
  const Ast_min = Math.max((0.12 / 100) * b * D_overall, (0.85 * b * d) / fy);

  return {
    Ast_req: r2(Ast_req),
    Ast_min: r2(Ast_min),
    Ast_prov: r2(Math.max(Ast_req, Ast_min)),
    pt: r2(pt),
  };
}

function barOptions(Ast_prov) {
  const bars = [6, 8, 10, 12, 16];
  return bars
    .map((dia) => {
      const a = (Math.PI * dia * dia) / 4;
      const spacing = Math.floor(((a / Ast_prov) * 1000) / 25) * 25;
      const spacingClamped = Math.min(Math.max(spacing, 75), 300);
      const actualAst = (a / spacingClamped) * 1000;
      return { dia, spacing: spacingClamped, actualAst: r2(actualAst) };
    })
    .filter((o) => o.spacing >= 75 && o.spacing <= 300);
}

function devLength(dia, fck, fy) {
  const tbd = BOND_STRESS[fck] || BOND_STRESS[20];
  return Math.ceil((dia * 0.87 * fy) / (4 * tbd) / 10) * 10;
}

// ─────────────────────────────────────────────────────────────────────────────
// Compute beam Mu & Vu from slab results
// ─────────────────────────────────────────────────────────────────────────────
function computeBeamLoads(slabResults, inputs) {
  if (!slabResults || slabResults.error) return null;

  const { wu, slabType } = slabResults;
  const Lx = parseFloat(inputs.lx); // m
  const Ly = slabType === "two_way" ? parseFloat(inputs.ly) : null;
  const supportType = inputs.supportType;

  const kMap = {
    simply_supported: 8,
    one_end_cont: 10,
    both_end_cont: 12,
    cantilever: 2,
  };
  const k = kMap[supportType] || 8;

  if (slabType === "one_way") {
    const w_beam = wu * Lx;
    const beam_span = Lx;
    const Mu = r2((w_beam * beam_span * beam_span) / k);
    const Vu = r2((w_beam * beam_span) / 2);
    return {
      beamOnLongSide: null,
      beamOnShortSide: {
        label: "Beam along Short Span (lx)",
        span: beam_span,
        w_beam: r2(w_beam),
        Mu,
        Vu,
        supportType,
      },
    };
  }

  const w_short = r2((wu * Lx) / 3);
  const r = Lx / Ly;
  const w_long = r2((wu * Lx * (3 - r * r)) / 6);

  const Mu_short = r2((w_short * Lx * Lx) / k);
  const Vu_short = r2((w_short * Lx) / 2);

  const Mu_long = r2((w_long * Ly * Ly) / k);
  const Vu_long = r2((w_long * Ly) / 2);

  return {
    beamOnShortSide: {
      label: "Beam along Short Span (lx)",
      span: Lx,
      w_beam: w_short,
      Mu: Mu_short,
      Vu: Vu_short,
      supportType,
    },
    beamOnLongSide: {
      label: "Beam along Long Span (ly)",
      span: Ly,
      w_beam: w_long,
      Mu: Mu_long,
      Vu: Vu_long,
      supportType,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Compute column Pu from slab results
// ─────────────────────────────────────────────────────────────────────────────
function computeColumnLoad(slabResults, inputs) {
  if (!slabResults || slabResults.error) return null;

  const { wu, slabType } = slabResults;
  const Lx = parseFloat(inputs.lx);
  const Ly = slabType === "two_way" ? parseFloat(inputs.ly) : Lx;

  const trib_interior = r2((Lx / 2) * (Ly / 2));
  const trib_edge = r2(trib_interior / 2);
  const trib_corner = r2(trib_interior / 4);

  const Pu_interior = r2(wu * trib_interior * 1.1);
  const Pu_edge = r2(wu * trib_edge * 1.1);
  const Pu_corner = r2(wu * trib_corner * 1.1);

  return {
    wu,
    slabType,
    trib_interior,
    trib_edge,
    trib_corner,
    Pu_interior,
    Pu_edge,
    Pu_corner,
    note: "Per floor. Multiply by number of floors for multi-storey columns.",
  };
}

// ── Main design function ───────────────────────────────────────────────────
function designSlab(inputs) {
  const { lx, ly, slabType, supportType, ll, ff, fck, fy, cover } = inputs;

  const Lx = parseFloat(lx);
  const Ly = parseFloat(ly);
  const LL = parseFloat(ll);
  const FF = parseFloat(ff);
  const FCK = parseFloat(fck);
  const FY = parseFloat(fy);
  const COV = parseFloat(cover);

  if (!Lx || Lx <= 0) return { error: "Enter a valid short span (lx)" };
  if (slabType === "two_way" && (!Ly || Ly <= 0))
    return { error: "Enter a valid long span (ly) for two-way slab" };
  if (slabType === "two_way" && Ly < Lx)
    return { error: "ly must be ≥ lx. Enter the shorter span as lx." };

  const sdRatio = BASIC_SD_RATIO[supportType] || 20;
  const span = Lx;
  const d_trial = Math.ceil((span * 1000) / sdRatio / 5) * 5;
  const barDia_assumed = 10;
  const D_trial = d_trial + COV + barDia_assumed / 2;
  const D_prov = Math.ceil(D_trial / 10) * 10;
  const d_prov = D_prov - COV - barDia_assumed / 2;

  const sw = (D_prov / 1000) * 25;
  const DL = sw + FF;
  const wu = 1.5 * (DL + LL);

  let Mux, Muy, Mux_neg, Muy_neg;
  let isOneWay = slabType === "one_way";
  let ratio = slabType === "two_way" ? r2(Ly / Lx) : null;

  if (isOneWay) {
    const k =
      {
        simply_supported: 8,
        one_end_cont: 10,
        both_end_cont: 12,
        cantilever: 2,
      }[supportType] || 8;
    Mux = r2((wu * Lx * Lx) / k);
    Mux_neg =
      supportType === "simply_supported" ? 0 : r2((wu * Lx * Lx) / (k * 1.2));
    Muy = null;
    Muy_neg = null;
  } else {
    const coeff = getTwoWayCoeff(ratio);
    Mux = r2(coeff.ax * wu * Lx * Lx);
    Muy = r2(coeff.ay * wu * Lx * Lx);
    Mux_neg = r2(Mux * 1.33);
    Muy_neg = r2(Muy * 1.33);
  }

  // Pass COV into designAst so Ast_min uses the real overall depth
  const steelX = designAst(Mux, d_prov, FCK, FY, COV);
  const steelX_neg = Mux_neg ? designAst(Mux_neg, d_prov, FCK, FY, COV) : null;
  const d_y = isOneWay ? d_prov : d_prov - barDia_assumed;
  const steelY = !isOneWay ? designAst(Muy, d_y, FCK, FY, COV) : null;
  const steelY_neg =
    !isOneWay && Muy_neg ? designAst(Muy_neg, d_y, FCK, FY, COV) : null;

  const barsX = barOptions(steelX.Ast_prov);
  const barsX_neg = steelX_neg ? barOptions(steelX_neg.Ast_prov) : [];
  const barsY = steelY ? barOptions(steelY.Ast_prov) : [];
  const barsY_neg = steelY_neg ? barOptions(steelY_neg.Ast_prov) : [];

  const distAst = isOneWay ? r2((0.12 / 100) * 1000 * D_prov) : null;
  const distBars = distAst ? barOptions(distAst) : [];

  const actualSD = r2((span * 1000) / d_prov);
  const deflOk = actualSD <= sdRatio;
  const Ld = devLength(barDia_assumed, FCK, FY);

  const recBarX = barsX[0] || null;
  const recBarY = barsY[0] || null;
  const recDistB = distBars[0] || null;

  const steelKgPerM2 = r2(
    (recBarX
      ? ((((Math.PI * recBarX.dia ** 2) / 4) *
          (1000 / recBarX.spacing) *
          7850) /
          1e9) *
        1000
      : 0) +
      (recBarY
        ? ((((Math.PI * recBarY.dia ** 2) / 4) *
            (1000 / recBarY.spacing) *
            7850) /
            1e9) *
          1000
        : 0) +
      (recDistB
        ? ((((Math.PI * recDistB.dia ** 2) / 4) *
            (1000 / recDistB.spacing) *
            7850) /
            1e9) *
          1000
        : 0),
  );

  return {
    D_prov,
    d_prov,
    d_y,
    sdRatio,
    actualSD,
    deflOk,
    sw: r2(sw),
    DL: r2(DL),
    wu: r2(wu),
    slabType,
    supportType,
    ratio,
    Mux,
    Muy,
    Mux_neg,
    Muy_neg,
    steelX,
    steelX_neg,
    barsX,
    barsX_neg,
    steelY,
    steelY_neg,
    barsY,
    barsY_neg,
    distAst,
    distBars,
    Ld,
    steelKgPerM2,
    fck: FCK,
    fy: FY,
    cover: COV,
  };
}

// ── Hook ───────────────────────────────────────────────────────────────────
export function useSlabDesign() {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [results, setResults] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const calculate = () => {
    try {
      const result = designSlab(inputs);
      if (!result.error) {
        result.beamLoads = computeBeamLoads(result, inputs);
        result.columnLoad = computeColumnLoad(result, inputs);
      }
      setResults(result);
    } catch (err) {
      setResults({ error: err.message || "Calculation error" });
    }
  };

  const reset = () => {
    setInputs(DEFAULT_INPUTS);
    setResults(null);
  };

  const getBeamLoads = () => {
    if (!results || results.error) return null;
    return computeBeamLoads(results, inputs);
  };

  const getColumnLoad = () => {
    if (!results || results.error) return null;
    return computeColumnLoad(results, inputs);
  };

  return {
    inputs,
    results,
    handleInputChange,
    calculate,
    reset,
    getBeamLoads,
    getColumnLoad,
  };
}
