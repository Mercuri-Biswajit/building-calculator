// ═══════════════════════════════════════════════════════════════════════════
// COLUMN BAR DESIGN
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Design column bars
 */
export function designColumnBars(Asc_required, b, D, cover) {
  const barDiameters = [12, 16, 20, 25, 32];
  const options = [];
  
  for (let dia of barDiameters) {
    const areaPerBar = Math.PI * dia * dia / 4;
    const numBars = Math.ceil(Asc_required / areaPerBar);
    
    if (numBars < 4) continue;
    
    const perimeter = 2 * (b + D) - 8 * (cover + 8);
    const spacing = perimeter / numBars;
    const minSpacing = Math.max(dia, 20 + 5);
    
    if (spacing < minSpacing) continue;
    if (spacing > 300) continue;
    
    const actualAsc = numBars * areaPerBar;
    const p = (actualAsc * 100) / (b * D);
    
    options.push({
      diameter: dia,
      numBars,
      actualAsc,
      p_provided: p,
      spacing,
      description: `${numBars} - ${dia}mm φ bars`
    });
  }
  
  return options.slice(0, 3);
}
