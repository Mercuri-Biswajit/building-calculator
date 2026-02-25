// ═══════════════════════════════════════════════════════════════════════════
// COLUMN UNIAXIAL BENDING DESIGN
// ═══════════════════════════════════════════════════════════════════════════

import { designColumnBars } from './columnBars';

/**
 * Design column with uniaxial bending
 */
export function designUniaxialColumn(Pu, Mu, b, D, fck, fy, cover, axis = 'major') {
  const d_prime = cover + 8 + 10;
  const d = (axis === 'major' ? D : b) - d_prime;

  const pOptions = [0.8, 1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0];
  const Ag = b * D;
  
  const designs = pOptions.map(p => {
    const Asc = (p * Ag) / 100;
    const Pu_max = (0.4 * fck * (Ag - Asc) + 0.67 * fy * Asc) / 1000;
    const Mu_max = 0.87 * fy * Asc * (d - d_prime) / 1000000;
    
    const utilizationAxial = Pu / Pu_max;
    const utilizationMoment = Mu / Mu_max;
    const interaction = utilizationAxial + utilizationMoment;
    
    return {
      p,
      Asc,
      Pu_max,
      Mu_max,
      utilizationAxial,
      utilizationMoment,
      interaction,
      adequate: interaction <= 1.0
    };
  });
  
  const adequateDesigns = designs.filter(d => d.adequate);
  
  if (adequateDesigns.length === 0) {
    return {
      status: 'FAIL',
      message: 'Section inadequate - increase dimensions or use higher grade materials',
      designs
    };
  }
  
  const selectedDesign = adequateDesigns[0];
  const barOptions = designColumnBars(selectedDesign.Asc, b, D, cover);
  
  return {
    status: 'OK',
    p_required: selectedDesign.p,
    Asc_required: selectedDesign.Asc,
    Pu_capacity: selectedDesign.Pu_max,
    Mu_capacity: selectedDesign.Mu_max,
    utilization: {
      axial: selectedDesign.utilizationAxial,
      moment: selectedDesign.utilizationMoment,
      total: selectedDesign.interaction
    },
    barOptions,
    designs: adequateDesigns
  };
}
