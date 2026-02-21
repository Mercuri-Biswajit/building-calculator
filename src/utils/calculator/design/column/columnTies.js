// ═══════════════════════════════════════════════════════════════════════════
// COLUMN TIES DESIGN
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Design lateral ties/stirrups for column
 */
export function designColumnTies(longitudinalBarDia, b, D, fy) {
  const tieDia = Math.max(Math.ceil(longitudinalBarDia / 4), 6);
  
  const spacing = Math.min(
    Math.min(b, D),
    16 * longitudinalBarDia,
    300
  );
  
  const spacingProvided = Math.floor(spacing / 25) * 25;
  
  return {
    diameter: tieDia,
    spacing: spacingProvided,
    type: 'Rectangular ties',
    description: `${tieDia}mm φ @ ${spacingProvided}mm c/c`
  };
}
