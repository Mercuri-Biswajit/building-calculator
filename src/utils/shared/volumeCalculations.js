/* eslint-disable no-unused-vars */
// ═══════════════════════════════════════════════════════════════════════════
// VOLUME & QUANTITY CALCULATION HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate excavation volume in cubic meters
 */
export function calcExcavationVolume(plotArea, includeBasement, basementDepth) {
  const depthFt = includeBasement ? basementDepth + 3 : 3;
  const volumeCft = plotArea * depthFt;
  return Math.round(volumeCft * 0.0283 * 100) / 100;
}

/**
 * Calculate PCC (Plain Cement Concrete) volume
 */
export function calcPCCVolume(plotArea) {
  const volumeCft = plotArea * 0.5;
  return Math.round(volumeCft * 0.0283 * 100) / 100;
}

/**
 * Calculate RCC element volume (footing, columns, beams, slabs)
 */
export function calcRCCVolume(totalArea, factorCft) {
  const volumeCft = totalArea * factorCft;
  return Math.round(volumeCft * 0.0283 * 100) / 100;
}

/**
 * Calculate brickwork volume
 */
export function calcBrickworkVolume(totalArea) {
  const brickArea = totalArea * 3.5;
  const volumeCft = brickArea * 0.75;
  return Math.round(volumeCft * 0.0283 * 100) / 100;
}

/**
 * Calculate plastering area in square meters
 */
export function calcPlasterArea(totalArea) {
  const brickArea = totalArea * 3.5;
  const plasterArea = brickArea * 2;
  return Math.round(plasterArea * 0.0929 * 10) / 10;
}

/**
 * Calculate flooring area in square meters
 */
export function calcFlooringArea(totalArea) {
  return Math.round(totalArea * 0.0929 * 10) / 10;
}
