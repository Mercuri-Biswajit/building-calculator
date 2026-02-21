// ═══════════════════════════════════════════════════════════════════════════
// BEAM SHEAR DESIGN FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

import { getShearStrength, getMaxShearStress } from './beamHelpers';

/**
 * Get minimum stirrups as per IS 456
 */
export function getMinimumStirrups(b, fy) {
  // Minimum Asv/Sv = 0.4 / (0.87 * fy)
  const Asv_by_Sv_min = 0.4 / (0.87 * fy);
  
  return designStirrups(Asv_by_Sv_min, b, 0, fy, true);
}

/**
 * Design stirrup options
 */
export function designStirrups(Asv_by_Sv, b, d, fy, isMinimum = false) {
  const stirrupDias = [6, 8, 10];
  const legOptions = [2, 4]; // 2-legged or 4-legged
  
  const options = [];
  
  for (let dia of stirrupDias) {
    for (let legs of legOptions) {
      const Asv = legs * Math.PI * dia * dia / 4;
      const Sv_required = Asv / Asv_by_Sv;
      
      // Maximum spacing as per IS 456
      const Sv_max = isMinimum ? Math.min(0.75 * d, 300) : Math.min(0.75 * d, 300);
      
      // Provide spacing in multiples of 25mm
      let Sv_provided = Math.floor(Math.min(Sv_required, Sv_max) / 25) * 25;
      
      if (Sv_provided < 75) Sv_provided = 75; // Minimum 75mm
      if (Sv_provided > 300) continue; // Skip if too large
      
      const actualAsv_by_Sv = Asv / Sv_provided;
      
      options.push({
        diameter: dia,
        legs,
        spacing: Sv_provided,
        Asv,
        actualAsv_by_Sv,
        description: `${dia}mm φ ${legs}-legged @ ${Sv_provided}mm c/c`
      });
    }
  }
  
  return options.slice(0, 3); // Top 3 options
}

/**
 * Design shear reinforcement (stirrups)
 */
export function designShearReinforcement(Vu, b, d, fck, fy, Ast) {
  // Nominal shear stress
  const tau_v = (Vu * 1000) / (b * d); // MPa
  
  // Percentage of steel
  const pt = (100 * Ast) / (b * d);
  
  // Design shear strength from IS 456 Table 19
  const tau_c = getShearStrength(fck, pt);
  
  // Maximum shear stress (IS 456 Table 20)
  const tau_c_max = getMaxShearStress(fck);
  
  // Check if shear reinforcement is required
  let shearReinforcementRequired = tau_v > tau_c;
  
  if (tau_v > tau_c_max) {
    return {
      status: 'FAIL',
      message: 'Section inadequate - increase depth or use higher grade concrete',
      tau_v,
      tau_c,
      tau_c_max
    };
  }
  
  if (!shearReinforcementRequired) {
    return {
      status: 'OK',
      message: 'Minimum shear reinforcement required',
      tau_v,
      tau_c,
      tau_c_max,
      stirrupDetails: getMinimumStirrups(b, fy)
    };
  }
  
  // Design shear reinforcement
  const Vus = Vu - (tau_c * b * d / 1000); // kN
  
  // Required Asv/Sv = Vus / (0.87 * fy * d)
  const Asv_by_Sv = (Vus * 1000) / (0.87 * fy * d);
  
  // Design stirrups
  const stirrupOptions = designStirrups(Asv_by_Sv, b, d, fy);
  
  return {
    status: 'DESIGN',
    tau_v,
    tau_c,
    tau_c_max,
    Vus,
    Asv_by_Sv,
    stirrupOptions
  };
}
