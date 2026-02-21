/* eslint-disable no-unused-vars */
// ═══════════════════════════════════════════════════════════════════════════
// RATE CALCULATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate PCC rate per cum
 */
export function calcPCCRate(rates, labourCostPerDay) {
  const labourDaysPerCum = 4;
  return (
    4 * rates.cement +
    0.44 * rates.sand * 35.31 +
    0.88 * rates.aggregate * 35.31 +
    labourDaysPerCum * labourCostPerDay
  );
}

/**
 * Calculate RCC rate per cum
 * @param {number} cementBags - Cement bags per cum
 * @param {number} steelKg - Steel kg per cum
 * @param {number} labourDaysPerCum - Labour days per cum
 */
export function calcRCCRate(cementBags, steelKg, labourDaysPerCum, rates, labourCostPerDay) {
  return (
    cementBags * rates.cement +
    0.45 * rates.sand * 35.31 +
    0.90 * rates.aggregate * 35.31 +
    steelKg * rates.steel +
    labourDaysPerCum * labourCostPerDay
  );
}

/**
 * Calculate brickwork rate per cum
 */
export function calcBrickworkRate(bricksPerCum, rates, labourCostPerDay) {
  const labourDaysPerCum = 3.5;
  return (
    bricksPerCum * rates.bricks +
    1.2 * rates.cement +
    0.3 * rates.sand * 35.31 +
    labourDaysPerCum * labourCostPerDay
  );
}

/**
 * Calculate plastering rate per sqm
 */
export function calcPlasterRate(rates, labourCostPerDay) {
  const labourDaysPerSqm = 0.15;
  return (
    0.018 * rates.cement +
    0.025 * rates.sand +
    labourDaysPerSqm * labourCostPerDay
  );
}

/**
 * Calculate flooring rate per sqm
 */
export function calcFlooringRate(tilesPerSqm, rates, labourCostPerDay) {
  const labourDaysPerSqm = 0.25;
  return (
    tilesPerSqm * rates.tiles +
    0.5 * rates.cement +
    labourDaysPerSqm * labourCostPerDay
  );
}

/**
 * Calculate painting rate per sqm
 */
export function calcPaintingRate(paintLtrsPerSqm, rates, labourCostPerDay) {
  const labourDaysPerSqm = 0.08;
  return (
    paintLtrsPerSqm * rates.paint +
    labourDaysPerSqm * labourCostPerDay
  );
}
