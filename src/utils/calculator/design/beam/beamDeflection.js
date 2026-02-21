// ═══════════════════════════════════════════════════════════════════════════
// BEAM DEFLECTION CHECK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check deflection control
 */
export function checkDeflection(span, d, pt, fs) {
  // Basic span/depth ratio for simply supported beam (IS 456 Cl. 23.2.1)
  const basic_ratio = 20;
  
  // Modification factor for tension reinforcement
  const kt = 1.0; // Simplified - actual calculation is complex
  
  // Modification factor for compression reinforcement
  const kc = 1.0; // Simplified
  
  // Allowable span/depth ratio
  const allowable_ratio = basic_ratio * kt * kc;
  
  // Actual span/depth ratio
  const actual_ratio = span / d;
  
  return {
    basic_ratio,
    allowable_ratio,
    actual_ratio,
    status: actual_ratio <= allowable_ratio ? 'OK' : 'FAIL',
    message: actual_ratio <= allowable_ratio 
      ? 'Deflection is within limits' 
      : 'Increase depth or reduce span'
  };
}
