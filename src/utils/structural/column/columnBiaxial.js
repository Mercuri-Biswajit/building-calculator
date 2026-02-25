// ═══════════════════════════════════════════════════════════════════════════
// COLUMN BIAXIAL BENDING DESIGN
// ═══════════════════════════════════════════════════════════════════════════

import { designUniaxialColumn } from './columnUniaxial';

/**
 * Design column with biaxial bending
 * Uses equivalent uniaxial moment approach
 */
export function designBiaxialColumn(Pu, Mux, Muy, b, D, fck, fy, cover) {
  // For biaxial bending, calculate equivalent uniaxial moment
  // Mu_equiv = sqrt(Mux^2 + Muy^2)
  const Mu_equiv = Math.sqrt(Mux * Mux + Muy * Muy);
  
  // Design for equivalent moment using uniaxial approach
  const uniaxialResult = designUniaxialColumn(Pu, Mu_equiv, b, D, fck, fy, cover, 'major');
  
  // Add biaxial specific information
  return {
    ...uniaxialResult,
    designType: 'biaxial',
    Mux,
    Muy,
    Mu_equiv,
    biaxialNote: 'Designed for equivalent uniaxial moment. For precise biaxial design, use SP-16 interaction curves.',
    recommendation: Mu_equiv > 1.5 * Math.max(Mux, Muy) 
      ? 'Consider using interaction diagrams for more accurate design'
      : 'Equivalent moment approach is acceptable'
  };
}

/**
 * Check biaxial interaction using Bresler's equation (simplified)
 */
export function checkBiaxialInteraction(Pu, Mux, Muy, Pu_max, Mux_max, Muy_max) {
  // Bresler's Load Contour Method (simplified)
  // 1/Pu_design = 1/Pux + 1/Puy - 1/Pu_max
  
  if (Pu_max <= 0 || Mux_max <= 0 || Muy_max <= 0) {
    return {
      status: 'ERROR',
      message: 'Invalid capacity values'
    };
  }
  
  // Interaction check
  const alphaN = Pu / Pu_max;
  const alphaMx = Mux / Mux_max;
  const alphaMy = Muy / Muy_max;
  
  // Simplified interaction equation
  const interaction = Math.pow(alphaMx, 1.5) + Math.pow(alphaMy, 1.5);
  const allowable = Math.pow(1 - alphaN, 1.5);
  
  return {
    status: interaction <= allowable ? 'OK' : 'FAIL',
    alphaN,
    alphaMx,
    alphaMy,
    interaction,
    allowable,
    utilization: (interaction / allowable) * 100
  };
}