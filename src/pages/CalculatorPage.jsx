/**
 * CalculatorPage.jsx  —  Main orchestrator
 * Wires up all real hooks + calculation utils with the dashboard UI.
 * Uses existing CSS classes from _calculator.css, _design-calculator.css,
 * _boq-calculator.css, _herosection.css, _buttons.css, _animations.css.
 *
 * Imports (adjust paths to match your project structure):
 *   hooks  → src/hooks/use*.js
 *   utils  → src/utils/index.js
 *   styles → already imported globally via src/styles/index.css
 */

import { useState, useCallback, useMemo } from "react";

// ── Real hooks ──────────────────────────────────────────────────────────────
import { useCostingInputs } from "../hooks/useCostingInputs";
import { useBeamDesign } from "../hooks/useBeamDesign";
import { useColumnDesign } from "../hooks/useColumnDesign";
import { useSlabDesign } from "../hooks/useSlabDesign";
import { useBrickMasonry } from "../hooks/useBrickMasonry";
import { usePaintEstimator } from "../hooks/usePaintEstimator";

// ── Real calc utils ─────────────────────────────────────────────────────────
import {
  calcBuildingCost,
  calcStructureDesign,
  calcBrickMasonry,
  calcPaintEstimate,
  generateBOQ,
} from "../utils";

// ── Sub-tab components (existing) ────────────────────────────────────────────
import CostingInputPanel from "../components/costing/CostingInputPanel";
import CostingResults from "../components/costing/CostingResults";
import StructuralDesignTab from "../components/structural/StructuralDesignTab";
import BrickMasonryTab from "../components/brick/BrickMasonryTab";
import PaintEstimatorTab from "../components/paint/PaintEstimatorTab";

// ── BOQ component ─────────────────────────────────────────────────────────────
// BOQ is rendered inline below; swap with <BOQCalculatorTab /> if you have one.

/* ══════════════════════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════════════════════ */

const MAIN_TABS = [
  {
    id: "costing",
    icon: "₹",
    label: "Cost Estimate",
    sub: "Materials & Labour",
    color: "#003366",
  },
  {
    id: "structural",
    icon: "⬛",
    label: "Structural",
    sub: "Beam · Column · Slab",
    color: "#0369a1",
  },
  {
    id: "brick",
    icon: "▦",
    label: "Brick Masonry",
    sub: "Wall estimator",
    color: "#b45309",
  },
  {
    id: "paint",
    icon: "◈",
    label: "Paint",
    sub: "Coverage & cans",
    color: "#059669",
  },
  {
    id: "boq",
    icon: "≡",
    label: "BOQ",
    sub: "Bill of Quantities",
    color: "#7c3aed",
  },
];

const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const fmtL = (n) => (Number(n || 0) / 100000).toFixed(2) + "L";
const fmtNum = (n, unit = "") =>
  `${Number(n || 0).toLocaleString("en-IN")}${unit ? " " + unit : ""}`;

/* ══════════════════════════════════════════════════════════════════════════
   COSTING TAB
══════════════════════════════════════════════════════════════════════════ */

function CostingTab() {
  const { inputs, setField, resetInputs } = useCostingInputs();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("breakdown");

  const handleCalculate = useCallback(async () => {
    setLoading(true);
    // Small delay so the spinner is visible
    await new Promise((r) => setTimeout(r, 600));
    const res = calcBuildingCost(inputs);
    setResult(res);
    setLoading(false);
  }, [inputs]);

  return (
    <div className="calc-results-section" style={{ marginTop: 0 }}>
      {/* Input panel */}
      <div className="calc-input-section">
        <div className="calc-section-header">
          <span className="calc-panel-label">
            <span className="label-icon">🏗</span>
            Building Parameters
          </span>
          <button className="calc-btn-reset" onClick={resetInputs}>
            ↺ Reset
          </button>
        </div>

        {/* Delegate to existing input component */}
        <CostingInputPanel inputs={inputs} setField={setField} />

        <button
          className="calc-btn-primary"
          onClick={handleCalculate}
          disabled={loading}
        >
          {loading ? (
            <>
              <span
                className="loading-spinner"
                style={{ width: 18, height: 18, borderWidth: 2 }}
              />
              Calculating…
            </>
          ) : (
            "⚡ Calculate Cost"
          )}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="calc-results-section fade-in-up">
          {/* Cost banner */}
          <div className="calc-cost-banner">
            <div className="calc-hero-content">
              <div className="calc-estimate-label">Total Estimated Cost</div>
              <div className="calc-estimate-amount">
                {fmt(result.totalCost)}
              </div>
              <div className="calc-estimate-meta">
                <span>
                  Area: <strong>{fmtNum(result.builtUpArea, "sq ft")}</strong>
                </span>
                <span>
                  Rate: <strong>{fmt(result.ratePerSqft)}/sq ft</strong>
                </span>
                <span>
                  In Lakhs: <strong>{fmtL(result.totalCost)}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Sub-tabs */}
          <div className="calc-tabs">
            {["breakdown", "materials", "timeline"].map((t) => (
              <button
                key={t}
                className={`calc-tab${activeSubTab === t ? " active" : ""}`}
                onClick={() => setActiveSubTab(t)}
              >
                {t === "breakdown"
                  ? "📊 Cost Breakdown"
                  : t === "materials"
                    ? "🧱 Materials"
                    : "📅 Timeline"}
              </button>
            ))}
          </div>

          {/* Sub-tab content delegates to CostingResults */}
          <CostingResults result={result} activeTab={activeSubTab} />
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   STRUCTURAL TAB
══════════════════════════════════════════════════════════════════════════ */

function StructuralTab() {
  const beamHook = useBeamDesign();
  const columnHook = useColumnDesign();
  const slabHook = useSlabDesign();

  const [activeDesign, setActiveDesign] = useState("beam");

  const STRUCT_SUBTABS = [
    { id: "beam", icon: "━", label: "Beam Design", desc: "RCC beam sizing" },
    {
      id: "column",
      icon: "▋",
      label: "Column Design",
      desc: "Axial & lateral",
    },
    { id: "slab", icon: "▬", label: "Slab Design", desc: "One-way / two-way" },
  ];

  return (
    <div className="calc-input-section">
      {/* Sub-tab switcher */}
      <div className="struct-subtab-row">
        {STRUCT_SUBTABS.map((st) => (
          <button
            key={st.id}
            className={`struct-subtab-btn${activeDesign === st.id ? " active" : ""}`}
            onClick={() => setActiveDesign(st.id)}
          >
            <span className="struct-subtab-icon">{st.icon}</span>
            <span className="struct-subtab-text">
              <span className="struct-subtab-label">{st.label}</span>
              <span className="struct-subtab-desc">{st.desc}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Delegate to existing structural component */}
      <div className="struct-subtab-content">
        <StructuralDesignTab
          activeDesign={activeDesign}
          beamHook={beamHook}
          columnHook={columnHook}
          slabHook={slabHook}
          calcStructureDesign={calcStructureDesign}
        />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   BRICK MASONRY TAB (wrapper around existing component)
══════════════════════════════════════════════════════════════════════════ */

function BrickTab() {
  const hook = useBrickMasonry();
  return (
    <div className="calc-input-section">
      <BrickMasonryTab hook={hook} calcBrickMasonry={calcBrickMasonry} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PAINT TAB (wrapper around existing component)
══════════════════════════════════════════════════════════════════════════ */

function PaintTab() {
  const hook = usePaintEstimator();
  return (
    <div className="calc-input-section">
      <PaintEstimatorTab hook={hook} calcPaintEstimate={calcPaintEstimate} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   BOQ TAB
══════════════════════════════════════════════════════════════════════════ */

function BOQTab() {
  const { inputs: costInputs } = useCostingInputs();
  const [boqData, setBoqData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [floorTab, setFloorTab] = useState(0);
  const [search, setSearch] = useState("");

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    const data = generateBOQ(costInputs);
    setBoqData(data);
    setLoading(false);
  }, [costInputs]);

  // Flatten items for current floor, filtered by search
  const displayItems = useMemo(() => {
    if (!boqData) return [];
    const items = boqData.floors?.[floorTab]?.items ?? boqData.items ?? [];
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter(
      (i) =>
        i.description?.toLowerCase().includes(q) ||
        i.category?.toLowerCase().includes(q),
    );
  }, [boqData, floorTab, search]);

  const grandTotal = useMemo(
    () => displayItems.reduce((s, i) => s + (i.amount || 0), 0),
    [displayItems],
  );

  return (
    <div className="boq-calculator-root boq-wrapper">
      {!boqData ? (
        /* Generate prompt */
        <div className="calc-input-section">
          <div className="calc-section-header">
            <span className="calc-panel-label">
              <span className="label-icon">📋</span>
              Bill of Quantities Generator
            </span>
          </div>

          <div className="calc-card">
            <p className="calc-card-desc">
              BOQ is generated from your Costing tab inputs. Fill in the
              building details in the <strong>Cost Estimate</strong> tab first,
              then generate a full itemised bill here.
            </p>

            <div
              className="calc-highlight-grid"
              style={{ marginBottom: "1.5rem" }}
            >
              {[
                {
                  label: "Plots",
                  val: costInputs.plotArea ?? "—",
                  unit: "sq ft",
                },
                { label: "Floors", val: costInputs.floors ?? "—", unit: "" },
                {
                  label: "Type",
                  val: costInputs.buildingType ?? "—",
                  unit: "",
                },
                {
                  label: "Grade",
                  val: costInputs.finishGrade ?? "—",
                  unit: "",
                },
              ].map((c) => (
                <div
                  key={c.label}
                  className="calc-highlight-card calc-highlight-card--primary"
                >
                  <div className="calc-highlight-label">{c.label}</div>
                  <div className="calc-highlight-value">{c.val}</div>
                  {c.unit && (
                    <div className="calc-highlight-unit">{c.unit}</div>
                  )}
                </div>
              ))}
            </div>

            <button
              className="calc-btn-primary"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="loading-spinner"
                    style={{ width: 18, height: 18, borderWidth: 2 }}
                  />
                  Generating BOQ…
                </>
              ) : (
                "📋 Generate Bill of Quantities"
              )}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Masthead */}
          <div className="boq-masthead">
            <div>
              <div className="boq-masthead-tag">BILL OF QUANTITIES</div>
              <h2 className="boq-masthead-title">
                {costInputs.buildingType ?? "Residential"} Project
              </h2>
              <p className="boq-masthead-sub">
                {costInputs.plotArea ?? "—"} sq ft · {costInputs.floors ?? "—"}{" "}
                floor(s) · {costInputs.finishGrade ?? "Standard"} finish
              </p>
            </div>
            <div className="boq-grand-pill">
              <span className="boq-grand-label">Grand Total</span>
              <span className="boq-grand-amount">
                {fmt(boqData.grandTotal ?? grandTotal)}
              </span>
              <span className="boq-grand-approx">
                ≈ {fmtL(boqData.grandTotal ?? grandTotal)}
              </span>
            </div>
          </div>

          {/* Summary cards */}
          {boqData.summary && (
            <div className="boq-summary-row">
              {Object.entries(boqData.summary).map(([key, val], i) => {
                const colors = [
                  "boq-sum-blue",
                  "boq-sum-teal",
                  "boq-sum-amber",
                  "boq-sum-green",
                  "boq-sum-neutral",
                ];
                const icons = ["🏗", "🧱", "🔩", "🪟", "📦"];
                return (
                  <div
                    key={key}
                    className={`boq-sum-card ${colors[i % colors.length]}`}
                  >
                    <span className="boq-sum-icon">
                      {icons[i % icons.length]}
                    </span>
                    <div>
                      <div className="boq-sum-label">{key}</div>
                      <div className="boq-sum-value">
                        {typeof val === "number" ? fmt(val) : val}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Controls */}
          <div className="boq-controls">
            {/* Floor tabs (if multi-floor data available) */}
            {boqData.floors && boqData.floors.length > 1 && (
              <div className="boq-floor-tabs">
                {boqData.floors.map((fl, i) => (
                  <button
                    key={i}
                    className={`boq-floor-tab${floorTab === i ? " active" : ""}`}
                    onClick={() => setFloorTab(i)}
                  >
                    {fl.label ?? `Floor ${i + 1}`}
                    <span className="boq-floor-tab-count">
                      {fl.items?.length ?? 0}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Search */}
            <div className="boq-search-wrap">
              <span className="boq-search-icon">🔍</span>
              <input
                className="boq-search"
                placeholder="Search items…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className="boq-search-clear"
                  onClick={() => setSearch("")}
                >
                  ✕
                </button>
              )}
            </div>

            <button
              className="calc-btn-secondary"
              onClick={() => {
                setBoqData(null);
                setSearch("");
                setFloorTab(0);
              }}
            >
              ↺ Regenerate
            </button>
          </div>

          {/* Table */}
          <div className="boq-table-card">
            <div className="boq-table-scroll">
              <table className="boq-table">
                <thead>
                  <tr>
                    <th className="boq-th boq-th-sl">#</th>
                    <th className="boq-th boq-th-desc">Description of Work</th>
                    <th className="boq-th boq-th-sm">Unit</th>
                    <th className="boq-th boq-th-num">Qty</th>
                    <th className="boq-th boq-th-num">Rate (₹)</th>
                    <th className="boq-th boq-th-amt">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {displayItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          textAlign: "center",
                          padding: "2rem",
                          color: "var(--color-text-light)",
                        }}
                      >
                        No items found.
                      </td>
                    </tr>
                  ) : (
                    displayItems.map((item, idx) => (
                      <tr
                        key={idx}
                        className={`boq-tr${idx % 2 === 1 ? " boq-tr-alt" : ""}`}
                      >
                        <td className="boq-td boq-td-sl">{idx + 1}</td>
                        <td className="boq-td boq-td-desc">
                          <div
                            style={{
                              fontWeight: 600,
                              color: "var(--color-text)",
                              fontSize: "0.875rem",
                            }}
                          >
                            {item.description}
                          </div>
                          {item.category && (
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--color-text-light)",
                                marginTop: 2,
                              }}
                            >
                              {item.category}
                            </div>
                          )}
                          {item.spec && (
                            <div
                              style={{
                                fontSize: "0.72rem",
                                color: "var(--color-text-light)",
                                fontStyle: "italic",
                              }}
                            >
                              {item.spec}
                            </div>
                          )}
                        </td>
                        <td className="boq-td boq-td-sm">{item.unit}</td>
                        <td className="boq-td boq-td-num">
                          {fmtNum(item.qty)}
                        </td>
                        <td className="boq-td boq-td-num">
                          {fmtNum(item.rate)}
                        </td>
                        <td className="boq-td boq-td-amt">
                          <span className="boq-amount-pill">
                            {fmt(item.amount)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer totals */}
            <div className="boq-table-footer">
              <div className="boq-footer-row">
                <span className="boq-footer-label">Sub Total</span>
                <span className="boq-footer-value">{fmt(grandTotal)}</span>
              </div>
              {boqData.contingency != null && (
                <div className="boq-footer-row">
                  <span className="boq-footer-label">Contingency (5%)</span>
                  <span className="boq-footer-value">
                    {fmt(boqData.contingency)}
                  </span>
                </div>
              )}
              <div className="boq-footer-row boq-footer-grand">
                <span className="boq-footer-label">Grand Total</span>
                <span className="boq-footer-value">
                  {fmt(boqData.grandTotal ?? grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="boq-notes-card">
            <div className="boq-notes-header">📝 Notes & Assumptions</div>
            <ul className="boq-notes-list">
              <li>
                Rates are indicative and based on prevailing market prices.
              </li>
              <li>GST and other applicable taxes are not included.</li>
              <li>Quantities include standard wastage allowances (5–10%).</li>
              <li>Prices may vary based on site conditions and location.</li>
              <li>
                This BOQ is an estimate; actual quantities should be verified by
                a structural engineer.
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN PAGE — CalculatorPage
══════════════════════════════════════════════════════════════════════════ */

export default function CalculatorPage() {
  const [activeTab, setActiveTab] = useState("costing");

  const activeTabMeta = MAIN_TABS.find((t) => t.id === activeTab);

  return (
    <div className="calc-page">
      {/* ── Hero + Tab Bar (reuses .hs-root HeroSection styles) ── */}
      <div className="hs-root">
        {/* Top status bar */}
        <div className="hs-topbar">
          <div className="container">
            <div className="hs-topbar-inner">
              <span className="hs-topbar-badge">
                <span className="hs-topbar-dot" />
                Construction Suite
              </span>
              <div className="hs-topbar-sep" />
              {["Cost Estimator", "Structural Design", "BOQ Generator"].map(
                (f) => (
                  <span key={f} className="hs-topbar-feat">
                    <span className="hs-topbar-check">✓</span>
                    {f}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>

        {/* Hero body */}
        <div className="hs-body">
          <div className="hs-bg-grid" />
          <div className="hs-bg-glow" />
          <div className="container">
            <div className="hs-body-inner">
              {/* Left: headline */}
              <div className="hs-headline">
                <span className="hs-eyebrow">
                  <span className="hs-eyebrow-icon">🏗</span>
                  Professional Construction Tools
                </span>
                <h1 className="hs-title">
                  Build Smarter with
                  <span className="hs-title-accent">Accurate Estimates</span>
                </h1>
                <p className="hs-desc">
                  Instant cost breakdowns, structural design checks, and full
                  bill-of-quantities in one place — built for engineers,
                  contractors &amp; developers.
                </p>
                <div className="hs-pills">
                  <span className="hs-pill hs-pill--navy">
                    IS Code Compliant
                  </span>
                  <span className="hs-pill hs-pill--orange">
                    Real-time Calc
                  </span>
                  <span className="hs-pill hs-pill--green">Export Ready</span>
                </div>
              </div>

              {/* Right: stat boxes */}
              <div className="hs-stats-block">
                <div className="hs-stats-row">
                  <div className="hs-stat-box hs-stat-box--orange">
                    <div className="hs-stat-icon">📊</div>
                    <div className="hs-stat-num">5+</div>
                    <div className="hs-stat-label">Calculator Modules</div>
                  </div>
                  <div className="hs-stat-box hs-stat-box--navy">
                    <div className="hs-stat-icon">⚡</div>
                    <div className="hs-stat-num">&lt;1s</div>
                    <div className="hs-stat-label">Instant Results</div>
                  </div>
                </div>
                <div className="hs-feat-list">
                  {[
                    {
                      icon: "🧱",
                      title: "Material Takeoff",
                      sub: "Cement, steel, bricks, paint",
                    },
                    {
                      icon: "⚖",
                      title: "Structural Checks",
                      sub: "Beam, column & slab design",
                    },
                    {
                      icon: "📋",
                      title: "BOQ Generation",
                      sub: "Itemised bill in seconds",
                    },
                  ].map((f) => (
                    <div key={f.title} className="hs-feat-item">
                      <div className="hs-feat-icon">{f.icon}</div>
                      <div className="hs-feat-text">
                        <strong>{f.title}</strong>
                        <span>{f.sub}</span>
                      </div>
                      <span className="hs-feat-arrow">›</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tab strip ── */}
        <div className="hs-tabs-wrap">
          <div className="container">
            <div className="hs-tabs" role="tablist">
              {MAIN_TABS.map((tab, i) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={`hs-tab${activeTab === tab.id ? " hs-tab--active" : ""}`}
                  style={{ "--tab-color": tab.color }}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="hs-tab-num">0{i + 1}</span>
                  <div className="hs-tab-icon-wrap">{tab.icon}</div>
                  <div className="hs-tab-body">
                    <span className="hs-tab-label">{tab.label}</span>
                    <span className="hs-tab-sub">{tab.sub}</span>
                  </div>
                  {activeTab === tab.id && (
                    <div className="hs-tab-active-bar" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content area ── */}
      <main
        className="calc-main"
        role="tabpanel"
        aria-label={activeTabMeta?.label}
      >
        {activeTab === "costing" && <CostingTab />}
        {activeTab === "structural" && <StructuralTab />}
        {activeTab === "brick" && <BrickTab />}
        {activeTab === "paint" && <PaintTab />}
        {activeTab === "boq" && <BOQTab />}
      </main>
    </div>
  );
}
