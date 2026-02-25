// ═══════════════════════════════════════════════════════════════════════════
// BEAM DESIGN HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

import { BEAM_CONSTANTS } from './beamConstants';

/**
 * Calculate effective depth from total depth
 */
export function calcEffectiveDepth(totalDepth, cover, mainBarDia, stirrupDia) {
  return totalDepth - cover - stirrupDia - (mainBarDia / 2);
}

/**
 * Calculate limiting moment of resistance (Mu,lim)
 */
export function calcLimitingMoment(b, d, fck, steelGrade) {
  const xu_max_by_d = BEAM_CONSTANTS.xu_max_d[steelGrade];
  const xu_max = xu_max_by_d * d;
  const Mu_lim = 0.36 * fck * b * xu_max * (d - 0.42 * xu_max) / 1000000;
  
  return {
    Mu_lim,
    xu_max,
    xu_max_by_d
  };
}

/**
 * Calculate development length
 */
export function calcDevelopmentLength(dia, fck, fy) {
  const tau_bd = BEAM_CONSTANTS.bondStress[fck] || BEAM_CONSTANTS.bondStress[20];
  const sigma_s = 0.87 * fy;
  const Ld = (dia * sigma_s) / (4 * tau_bd);
  return Math.ceil(Ld / 10) * 10;
}

/**
 * Get design shear strength from IS 456 Table 19
 */
export function getShearStrength(fck, pt) {
  const { ptValues, tauValues } = BEAM_CONSTANTS.shearStrengthTable;
  const fckKey = fck >= 40 ? 40 : fck >= 35 ? 35 : fck >= 30 ? 30 : fck >= 25 ? 25 : fck >= 20 ? 20 : 15;
  const values = tauValues[fckKey];
  
  let tau = values[0];
  for (let i = 0; i < ptValues.length - 1; i++) {
    if (pt >= ptValues[i] && pt <= ptValues[i + 1]) {
      const ratio = (pt - ptValues[i]) / (ptValues[i + 1] - ptValues[i]);
      tau = values[i] + ratio * (values[i + 1] - values[i]);
      break;
    }
  }
  
  if (pt > ptValues[ptValues.length - 1]) {
    tau = values[values.length - 1];
  }
  
  return tau;
}

/**
 * Get maximum shear stress from IS 456 Table 20
 */
export function getMaxShearStress(fck) {
  return BEAM_CONSTANTS.maxShearStress[fck] || (fck >= 40 ? 4.0 : 2.5);
}