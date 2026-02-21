// ═══════════════════════════════════════════════════════════════════════════
// BEAM DESIGN CONSTANTS - IS 456:2000
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Material Properties and Constants
 */
export const BEAM_CONSTANTS = {
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
  
  // Limiting values as per IS 456:2000
  xu_max_d: {
    Fe250: 0.53,
    Fe415: 0.48,
    Fe500: 0.46,
    Fe550: 0.44
  },
  
  // Clear cover (mm)
  clearCover: {
    mild: 25,
    moderate: 30,
    severe: 45,
    verySevere: 50,
    extreme: 75
  },
  
  // Shear strength table (IS 456 Table 19)
  shearStrengthTable: {
    ptValues: [0.15, 0.25, 0.50, 0.75, 1.00, 1.25, 1.50, 1.75, 2.00, 2.50, 3.00],
    tauValues: {
      15: [0.28, 0.35, 0.46, 0.54, 0.60, 0.64, 0.68, 0.71, 0.71, 0.71, 0.71],
      20: [0.28, 0.36, 0.48, 0.56, 0.62, 0.67, 0.72, 0.75, 0.79, 0.81, 0.82],
      25: [0.29, 0.36, 0.49, 0.57, 0.64, 0.70, 0.74, 0.78, 0.82, 0.85, 0.88],
      30: [0.29, 0.37, 0.50, 0.59, 0.66, 0.71, 0.76, 0.80, 0.84, 0.88, 0.91],
      35: [0.29, 0.37, 0.50, 0.59, 0.67, 0.73, 0.78, 0.82, 0.86, 0.90, 0.93],
      40: [0.30, 0.38, 0.51, 0.60, 0.68, 0.74, 0.79, 0.84, 0.88, 0.92, 0.95]
    }
  },
  
  // Maximum shear stress (IS 456 Table 20)
  maxShearStress: {
    15: 2.5,
    20: 2.8,
    25: 3.1,
    30: 3.5,
    35: 3.7,
    40: 4.0
  },
  
  // Bond stress (IS 456 Table 21)
  bondStress: {
    15: 1.28,
    20: 1.60,
    25: 1.76,
    30: 1.92,
    35: 2.08,
    40: 2.24
  }
};
