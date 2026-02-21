/* eslint-disable no-unused-vars */
// ═══════════════════════════════════════════════════════════════════════════
// BAR BENDING SCHEDULE CALCULATORS
// ═══════════════════════════════════════════════════════════════════════════

import { THUMB_RULES } from "../../../config/calculatorConstants";

/**
 * Calculate Bar Bending Schedule summary
 */
export function calcBarBending(inputs) {
  const { floors, includeBasement, length, breadth } = inputs;
  const totalArea =
    length * breadth * floors + (includeBasement ? length * breadth : 0);

  const totalSteel = totalArea * THUMB_RULES.steel_kg_per_sqft;

  const breakdown = {
    "8mm": totalSteel * 0.15,
    "10mm": totalSteel * 0.25,
    "12mm": totalSteel * 0.3,
    "16mm": totalSteel * 0.2,
    "20mm": totalSteel * 0.1,
  };

  return {
    totalWeight: totalSteel,
    breakdown,
  };
}

/**
 * Calculate Complete Bar Bending Schedule
 */
export function calcCompleteBBS(inputs) {
  const {
    length,
    breadth,
    floors,
    floorHeight,
    avgColumnSpan,
    includeBasement,
  } = inputs;

  const totalArea =
    length * breadth * floors + (includeBasement ? length * breadth : 0);
  const totalSteel = totalArea * THUMB_RULES.steel_kg_per_sqft;

  const numColumns =
    Math.ceil(length / avgColumnSpan) * Math.ceil(breadth / avgColumnSpan);
  const columnHeight = floorHeight * floors * 304.8;

  const bbsItems = [];

  const colBarDia = floors <= 2 ? 12 : 16;
  const colBarsPerColumn = floors <= 2 ? 4 : 6;
  const colBarLength = columnHeight + 600;
  const colBarWeight = (colBarDia ** 2 / 162) * (colBarLength / 1000);
  bbsItems.push({
    member: "Column Main Bars",
    barDia: `${colBarDia}mm`,
    quantity: numColumns * colBarsPerColumn,
    length: Math.round(colBarLength),
    unit: "mm",
    shape: "Straight",
    cuttingLength: Math.round(colBarLength),
    totalWeight: Math.round(numColumns * colBarsPerColumn * colBarWeight),
    bendingDetails: "No bending - Straight bars with hooks at ends",
  });

  const colWidth = floors <= 2 ? 229 : 305;
  const stirrupPerimeter = 2 * (colWidth + colWidth) + 200;
  const stirrupSpacing = 150;
  const stirrupsPerColumn = Math.ceil(columnHeight / stirrupSpacing);
  const stirrupWeight = (64 / 162) * (stirrupPerimeter / 1000);
  bbsItems.push({
    member: "Column Stirrups",
    barDia: "8mm",
    quantity: numColumns * stirrupsPerColumn,
    length: Math.round(stirrupPerimeter),
    unit: "mm",
    shape: "Rectangular",
    cuttingLength: Math.round(stirrupPerimeter),
    totalWeight: Math.round(numColumns * stirrupsPerColumn * stirrupWeight),
    bendingDetails: `4 bends at 90°, hook length 100mm`,
  });

  const totalBeamLength =
    (length * Math.ceil(breadth / avgColumnSpan) +
      breadth * Math.ceil(length / avgColumnSpan)) *
    304.8;
  const beamTopBarWeight = (256 / 162) * (totalBeamLength / 1000) * 2;
  bbsItems.push({
    member: "Beam Top Bars",
    barDia: "16mm",
    quantity: Math.ceil(totalBeamLength / 12000) * 2,
    length: 12000,
    unit: "mm",
    shape: "Straight with anchorage",
    cuttingLength: 12000,
    totalWeight: Math.round(beamTopBarWeight * floors),
    bendingDetails: "90° hooks at supports, lap length 752mm (47d)",
  });

  const beamBottomBarWeight = (256 / 162) * (totalBeamLength / 1000) * 2;
  bbsItems.push({
    member: "Beam Bottom Bars",
    barDia: "16mm",
    quantity: Math.ceil(totalBeamLength / 12000) * 2,
    length: 12000,
    unit: "mm",
    shape: "Straight",
    cuttingLength: 12000,
    totalWeight: Math.round(beamBottomBarWeight * floors),
    bendingDetails: "Straight bars with standard hooks",
  });

  const beamDepth = 305;
  const beamWidth = 229;
  const beamStirrupPerim = 2 * (beamWidth + beamDepth) + 200;
  const beamStirrupCount = Math.ceil(totalBeamLength / 125);
  const beamStirrupWeight = (64 / 162) * (beamStirrupPerim / 1000);
  bbsItems.push({
    member: "Beam Stirrups",
    barDia: "8mm",
    quantity: beamStirrupCount * floors,
    length: Math.round(beamStirrupPerim),
    unit: "mm",
    shape: "Rectangular",
    cuttingLength: Math.round(beamStirrupPerim),
    totalWeight: Math.round(beamStirrupCount * beamStirrupWeight * floors),
    bendingDetails: "4 bends at 90°, hooks 100mm",
  });

  const slabBarSpacing = 150;
  const slabBarsMain = Math.ceil((length * 304.8) / slabBarSpacing);
  const slabBarLength = breadth * 304.8;
  const slabMainWeight = (100 / 162) * (slabBarLength / 1000) * slabBarsMain;
  bbsItems.push({
    member: "Slab Main Bars",
    barDia: "10mm",
    quantity: slabBarsMain * floors,
    length: Math.round(slabBarLength),
    unit: "mm",
    shape: "Straight",
    cuttingLength: Math.round(slabBarLength),
    totalWeight: Math.round(slabMainWeight * floors),
    bendingDetails: "Straight bars, lap length 600mm (60d)",
  });

  const slabBarsDist = Math.ceil((breadth * 304.8) / slabBarSpacing);
  const slabDistWeight = (100 / 162) * ((length * 304.8) / 1000) * slabBarsDist;
  bbsItems.push({
    member: "Slab Distribution Bars",
    barDia: "10mm",
    quantity: slabBarsDist * floors,
    length: Math.round(length * 304.8),
    unit: "mm",
    shape: "Straight",
    cuttingLength: Math.round(length * 304.8),
    totalWeight: Math.round(slabDistWeight * floors),
    bendingDetails: "Straight bars, lap length 600mm",
  });

  const footingSize = 1372;
  const footingBars = 10;
  const footingBarWeight = (144 / 162) * (footingSize / 1000);
  bbsItems.push({
    member: "Footing Bars (Both Ways)",
    barDia: "12mm",
    quantity: numColumns * footingBars * 2,
    length: Math.round(footingSize),
    unit: "mm",
    shape: "Straight with hooks",
    cuttingLength: Math.round(footingSize),
    totalWeight: Math.round(numColumns * footingBars * 2 * footingBarWeight),
    bendingDetails: "90° hooks at ends, hook length 150mm",
  });

  const totalBBSWeight = bbsItems.reduce(
    (sum, item) => sum + item.totalWeight,
    0,
  );

  return {
    totalWeight: totalBBSWeight,
    items: bbsItems,
    wastageAllowance: Math.round(totalBBSWeight * 0.07),
    finalOrderQuantity: Math.round(totalBBSWeight * 1.07),
  };
}
