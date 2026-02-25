// ═══════════════════════════════════════════════════════════════════════════
// COLUMN DESIGN CONSTANTS - IS 456:2000
// ═══════════════════════════════════════════════════════════════════════════

export const COLUMN_CONSTANTS = {
  // Steel grades (yield strength in MPa)
  steel: {
    Fe415: { fy: 415, Es: 200000 },
    Fe500: { fy: 500, Es: 200000 },
    Fe550: { fy: 550, Es: 200000 }
  },
  
  // Concrete grades (characteristic strength in MPa)
  concrete: {
    M15: { fck: 15 },
    M20: { fck: 20 },
    M25: { fck: 25 },
    M30: { fck: 30 },
    M35: { fck: 35 },
    M40: { fck: 40 }
  },
  
  // Effective length factors (IS 456 Table 28)
  effectiveLengthFactors: {
    'both-fixed': 0.65,
    'one-fixed-one-hinged': 0.80,
    'both-hinged': 1.00,
    'one-fixed-one-free': 2.00
  },
  
  // Clear cover (mm)
  clearCover: {
    mild: 40,
    moderate: 40,
    severe: 45,
    verySevere: 50,
    extreme: 75
  }
};
