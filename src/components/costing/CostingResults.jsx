import {
  CostBreakdown,
  StructureDesign,
  StaircaseDesign,
  FoundationDesign,
  CompleteBBS,
} from "../tabs";

import { FullBOQ } from "../tabs";
import { useUnit } from "../../context/UnitContext";
import { Button } from "../ui/Button";
import { TabBar } from "../ui/TabBar";
import { SaveEstimateButton } from "../ui/SaveEstimateButton";

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
  onSave,
  formatCurrency,
}) {
  const { displayArea, displayRate, getAreaLabel } = useUnit();

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
              {displayRate(results.buildingCost.costPerSqft).toLocaleString(
                "en-IN",
              )}
              /{getAreaLabel()}
            </strong>
          </span>
          <span>
            Area:{" "}
            <strong>
              {displayArea(results.buildingCost.totalArea).toLocaleString("en-IN")} {getAreaLabel()}
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
      <TabBar 
        tabs={SUB_TABS.map(t => ({...t, hidden: t.conditional && !results.stairDesign}))}
        activeTab={subTab}
        onTabChange={onSubTabChange}
      />

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

      {/* Prominent Save Action */}
      <SaveEstimateButton onSave={onSave} />

      {/* New Estimate Action */}
      <div style={{ textAlign: "center", display: "flex", justifyContent: "center" }}>
        <Button onClick={onReset} variant="secondary" icon="←">
          New Estimate
        </Button>
      </div>
    </section>
  );
}
