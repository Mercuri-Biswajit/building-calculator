// ═══════════════════════════════════════════════════════════════════════════
// BEAM FLEXURAL DESIGN FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

import { BEAM_CONSTANTS } from './beamConstants';

/**
 * Design singly reinforced beam
 */
export function designSinglyReinforcedBeam(Mu, b, d, fck, fy) {
  // Using quadratic formula simplified approach:
  // R = Mu / (b * d^2)
  const R = (Mu * 1000000) / (b * d * d); // Convert Mu from kNm to Nmm
  
  // pt = 50 * fck / fy * [1 - sqrt(1 - (4.6 * R) / fck)]
  const term = 1 - Math.sqrt(1 - (4.6 * R / fck));
  const pt = (50 * fck / fy) * term;
  
  // Ast = pt * b * d / 100
  const Ast_required = (pt * b * d) / 100;
  
  // Check minimum reinforcement
  const Ast_min = Math.max(
    (0.85 * b * d) / fy,  // IS 456 Cl. 26.5.1.1
    (0.24 * Math.sqrt(fck) * b * d) / fy  // Alternative formula
  );
  
  const Ast_provided = Math.max(Ast_required, Ast_min);
  
  // Calculate number of bars
  const barSizes = [8, 10, 12, 16, 20, 25, 32];
  const barOptions = barSizes.map(dia => {
    const area = Math.PI * dia * dia / 4;
    const numBars = Math.ceil(Ast_provided / area);
    const actualAst = numBars * area;
    return {
      diameter: dia,
      area,
      numBars,
      actualAst,
      spacing: b / (numBars + 1)
    };
  }).filter(opt => opt.numBars >= 2 && opt.numBars <= 8 && opt.spacing >= 75);
  
  return {
    Ast_required,
    Ast_min,
    Ast_provided,
    pt_required: pt,
    pt_provided: (Ast_provided * 100) / (b * d),
    barOptions: barOptions.slice(0, 3), // Top 3 options
    designType: 'singly'
  };
}

/**
 * Design doubly reinforced beam
 */
export function designDoublyReinforcedBeam(Mu, Mu_lim, b, d, fck, fy, d_prime) {
  // Additional moment to be resisted
  const Mu2 = Mu - Mu_lim;
  
  // Compression steel required
  const Asc_required = (Mu2 * 1000000) / (0.87 * fy * (d - d_prime));
  
  // Tension steel for Mu_lim
  const xu_max_by_d = BEAM_CONSTANTS.xu_max_d[`Fe${fy}`] || 0.48;
  const xu_max = xu_max_by_d * d;
  const Ast1 = (0.36 * fck * b * xu_max) / (0.87 * fy);
  
  // Additional tension steel for Mu2
  const Ast2 = Asc_required;
  
  // Total tension steel
  const Ast_required = Ast1 + Ast2;
  
  // Check minimum reinforcement
  const Ast_min = Math.max(
    (0.85 * b * d) / fy,
    (0.24 * Math.sqrt(fck) * b * d) / fy
  );
  
  const Ast_provided = Math.max(Ast_required, Ast_min);
  
  // Calculate bar options
  const barSizes = [12, 16, 20, 25, 32];
  const tensionBarOptions = barSizes.map(dia => {
    const area = Math.PI * dia * dia / 4;
    const numBars = Math.ceil(Ast_provided / area);
    const actualAst = numBars * area;
    return {
      diameter: dia,
      numBars,
      actualAst,
      spacing: b / (numBars + 1)
    };
  }).filter(opt => opt.numBars >= 2 && opt.numBars <= 10 && opt.spacing >= 75);
  
  const compressionBarOptions = barSizes.map(dia => {
    const area = Math.PI * dia * dia / 4;
    const numBars = Math.ceil(Asc_required / area);
    const actualAsc = numBars * area;
    return {
      diameter: dia,
      numBars,
      actualAsc,
      spacing: b / (numBars + 1)
    };
  }).filter(opt => opt.numBars >= 2 && opt.numBars <= 6 && opt.spacing >= 75);
  
  return {
    Ast_required,
    Ast_provided,
    Asc_required,
    Mu_lim,
    Mu2,
    pt_required: (Ast_required * 100) / (b * d),
    pt_provided: (Ast_provided * 100) / (b * d),
    tensionBarOptions: tensionBarOptions.slice(0, 3),
    compressionBarOptions: compressionBarOptions.slice(0, 3),
    designType: 'doubly'
  };
}
