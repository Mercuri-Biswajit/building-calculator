// ═══════════════════════════════════════════════════════════════════════════
// COLUMN DESIGN CALCULATOR - IS 456:2000 COMPLIANT
// Backward compatibility wrapper - imports from modular design/column/
// ═══════════════════════════════════════════════════════════════════════════

// Re-export main function for backward compatibility
export { designColumn, default } from "./structural/column";

// Re-export all column design functions
export {
  calcEffectiveLength,
  checkSlenderness,
  calcMinimumEccentricity,
  designAxialColumn,
  designUniaxialColumn,
  designBiaxialColumn,
  checkBiaxialInteraction,
  designColumnBars,
  designColumnTies,
} from "./structural/column";

// Re-export constants
export { COLUMN_CONSTANTS } from "./structural/column/columnConstants";
