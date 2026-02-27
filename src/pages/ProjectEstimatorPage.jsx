// ═══════════════════════════════════════════════════════════════════════════
// ProjectEstimatorPage.jsx  — Civil Estimator Professional Dashboard
// Smart per-project-type dynamic fields with real WB PWD SOR rates
// ═══════════════════════════════════════════════════════════════════════════

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { SITE } from "../config/constants";
import { useProjectEstimator } from "../hooks/useProjectEstimator";
import "../styles/pages/_project-estimator.css";

// ── Sidebar nav ─────────────────────────────────────────────────────────────
// type: "local"  → handled inside this page
// type: "tab"    → navigate to CalculatorPage with that tab active
// type: "route"  → navigate to a different route
const SIDEBAR_NAV = {
  CALCULATORS: [
    { id: "estimator", icon: "📐", label: "Project Estimator", type: "local" },
    {
      id: "costing",
      icon: "💰",
      label: "Concrete",
      type: "tab",
      tab: "costing",
    },
    {
      id: "structural",
      icon: "🏗️",
      label: "Steel / Rebar",
      type: "tab",
      tab: "structural",
    },
    { id: "brick", icon: "🧱", label: "Brickwork", type: "tab", tab: "brick" },
    {
      id: "costing2",
      icon: "⛏️",
      label: "Excavation",
      type: "tab",
      tab: "costing",
    },
    {
      id: "costing3",
      icon: "🖌️",
      label: "Plastering",
      type: "tab",
      tab: "costing",
    },
    { id: "paint", icon: "🎨", label: "Painting", type: "tab", tab: "paint" },
    { id: "boq", icon: "🪵", label: "Flooring", type: "tab", tab: "boq" },
  ],
  REPORTS: [
    { id: "history", icon: "🕐", label: "Estimate History", type: "local" },
    { id: "rates", icon: "📋", label: "Material Rates", type: "local" },
  ],
};

// ── Unit badge ──────────────────────────────────────────────────────────────
function UnitBadge({ unit }) {
  const clr =
    {
      cum: "#2563eb",
      sqm: "#059669",
      sqft: "#7c3aed",
      kg: "#d97706",
      nos: "#0891b2",
      rmt: "#9333ea",
      LS: "#6b7280",
      ft: "#0369a1",
    }[unit] ?? "#64748b";
  return (
    <span className="pe-unit-badge" style={{ "--badge-color": clr }}>
      {unit}
    </span>
  );
}

// ── Tag badge ───────────────────────────────────────────────────────────────
function TagBadge({ tag }) {
  const clr =
    {
      COMPLETE: "#0369a1",
      FOUNDATION: "#92400e",
      STRUCTURAL: "#065f46",
      MASONRY: "#7c2d12",
    }[tag] ?? "#374151";
  return (
    <span
      className="pe-result-tag"
      style={{
        background: `color-mix(in srgb, ${clr} 12%, white)`,
        color: clr,
      }}
    >
      {tag}
    </span>
  );
}

// ── History page ─────────────────────────────────────────────────────────────
function HistoryPage({ history }) {
  return (
    <div className="pe-result-card">
      <h2 className="pe-result-card-title">🕐 Estimate History</h2>
      {history.length === 0 ? (
        <div className="pe-empty-state">
          <span className="pe-empty-icon">📂</span>
          <p>No saved estimates yet. Calculate and save to see history here.</p>
        </div>
      ) : (
        <table className="pe-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Project Name</th>
              <th>Type</th>
              <th>Date</th>
              <th>Grand Total</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h, i) => (
              <tr key={h.id}>
                <td className="pe-td-center pe-td-dim">{i + 1}</td>
                <td className="pe-td-bold">{h.projectName}</td>
                <td className="pe-td-dim">{h.projectType}</td>
                <td className="pe-td-dim">{h.date}</td>
                <td className="pe-td-green">
                  ₹{h.grandTotal.toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── Rates page ──────────────────────────────────────────────────────────────
function RatesPage() {
  const rates = [
    { m: "Excavation", u: "cum", r: "₹140", s: "WB PWD SOR 2023-24" },
    { m: "PCC 1:4:8", u: "cum", r: "₹5,400", s: "Incl. labour & material" },
    { m: "RCC M20 Footing", u: "cum", r: "₹9,900", s: "Incl. 40 kg/cum steel" },
    {
      m: "RCC M20 Column",
      u: "cum",
      r: "₹12,400",
      s: "Incl. 120 kg/cum steel",
    },
    { m: "RCC M20 Beam", u: "cum", r: "₹11,600", s: "Incl. 110 kg/cum steel" },
    { m: "RCC M20 Slab", u: "cum", r: "₹10,600", s: "Incl. 80 kg/cum steel" },
    {
      m: "Brick Masonry 230mm",
      u: "cum",
      r: "₹5,400",
      s: "CM 1:6, IS 1077 bricks",
    },
    { m: "Brick Masonry 115mm", u: "cum", r: "₹5,000", s: "Partition walls" },
    { m: "Cement Plaster Int.", u: "sqm", r: "₹270", s: "12mm thick, 1:4 mix" },
    { m: "Cement Plaster Ext.", u: "sqm", r: "₹320", s: "15mm thick, 1:3 mix" },
    {
      m: "Paint (Internal)",
      u: "sqm",
      r: "₹195",
      s: "2 coats Nerolac emulsion",
    },
    {
      m: "Paint (External)",
      u: "sqm",
      r: "₹230",
      s: "2 coats Apex WeatherCoat",
    },
    {
      m: "Electrical Wiring",
      u: "sqft",
      r: "₹165",
      s: "PVC conduit, Anchor switches",
    },
    {
      m: "Plumbing & Sanitary",
      u: "sqft",
      r: "₹140",
      s: "GI/CPVC, Cera sanitary",
    },
    { m: "Terrace WP", u: "sqm", r: "₹510", s: "Dr. Fixit membrane" },
    {
      m: "MS Stair Railing",
      u: "rmt",
      r: "₹1,900",
      s: "40mm pipe, fabricated",
    },
    {
      m: "Cement (OPC 43)",
      u: "bag (50 kg)",
      r: "₹380",
      s: "Market rate Raiganj",
    },
    { m: "Steel Fe415 TMT", u: "kg", r: "₹68", s: "IS 1786" },
    { m: "Sand (River)", u: "cft", r: "₹42", s: "Local river sand" },
    { m: "Aggregate 20mm", u: "cft", r: "₹38", s: "Crushed stone" },
    { m: "Bricks (1st class)", u: "nos", r: "₹8", s: "IS 1077 kiln-burnt" },
  ];
  return (
    <div className="pe-result-card">
      <h2 className="pe-result-card-title">
        📋 Material Rates{" "}
        <span className="pe-rate-source">(WB PWD SOR 2023-24 · Raiganj)</span>
      </h2>
      <table className="pe-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Material / Item</th>
            <th>Unit</th>
            <th>Rate</th>
            <th>Specification</th>
          </tr>
        </thead>
        <tbody>
          {rates.map((r, i) => (
            <tr key={r.m} className={i % 2 === 0 ? "pe-tr-alt" : ""}>
              <td className="pe-td-center pe-td-dim">{i + 1}</td>
              <td className="pe-td-bold">{r.m}</td>
              <td>
                <UnitBadge unit={r.u.split(" ")[0]} />
              </td>
              <td className="pe-td-green">{r.r}</td>
              <td className="pe-td-dim">{r.s}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Coming soon ─────────────────────────────────────────────────────────────
function ComingSoon({ label }) {
  return (
    <div className="pe-result-card pe-coming-soon">
      <span className="pe-coming-icon">🚧</span>
      <h3>{label}</h3>
      <p>This calculator is coming soon!</p>
    </div>
  );
}

// ── Dynamic field renderer ───────────────────────────────────────────────────
function DynamicField({
  field,
  value,
  onChange,
  error,
  floorsValue,
  onFloorsChange,
}) {
  if (field.type === "floor_btn") {
    return (
      <div className="pe-field pe-field-full">
        <label className="pe-label">Number of Floors</label>
        <div className="pe-floor-btns">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              className={`pe-floor-btn ${+floorsValue === n ? "active" : ""}`}
              onClick={() => onFloorsChange(n)}
            >
              {n === 1 ? "G (GF)" : `G+${n - 1}`}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className="pe-field">
        <label className="pe-label">{field.label}</label>
        <select
          className="pe-input pe-select"
          value={value}
          onChange={onChange}
        >
          {Object.entries(field.options).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="pe-field">
      <label className="pe-label">
        {field.label}
        {field.unit && <span className="pe-label-unit"> ({field.unit})</span>}
      </label>
      <input
        type="number"
        min="0"
        step="any"
        className={`pe-input ${error ? "pe-input-error" : ""}`}
        value={value}
        onChange={onChange}
        placeholder={field.placeholder}
      />
      {error && <span className="pe-error">{error}</span>}
    </div>
  );
}

// ── Estimator content ────────────────────────────────────────────────────────
function EstimatorContent({ est }) {
  const {
    inputs,
    updateField,
    changeProjectType,
    errors,
    currentType,
    PROJECT_TYPES,
    result,
    calculate,
    save,
  } = est;

  return (
    <div className="pe-estimator-layout">
      {/* ── LEFT PANEL ─────────────────────────────────────────── */}
      <div className="pe-left-panel">
        {/* Project Name */}
        <section className="pe-form-card">
          <h2 className="pe-form-title">🛠️ Project Details</h2>
          <div className="pe-field">
            <label className="pe-label">Project Name</label>
            <input
              className={`pe-input ${errors.projectName ? "pe-input-error" : ""}`}
              value={inputs.projectName}
              onChange={updateField("projectName")}
              placeholder="Enter project name"
            />
            {errors.projectName && (
              <span className="pe-error">{errors.projectName}</span>
            )}
          </div>
        </section>

        {/* Project Type Dropdown */}
        <section className="pe-form-card pe-type-dropdown-card">
          <div className="pe-field" style={{ marginBottom: 0 }}>
            <label className="pe-label">Project Type</label>
            <select
              className="pe-input pe-select"
              value={inputs.projectTypeId}
              onChange={(e) => changeProjectType(e.target.value)}
            >
              {PROJECT_TYPES.map((pt) => (
                <option key={pt.id} value={pt.id}>
                  {pt.label}
                </option>
              ))}
            </select>
            <p className="pe-type-hint">{currentType.desc}</p>
          </div>
        </section>

        {/* Dynamic Fields */}
        <section className="pe-form-card">
          <h2 className="pe-form-title">
            📏 {currentType.label.replace(/^[^\s]+\s/, "")}
          </h2>
          <p className="pe-form-desc">{currentType.desc}</p>

          <div className="pe-fields-grid">
            {currentType.fields.map((field) => (
              <DynamicField
                key={field.id}
                field={field}
                value={inputs[field.id] ?? ""}
                onChange={updateField(field.id)}
                error={errors[field.id]}
                floorsValue={inputs.floors}
                onFloorsChange={(n) =>
                  updateField("floors")({ target: { value: n } })
                }
              />
            ))}
          </div>

          <button className="pe-btn-calculate" onClick={calculate}>
            🧮 Calculate Estimate
          </button>
        </section>
      </div>

      {/* ── RIGHT PANEL: Result ──────────────────────────────── */}
      <section className="pe-result-card">
        <h2 className="pe-result-card-title">📋 Estimate Result</h2>

        {result ? (
          <>
            <div className="pe-result-header">
              <div>
                <p className="pe-result-name">{inputs.projectName}</p>
                <TagBadge tag={currentType.tag} />
                <span className="pe-result-type-label">
                  {" "}
                  {currentType.label}
                </span>
              </div>
              <div className="pe-result-total-box">
                <span className="pe-result-total-label">Grand Total</span>
                <span className="pe-result-total-value">
                  ₹{result.grandTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="pe-table-wrap">
              <table className="pe-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Description</th>
                    <th>Unit</th>
                    <th>Qty</th>
                    <th>Rate (₹)</th>
                    <th>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, i) => (
                    <tr key={row.id} className={i % 2 === 0 ? "pe-tr-alt" : ""}>
                      <td className="pe-td-center pe-td-dim">{row.id}</td>
                      <td className="pe-td-bold">{row.desc}</td>
                      <td>
                        <UnitBadge unit={row.unit} />
                      </td>
                      <td>
                        {typeof row.qty === "number"
                          ? row.qty.toLocaleString("en-IN")
                          : row.qty}
                      </td>
                      <td>₹{Number(row.rate).toLocaleString("en-IN")}</td>
                      <td className="pe-td-green">
                        ₹{Number(row.amount).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pe-totals">
              <div className="pe-total-row">
                <span>Sub Total</span>
                <span>₹{result.subTotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="pe-total-row">
                <span>GST / Tax (10%)</span>
                <span>₹{result.tax.toLocaleString("en-IN")}</span>
              </div>
              <div className="pe-total-row">
                <span>Contingency (5%)</span>
                <span>₹{result.contingency.toLocaleString("en-IN")}</span>
              </div>
              <div className="pe-total-row pe-total-grand">
                <span>Grand Total</span>
                <span>₹{result.grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <button className="pe-btn-save" onClick={save}>
              💾 Save Estimate
            </button>
          </>
        ) : (
          <div className="pe-empty-state">
            <span className="pe-empty-icon">📊</span>
            <p>
              Select a project type, fill in the dimensions on the left, and
              click <strong>Calculate Estimate</strong>.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function ProjectEstimatorPage() {
  const [activePage, setActivePage] = useState("estimator");
  const est = useProjectEstimator();
  const navigate = useNavigate();

  const allNavItems = [...SIDEBAR_NAV.CALCULATORS, ...SIDEBAR_NAV.REPORTS];
  const activeItem = allNavItems.find((n) => n.id === activePage);
  const activeLabel = activeItem?.label ?? "Project Estimator";

  // Handle nav click — local stays here, tab/route goes to CalculatorPage
  const handleNavClick = (item) => {
    if (item.type === "local") {
      setActivePage(item.id);
    } else if (item.type === "tab") {
      // Pass desired tab via sessionStorage so CalculatorPage can read it
      sessionStorage.setItem("openTab", item.tab);
      navigate("/");
    } else if (item.type === "route") {
      navigate(item.route);
    }
  };

  const renderContent = () => {
    switch (activePage) {
      case "estimator":
        return <EstimatorContent est={est} />;
      case "history":
        return <HistoryPage history={est.history} />;
      case "rates":
        return <RatesPage />;
      default:
        return <EstimatorContent est={est} />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Civil Estimator | {SITE.name}</title>
        <meta
          name="description"
          content="Professional project estimator — RCC footing, columns, beams, slabs, full building."
        />
      </Helmet>

      <div className="pe-shell">
        {/* ── Sidebar ──────────────────────────────────────────── */}
        <aside className="pe-sidebar">
          {/* BDB Logo */}
          <div className="pe-sidebar-logo">
            <img
              src="/assets/icons/My__Logo.png"
              alt="BDB"
              className="pe-logo-img"
            />
            <div className="pe-logo-text">
              <span className="pe-logo-name">Civil Estimator</span>
              <span className="pe-logo-sub">Professional Edition</span>
            </div>
          </div>

          {/* Nav sections */}
          {Object.entries(SIDEBAR_NAV).map(([section, items]) => (
            <div key={section} className="pe-nav-section">
              <span className="pe-nav-section-label">{section}</span>
              {items.map((item) => (
                <button
                  key={item.id}
                  className={`pe-nav-item ${activePage === item.id && item.type === "local" ? "active" : ""}`}
                  onClick={() => handleNavClick(item)}
                  title={
                    item.type !== "local"
                      ? `Opens in Calculators page → ${item.label}`
                      : ""
                  }
                >
                  <span className="pe-nav-icon">{item.icon}</span>
                  <span className="pe-nav-label-text">{item.label}</span>
                  {item.type === "tab" && (
                    <span className="pe-nav-ext-icon">↗</span>
                  )}
                </button>
              ))}
            </div>
          ))}
          {/* No footer version text */}
        </aside>

        {/* ── Main panel ────────────────────────────────────────── */}
        <div className="pe-main">
          <div className="pe-topbar">
            <h1 className="pe-topbar-title">{activeLabel}</h1>
            <div className="pe-topbar-actions">
              <button className="pe-btn-print" onClick={() => window.print()}>
                🖨️ Print
              </button>
              <button className="pe-btn-clear" onClick={est.clear}>
                🗑️ Clear
              </button>
            </div>
          </div>
          <div className="pe-content">{renderContent()}</div>
        </div>
      </div>
    </>
  );
}
