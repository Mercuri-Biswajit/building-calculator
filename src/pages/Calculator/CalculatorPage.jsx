/* eslint-disable react-hooks/exhaustive-deps */
// ═══════════════════════════════════════════════════════════════════════════
// CALCULATOR PAGE — 4 main tabs
//   costing | structural (beam + column) | brick | paint
// BOQ ab alag page hai: src/pages/BOQPage/BOQPage.jsx  →  route: /boq
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { SITE } from "../../config/constants";

import { formatCurrency } from "../../utils/shared/formatHelpers";
import {
  calcBuildingCost,
  calcStairDesign,
  calcFooting,
  calcBarBending,
  calcProjectTimeline,
  calcStructureDesign,
  calcCompleteBBS,
  calcStandardBOQ,
  calcPremiumBOQ,
  calcFloorWiseBOQ,
} from "../../utils";

import { useBeamDesign }     from "../../hooks/useBeamDesign";
import { useColumnDesign }   from "../../hooks/useColumnDesign";
import { useSlabDesign }     from "../../hooks/useSlabDesign";
import { useCostingInputs }  from "../../hooks/useCostingInputs";
import { useBrickMasonry }   from "../../hooks/useBrickMasonry";
import { usePaintEstimator } from "../../hooks/usePaintEstimator";

import { HeroSection }         from "../../components/hero/HeroSection";
import { CostingInputPanel }   from "../../components/costing/CostingInputPanel";
import { CostingResults }      from "../../components/costing/CostingResults";
import { StructuralDesignTab } from "../../components/structural/StructuralDesignTab";
import { BrickMasonryTab }     from "../../components/brick/BrickMasonryTab";
import { PaintEstimatorTab }   from "../../components/paint/PaintEstimatorTab";

import "./_calculator.css";
import "./_design-calculator.css";
import { useSkeleton }       from "../../hooks/useSkeleton";
import { CalcTabSkeleton }   from "../../components/ui/Skeleton";

function CalculatorsPage() {
  // Read tab from sessionStorage (set by ProjectEstimatorPage sidebar links)
  const savedTab = sessionStorage.getItem("openTab");
  const [mainTab, setMainTab] = useState(savedTab || "costing");

  // Clear the stored tab after reading so it doesn't persist on reload
  if (savedTab) sessionStorage.removeItem("openTab");

  const [costingResults, setCostingResults]   = useState(null);
  const [costingSubTab, setCostingSubTab]     = useState("cost");
  const { isLoading } = useSkeleton(700);

  const { inputs, updateField, resetInputs } = useCostingInputs();
  const beam   = useBeamDesign();
  const column = useColumnDesign();
  const slab   = useSlabDesign();
  const brick  = useBrickMasonry();
  const paint  = usePaintEstimator();

  // Auto-populate beam/column from structure design when switching to structural tab
  useEffect(() => {
    if (costingResults?.structureDesign && mainTab === "structural") {
      if (!beam.inputs.b)
        beam.populateFromStructure(costingResults.structureDesign, inputs.floorHeight);
      if (!column.inputs.b)
        column.populateFromStructure(costingResults.structureDesign, inputs.floorHeight);
    }
  }, [mainTab, costingResults]);

  const handleCalculate = () => {
    const { length, breadth, floors, floorHeight } = inputs;

    if (!length || !breadth || parseFloat(length) <= 0 || parseFloat(breadth) <= 0) {
      alert("Please enter valid building dimensions (length and breadth must be greater than 0).");
      return;
    }

    const calcInputs = {
      ...inputs,
      length:      parseFloat(length),
      breadth:     parseFloat(breadth),
      floors:      parseInt(floors),
      floorHeight: parseFloat(floorHeight),
      basementDepth:  parseFloat(inputs.basementDepth),
      avgColumnSpan:  parseFloat(inputs.avgColumnSpan),
      customRates: {
        cement:    inputs.customCementRate    ? parseFloat(inputs.customCementRate)    : null,
        steel:     inputs.customSteelRate     ? parseFloat(inputs.customSteelRate)     : null,
        sand:      inputs.customSandRate      ? parseFloat(inputs.customSandRate)      : null,
        aggregate: inputs.customAggregateRate ? parseFloat(inputs.customAggregateRate) : null,
      },
    };

    setCostingResults({
      buildingCost:  calcBuildingCost(calcInputs),
      stairDesign:   calcInputs.includeStaircase
        ? calcStairDesign(calcInputs.length, calcInputs.breadth, calcInputs.floorHeight, calcInputs.floors, calcInputs.buildingType)
        : null,
      footing:        calcFooting(calcInputs),
      barBending:     calcBarBending(calcInputs),
      timeline:       calcProjectTimeline(calcInputs),
      structureDesign:calcStructureDesign(calcInputs),
      completeBBS:    calcCompleteBBS(calcInputs),
      standardBOQ:    calcStandardBOQ(calcInputs),
      premiumBOQ:     calcPremiumBOQ(calcInputs),
      floorWiseBOQ:   calcFloorWiseBOQ({ ...calcInputs, finishGrade: calcInputs.finishGrade }),
    });
  };

  const handleReset = () => {
    resetInputs();
    setCostingResults(null);
    setCostingSubTab("cost");
  };

  const handleTabChange = (tab) => {
    setMainTab(tab);
    if (tab === "structural" && costingResults?.structureDesign) {
      if (!beam.inputs.b)
        beam.populateFromStructure(costingResults.structureDesign, inputs.floorHeight);
      if (!column.inputs.b)
        column.populateFromStructure(costingResults.structureDesign, inputs.floorHeight);
    }
  };

  return (
    <>
      <Helmet>
        <title>{SITE.seo.calculators.title}</title>
        <meta name="description" content={SITE.seo.calculators.description} />
        <link rel="canonical" href={SITE.seo.calculators.canonical} />
      </Helmet>

      <div className="calc-page">
        <HeroSection mainTab={mainTab} onTabChange={handleTabChange} />

        <main className="calc-main">
          {isLoading ? (
            <CalcTabSkeleton />
          ) : (
            <>
              {/* ── COSTING ─────────────────────────────────────────────── */}
              {mainTab === "costing" && (
                <>
                  <CostingInputPanel
                    inputs={inputs}
                    updateField={updateField}
                    onCalculate={handleCalculate}
                    onReset={handleReset}
                  />
                  {costingResults && (
                    <CostingResults
                      results={costingResults}
                      inputs={inputs}
                      subTab={costingSubTab}
                      onSubTabChange={setCostingSubTab}
                      onReset={handleReset}
                      formatCurrency={formatCurrency}
                    />
                  )}
                </>
              )}

              {/* ── STRUCTURAL DESIGN (beam + column + slab) ────────────── */}
              {mainTab === "structural" && (
                <section className="calc-results-section">
                  {costingResults?.structureDesign && (
                    <div className="calc-alert calc-alert-info" style={{ marginBottom:"1.5rem" }}>
                      <strong>ℹ️ Auto-populated from Structure Design:</strong>{" "}
                      Member dimensions and material grades have been pre-filled from your building estimate. Modify as needed.
                    </div>
                  )}
                  <StructuralDesignTab beam={beam} column={column} slab={slab} />
                </section>
              )}

              {/* ── BRICK MASONRY ────────────────────────────────────────── */}
              {mainTab === "brick" && (
                <section className="calc-results-section">
                  <BrickMasonryTab
                    inputs={brick.inputs}
                    onInputChange={brick.handleInputChange}
                    onCalculate={brick.calculate}
                    onReset={brick.reset}
                    results={brick.results}
                  />
                </section>
              )}

              {/* ── PAINT ESTIMATOR ─────────────────────────────────────── */}
              {mainTab === "paint" && (
                <section className="calc-results-section">
                  <PaintEstimatorTab
                    inputs={paint.inputs}
                    onInputChange={paint.handleInputChange}
                    onCalculate={paint.calculate}
                    onReset={paint.reset}
                    results={paint.results}
                  />
                </section>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}

export default CalculatorsPage;