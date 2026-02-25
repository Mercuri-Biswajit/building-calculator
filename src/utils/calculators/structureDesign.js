/* eslint-disable no-unused-vars */
// ═══════════════════════════════════════════════════════════════════════════
// STRUCTURAL DESIGN CALCULATOR
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate structural design parameters
 */
export function calcStructureDesign(inputs) {
  const { length, breadth, floors, buildingType, floorHeight, avgColumnSpan } = inputs;

  const isComm = buildingType === "commercial" || buildingType === "apartment";
  const plotArea = length * breadth;

  const columnSpacing = avgColumnSpan;
  const totalColumns = Math.ceil(length / columnSpacing) * Math.ceil(breadth / columnSpacing);

  let columnSize;
  if (floors === 1) {
    columnSize = isComm ? '9" × 12"' : '9" × 9"';
  } else if (floors === 2) {
    columnSize = isComm ? '12" × 12"' : '9" × 12"';
  } else {
    columnSize = isComm ? '12" × 15"' : '12" × 12"';
  }

  const columnBars = floors <= 2 ? "4 nos. 12mm" : "6 nos. 16mm";
  const columnStirrup = "8mm @ 150mm c/c";

  const beamDepth = Math.round((floorHeight * 304.8) / 12);
  const beamDepthInch = Math.round(beamDepth / 25.4);
  const beamSize = `9" × ${beamDepthInch}"`;

  const beamTopBars = floors <= 2 ? "2 nos. 12mm" : "2 nos. 16mm";
  const beamBottomBars = floors <= 2 ? "2 nos. 16mm" : "3 nos. 16mm";
  const beamStirrup = "8mm @ 125mm c/c";

  const slabThickness = floors <= 2 ? '5"' : '6"';
  const slabBars = "10mm @ 150mm c/c";
  const slabType = length > breadth * 2 ? "One-way slab" : "Two-way slab";

  const plinthBeamSize = '9" × 12"';
  const plinthBars = "4 nos. 12mm";
  const plinthStirrup = "8mm @ 200mm c/c";

  const externalWall = '9" brick wall';
  const internalWall = '4.5" brick wall';

  return {
    columns: {
      size: columnSize,
      count: totalColumns,
      spacing: `${columnSpacing}' c/c`,
      mainBars: columnBars,
      stirrup: columnStirrup,
    },
    beams: {
      size: beamSize,
      topBars: beamTopBars,
      bottomBars: beamBottomBars,
      stirrup: beamStirrup,
    },
    slab: {
      thickness: slabThickness,
      type: slabType,
      mainBars: slabBars,
      distributionBars: slabBars,
    },
    plinthBeam: {
      size: plinthBeamSize,
      bars: plinthBars,
      stirrup: plinthStirrup,
    },
    walls: { external: externalWall, internal: internalWall },
    concrete: { grade: "M20", mix: "1:1.5:3", cement: "43 Grade OPC" },
    plotArea,
    totalBuiltArea: plotArea * floors,
  };
}
