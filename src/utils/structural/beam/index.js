// ═══════════════════════════════════════════════════════════════════════════
// BEAM DESIGN - MODULE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export { designBeam, default } from './beamDesign';
export { BEAM_CONSTANTS } from './beamConstants';
export { 
  calcEffectiveDepth, 
  calcLimitingMoment, 
  calcDevelopmentLength,
  getShearStrength,
  getMaxShearStress
} from './beamHelpers';
export { 
  designSinglyReinforcedBeam, 
  designDoublyReinforcedBeam 
} from './beamFlexure';
export { 
  designShearReinforcement,
  getMinimumStirrups,
  designStirrups
} from './beamShear';
export { checkDeflection } from './beamDeflection';