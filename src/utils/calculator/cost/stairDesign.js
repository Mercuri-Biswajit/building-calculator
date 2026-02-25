/* eslint-disable no-unused-vars */
// ═══════════════════════════════════════════════════════════════════════════
// STAIRCASE DESIGN CALCULATOR (NBC 2016 Compliant)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate staircase design (NBC 2016 compliant)
 */
export function calcStairDesign(length, breadth, floorHeight, floors, buildingType) {
  const fftMm = floorHeight * 304.8;
  const isComm = buildingType === "commercial" || buildingType === "apartment";
  const riser = isComm ? 175 : 150;
  const tread = isComm ? 250 : 270;

  const risersPerFlight = Math.round(fftMm / 2 / riser);
  const actualRiser = Math.round(fftMm / 2 / risersPerFlight);
  const treadsPerFlight = risersPerFlight - 1;
  const goingPerFlight = treadsPerFlight * tread;
  const landingWidth = Math.max(1000, Math.round(Math.min(length, breadth) * 304.8 * 0.15));
  const stairWidth = isComm ? 1200 : 900;

  const angle = Math.atan(actualRiser / tread);
  const slopedSpan = goingPerFlight / Math.cos(angle);
  const waistSlab = Math.max(100, Math.round(slopedSpan / 20 / 10) * 10);

  const headroomClear = fftMm - actualRiser * risersPerFlight;
  const headroom = headroomClear >= 2100 ? "✓ Adequate (≥2100mm)" : "⚠ Check Headroom";

  const twoRplusT = 2 * actualRiser + tread;
  const checkPass = twoRplusT >= 550 && twoRplusT <= 700 ? "✓ Pass" : "⚠ Review";

  return {
    riser: actualRiser,
    tread,
    risersPerFlight,
    treadsPerFlight,
    goingPerFlight: Math.round(goingPerFlight),
    landingWidth,
    stairWidth,
    waistSlab,
    angle: ((angle * 180) / Math.PI).toFixed(1),
    headroom,
    twoRplusT,
    checkPass,
    totalFlights: floors * 2,
    mainBarDia: 10,
    mainBarSpacing: 150,
    distBarDia: 8,
    distBarSpacing: 200,
  };
}
