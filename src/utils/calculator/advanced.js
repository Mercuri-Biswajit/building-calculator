/* eslint-disable no-unused-vars */
// ═══════════════════════════════════════════════════════════════════════════
// ADVANCED CALCULATOR FUNCTIONS - MAIN ENTRY POINT
// This file re-exports all calculator functions for backward compatibility
// Individual functions are now organized in separate files
// ═══════════════════════════════════════════════════════════════════════════

// Re-export constants (keeping original imports for reference)
export {
  THUMB_RULES,
  BUILDING_TYPES,
  FINISH_GRADES,
  SOIL_CONDITIONS,
  MATERIAL_RATES,
} from "../../config/calculatorConstants.js";

// Re-export calculator functions
export { calcBuildingCost } from "./calculators/buildingCost";
export { calcStairDesign } from "./calculators/stairDesign";
export { calcFooting } from "./calculators/footing";
export { calcBarBending, calcCompleteBBS } from "./calculators/barBending";
export { calcProjectTimeline } from "./calculators/projectTimeline";
export { calcStructureDesign } from "./calculators/structureDesign";
export {
  calcStandardBOQ,
  calcPremiumBOQ,
  calcFloorWiseBOQ,
} from "./calculators/fullBOQ";

// Re-export helper functions (these were internal but now available if needed)
export {
  calcExcavationVolume,
  calcPCCVolume,
  calcRCCVolume,
  calcBrickworkVolume,
  calcPlasterArea,
  calcFlooringArea,
} from "./helpers/volumeCalculations";

export {
  calcPCCRate,
  calcRCCRate,
  calcBrickworkRate,
  calcPlasterRate,
  calcFlooringRate,
  calcPaintingRate,
} from "./helpers/rateCalculations";

export {
  calcMaterialQuantities,
  calcMaterialSummary,
} from "./helpers/materialCalculations";

export {
  createExcavationItem,
  createPCCItem,
  createFootingItem,
  createColumnsItem,
  createBeamsItem,
  createSlabItem,
  createBrickworkItem,
  createPlasteringItem,
  createFlooringItem,
  createPaintingItem,
  createDoorsItem,
  createWindowsItem,
  createElectricalItem,
  createPlumbingItem,
  createWaterproofingItem,
} from "./helpers/boqItems";
