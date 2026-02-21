// ═══════════════════════════════════════════════════════════════════════════
// STRUCTURAL DESIGN TAB — Beam + Column + Slab combined
// Place in: src/pages/CalculatorPage/components/StructuralDesignTab.jsx
// ═══════════════════════════════════════════════════════════════════════════

import { useState } from "react";
import { BeamDesignTab }   from "./BeamDesignTab";
import { ColumnDesignTab } from "./ColumnDesignTab";
import { SlabDesignTab }   from "./SlabDesignTab";

const SUB_TABS = [
  { key: "slab",   icon: "⬜", label: "Slab Design",    desc: "One-way & two-way — IS 456" },
  { key: "beam",   icon: "🏗️", label: "Beam Design",   desc: "Flexural & shear — IS 456" },
  { key: "column", icon: "🏛️", label: "Column Design",  desc: "Axial & moment — IS 456"  },
];

export function StructuralDesignTab({ beam, column, slab }) {
  const [activeSubTab, setActiveSubTab] = useState("slab");

  /**
   * Called from SlabDesignTab when user clicks "Send to Beam Design".
   * beamLoadEntry = { Mu, Vu, span, label, ... }
   */
  const handleSendToBeam = (beamLoadEntry) => {
    // Populate beam inputs from slab result
    beam.populateFromSlab(
      beamLoadEntry,
      slab.results?.fck?.toString(),
      slab.results?.fy?.toString(),
    );
    // Switch to beam sub-tab
    setActiveSubTab("beam");
    // Scroll to top of section (optional UX nicety)
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * Called from SlabDesignTab when user clicks "Send to Column Design".
   * columnLoad = computeColumnLoad() result, position = "interior"|"edge"|"corner"
   */
  const handleSendToColumn = (columnLoad, position) => {
    column.populateFromSlab(
      columnLoad,
      position,
      slab.results?.fck?.toString(),
      slab.results?.fy?.toString(),
    );
    setActiveSubTab("column");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="calc-result-card">
      {/* ── Header ──────────────────────────────────────────────── */}
      <h3 className="calc-breakdown-header">
        <span>🔩</span> Structural Member Design (IS 456:2000)
      </h3>

      {/* ── Sub-tab switcher ─────────────────────────────────────── */}
      <div className="struct-subtab-row">
        {SUB_TABS.map(({ key, icon, label, desc }) => (
          <button
            key={key}
            className={`struct-subtab-btn ${activeSubTab === key ? "active" : ""}`}
            onClick={() => setActiveSubTab(key)}
          >
            <span className="struct-subtab-icon">{icon}</span>
            <span className="struct-subtab-text">
              <span className="struct-subtab-label">{label}</span>
              <span className="struct-subtab-desc">{desc}</span>
            </span>
          </button>
        ))}
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="struct-subtab-content">
        {activeSubTab === "beam" && (
          <BeamDesignTab
            inputs={beam.inputs}
            onInputChange={beam.handleInputChange}
            onCalculate={beam.calculate}
            results={beam.results}
          />
        )}
        {activeSubTab === "column" && (
          <ColumnDesignTab
            inputs={column.inputs}
            onInputChange={column.handleInputChange}
            onCalculate={column.calculate}
            results={column.results}
          />
        )}
        {activeSubTab === "slab" && (
          <SlabDesignTab
            inputs={slab.inputs}
            onInputChange={slab.handleInputChange}
            onCalculate={slab.calculate}
            onReset={slab.reset}
            results={slab.results}
            onSendToBeam={handleSendToBeam}
            onSendToColumn={handleSendToColumn}
          />
        )}
      </div>
    </div>
  );
}

export default StructuralDesignTab;