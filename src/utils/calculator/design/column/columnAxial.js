// ═══════════════════════════════════════════════════════════════════════════
// COLUMN AXIAL DESIGN
// ═══════════════════════════════════════════════════════════════════════════

import { designColumnBars } from './columnBars';

/**
 * Design axially loaded column (short column with minimum eccentricity)
 */
export function designAxialColumn(Pu, b, D, fck, fy, cover) {
  const Ag = b * D;
  
  // Pu = 0.4 * fck * Ac + 0.67 * fy * Asc
  // where Ac = Ag - Asc
  
  const pOptions = [0.8, 1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0];
  
  const designs = pOptions.map(p => {
    const Asc = (p * Ag) / 100;
    const Ac = Ag - Asc;
    const Pu_capacity = 0.4 * fck * Ac + 0.67 * fy * Asc;
    const Pu_capacity_kN = Pu_capacity / 1000;
    
    return {
      p,
      Asc,
      Ac,
      Pu_capacity: Pu_capacity_kN,
      adequate: Pu_capacity_kN >= Pu
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
    Pu_capacity: selectedDesign.Pu_capacity,
    barOptions,
    designs: adequateDesigns
  };
}
