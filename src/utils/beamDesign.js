// ═══════════════════════════════════════════════════════════════════════════
// BEAM DESIGN CALCULATOR - IS 456:2000 COMPLIANT
// Backward compatibility wrapper
// ═══════════════════════════════════════════════════════════════════════════

export {
  designBeam,
  default,
  BEAM_CONSTANTS,
  calcEffectiveDepth,
  calcLimitingMoment,
  calcDevelopmentLength,
  getShearStrength,
  getMaxShearStress,
  designSinglyReinforcedBeam,
  designDoublyReinforcedBeam,
  designShearReinforcement,
  getMinimumStirrups,
  designStirrups,
  checkDeflection,
} from "./structural/beam";
