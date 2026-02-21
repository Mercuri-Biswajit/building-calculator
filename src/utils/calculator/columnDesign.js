// ═══════════════════════════════════════════════════════════════════════════
// COLUMN DESIGN CALCULATOR - IS 456:2000 COMPLIANT
// Backward compatibility wrapper - imports from modular design/column/
// ═══════════════════════════════════════════════════════════════════════════

// Re-export main function for backward compatibility
export { designColumn, default } from './design/column';

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
  designColumnTies
} from './design/column';

// Re-export constants
export { COLUMN_CONSTANTS } from './design/column/columnConstants';