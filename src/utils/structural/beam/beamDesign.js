/* eslint-disable no-unused-vars */
// ═══════════════════════════════════════════════════════════════════════════
// BEAM DESIGN CALCULATOR - IS 456:2000 COMPLIANT
// Main entry point for beam design
// ═══════════════════════════════════════════════════════════════════════════

import { calcEffectiveDepth, calcLimitingMoment, calcDevelopmentLength } from './beamHelpers';
import { designSinglyReinforcedBeam, designDoublyReinforcedBeam } from './beamFlexure';
import { designShearReinforcement } from './beamShear';
import { checkDeflection } from './beamDeflection';

/**
 * Main beam design function
 */
export function designBeam(inputs) {
  const {
    // Loads
    Mu,           // Factored bending moment (kNm)
    Vu,           // Factored shear force (kN)
    
    // Dimensions
    b,            // Width (mm)
    D,            // Total depth (mm)
    span,         // Span (mm)
    
    // Materials
    fck,          // Concrete grade (MPa)
    fy,           // Steel grade (MPa)
    
    // Other
    cover,        // Clear cover (mm)
    exposure      // Exposure condition
  } = inputs;
  
  // Validate inputs
  if (!Mu || !b || !D || !fck || !fy) {
    return { error: 'Missing required inputs' };
  }
  
  // Determine steel grade
  const steelGrade = `Fe${fy}`;
  
  // Assume bar sizes for initial calculation
  const assumedMainBar = 20; // mm
  const assumedStirrups = 8; // mm
  
  // Calculate effective depth
  const d = calcEffectiveDepth(D, cover, assumedMainBar, assumedStirrups);
  
  // Effective cover to tension reinforcement
  const d_prime = cover + assumedStirrups + assumedMainBar / 2;
  
  // Calculate limiting moment
  const limiting = calcLimitingMoment(b, d, fck, steelGrade);
  
  // Decide between singly and doubly reinforced
  let flexuralDesign;
  if (Mu <= limiting.Mu_lim) {
    flexuralDesign = designSinglyReinforcedBeam(Mu, b, d, fck, fy);
  } else {
    flexuralDesign = designDoublyReinforcedBeam(Mu, limiting.Mu_lim, b, d, fck, fy, d_prime);
  }
  
  // Design shear reinforcement
  const Ast = flexuralDesign.Ast_provided || flexuralDesign.barOptions[0].actualAst;
  const shearDesign = designShearReinforcement(Vu, b, d, fck, fy, Ast);
  
  // Check deflection
  const deflectionCheck = span ? checkDeflection(span, d, flexuralDesign.pt_provided, 0.58 * fy) : null;
  
  // Calculate development length
  const recommendedBarDia = flexuralDesign.barOptions ? flexuralDesign.barOptions[0].diameter : 20;
  const devLength = calcDevelopmentLength(recommendedBarDia, fck, fy);
  
  return {
    inputs: {
      Mu,
      Vu,
      b,
      D,
      d,
      span,
      fck,
      fy,
      cover,
      d_prime
    },
    limiting,
    flexuralDesign,
    shearDesign,
    deflectionCheck,
    developmentLength: devLength,
    summary: {
      designType: flexuralDesign.designType,
      tension: flexuralDesign.barOptions 
        ? `${flexuralDesign.barOptions[0].numBars} - ${flexuralDesign.barOptions[0].diameter}mm φ`
        : `${flexuralDesign.tensionBarOptions[0].numBars} - ${flexuralDesign.tensionBarOptions[0].diameter}mm φ`,
      compression: flexuralDesign.compressionBarOptions 
        ? `${flexuralDesign.compressionBarOptions[0].numBars} - ${flexuralDesign.compressionBarOptions[0].diameter}mm φ`
        : 'Not required',
      stirrups: shearDesign.stirrupOptions 
        ? shearDesign.stirrupOptions[0].description
        : shearDesign.stirrupDetails[0].description,
      status: shearDesign.status === 'FAIL' || (deflectionCheck && deflectionCheck.status === 'FAIL') ? 'FAIL' : 'OK'
    }
  };
}

export default designBeam;
