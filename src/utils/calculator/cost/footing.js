/* eslint-disable no-unused-vars */
// ═══════════════════════════════════════════════════════════════════════════
// FOOTING SIZE CALCULATOR (IS 1904 / Thumb Rules)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate footing size (IS 1904 / Thumb Rules)
 */
export function calcFooting(inputs) {
  const { floors, buildingType, soilCondition, includeBasement, avgColumnSpan } = inputs;

  const SBC = {
    hard_rock: 800,
    soft_rock: 440,
    normal: 200,
    black_cotton: 80,
    loose_fill: 80,
  }[soilCondition] || 200;

  const isComm = buildingType === "commercial" || buildingType === "apartment";
  const liveLoad = isComm ? 7.5 : 5.0;
  const deadLoad = 5.5;
  const totalLoad = (liveLoad + deadLoad) * 1.5;
  const tributaryM2 = (avgColumnSpan * 0.3048) ** 2;
  const columnLoad = totalLoad * tributaryM2 * (floors + (includeBasement ? 1 : 0));

  const footingAreaM2 = columnLoad / SBC;
  const footingRawSide = Math.sqrt(footingAreaM2);
  const footingSide = Math.ceil(footingRawSide * 10) / 10 + 0.1;
  const footingSideMm = Math.round((footingSide * 1000) / 50) * 50;

  const footingDepthM = Math.max(0.3, footingSide / 2);
  const footingDepthMm = Math.round((footingDepthM * 1000) / 50) * 50;

  return {
    size: `${footingSideMm}mm × ${footingSideMm}mm`,
    depth: footingDepthMm,
    columnLoad,
    sbc: SBC,
    reinforcement: "12mm bars @ 150mm c/c both ways",
  };
}
