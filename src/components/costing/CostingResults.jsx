import {
  CostBreakdown,
  StructureDesign,
  StaircaseDesign,
  FoundationDesign,
  CompleteBBS,
} from "../tabs";

import { FullBOQ } from "../tabs";

const SUB_TABS = [
  { key: "cost", label: "💰 Cost Breakdown" },
  { key: "structure", label: "🏛️ Structure Design" },
  { key: "stair", label: "🪜 Staircase Design", conditional: true },
  { key: "footing", label: "🏗️ Foundation Design" },
  { key: "bbs", label: "📋 Bar Bending Schedule" },
  { key: "boq", label: "📄 Bill of Quantities" },
];

export function CostingResults({
  results,
  inputs,
  subTab,
  onSubTabChange,
  onReset,
  formatCurrency,
}) {
  return (
    <section className="calc-results-section">
      {/* Cost Banner */}
      <div className="calc-cost-banner">
        <div className="calc-estimate-label">Total Estimated Cost</div>
        <div className="calc-estimate-amount">
          {formatCurrency(results.buildingCost.totalCost)}
        </div>
        <div className="calc-estimate-meta">
          <span>
            Rate:{" "}
            <strong>
              ₹
              {Math.round(results.buildingCost.costPerSqft).toLocaleString(
                "en-IN",
              )}
              /sq.ft
            </strong>
          </span>
          <span>
            Area:{" "}
            <strong>
              {results.buildingCost.totalArea.toLocaleString("en-IN")} sq.ft
            </strong>
          </span>
          <span>
            Floors: <strong>{inputs.floors}</strong>
          </span>
          <span>
            Duration:{" "}
            <strong>
              {results.timeline.totalDays} days (~{results.timeline.totalMonths}{" "}
              months)
            </strong>
          </span>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="calc-tabs">
        {SUB_TABS.filter((t) => !t.conditional || results.stairDesign).map(
          (t) => (
            <button
              key={t.key}
              className={`calc-tab ${subTab === t.key ? "active" : ""}`}
              onClick={() => onSubTabChange(t.key)}
            >
              {t.label}
            </button>
          ),
        )}
      </div>

      {/* Tab Content */}
      <div className="calc-tab-content">
        {subTab === "cost" && <CostBreakdown results={results.buildingCost} />}
        {subTab === "structure" && (
          <StructureDesign design={results.structureDesign} />
        )}
        {subTab === "stair" && results.stairDesign && (
          <StaircaseDesign design={results.stairDesign} />
        )}
        {subTab === "footing" && <FoundationDesign footing={results.footing} />}
        {subTab === "bbs" && (
          <CompleteBBS
            barBending={results.barBending}
            completeBBS={results.completeBBS}
          />
        )}
        {subTab === "boq" && (
          <FullBOQ
            standardBOQ={results.standardBOQ}
            premiumBOQ={results.premiumBOQ}
            floorWiseBOQ={results.floorWiseBOQ}
          />
        )}
      </div>

      <div style={{ textAlign: "center", paddingTop: "2rem" }}>
        <button onClick={onReset} className="calc-btn-secondary">
          ← New Estimate
        </button>
      </div>
    </section>
  );
}
