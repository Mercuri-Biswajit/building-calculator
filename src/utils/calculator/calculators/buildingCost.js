/* eslint-disable no-unused-vars */
// ═══════════════════════════════════════════════════════════════════════════
// BUILDING COST CALCULATOR
// ═══════════════════════════════════════════════════════════════════════════

import {
  THUMB_RULES,
  BUILDING_TYPES,
  FINISH_GRADES,
  SOIL_CONDITIONS,
  MATERIAL_RATES,
} from "../../../config/calculatorConstants";

/**
 * Calculate comprehensive building construction cost
 */
export function calcBuildingCost(inputs) {
  const {
    length,
    breadth,
    floors,
    buildingType,
    finishGrade,
    soilCondition,
    includeBasement,
    basementDepth,
    customRates,
  } = inputs;

  const plotArea = length * breadth;
  const totalArea = plotArea * floors + (includeBasement ? plotArea : 0);

  const typeFactor = BUILDING_TYPES[buildingType].costFactor;
  const finishFactor = FINISH_GRADES[finishGrade].factor;
  const soilFactor = SOIL_CONDITIONS[soilCondition].factor;

  const cement = totalArea * THUMB_RULES.cement_bags_per_sqft;
  const steel = totalArea * THUMB_RULES.steel_kg_per_sqft;
  const sand = totalArea * THUMB_RULES.sand_cft_per_sqft;
  const aggregate = totalArea * THUMB_RULES.aggregate_cft_per_sqft;
  const bricks = totalArea * THUMB_RULES.bricks_per_sqft;
  const paint = totalArea * THUMB_RULES.paint_ltr_per_sqft;
  const tiles = totalArea * THUMB_RULES.tiles_sqft_per_sqft;
  const labourDays = totalArea * THUMB_RULES.labour_days_per_sqft;

  const rates = {
    cement: customRates.cement || MATERIAL_RATES.cement.rate,
    steel: customRates.steel || MATERIAL_RATES.steel.rate,
    sand: customRates.sand || MATERIAL_RATES.sand.rate,
    aggregate: customRates.aggregate || MATERIAL_RATES.aggregate.rate,
    bricks: MATERIAL_RATES.bricks.rate,
    paint: MATERIAL_RATES.paint.rate,
    tiles: MATERIAL_RATES.tiles.rate,
    labour: MATERIAL_RATES.labour.rate,
  };

  const cementCost = cement * rates.cement;
  const steelCost = steel * rates.steel;
  const sandCost = sand * rates.sand;
  const aggregateCost = aggregate * rates.aggregate;
  const bricksCost = bricks * rates.bricks;
  const paintCost = paint * rates.paint;
  const tilesCost = tiles * rates.tiles;
  const labourCost = labourDays * rates.labour;

  const materialCost =
    cementCost + steelCost + sandCost + aggregateCost + bricksCost;
  const finishingCost = paintCost + tilesCost;

  const structureCost = materialCost * typeFactor * soilFactor;
  const adjustedFinishing = finishingCost * finishFactor;

  const electricalCost = totalArea * 150;
  const plumbingCost = totalArea * 120;
  const sanitaryCost = totalArea * 100;

  const basementCost = includeBasement ? plotArea * basementDepth * 800 : 0;

  const subtotal =
    structureCost +
    adjustedFinishing +
    labourCost +
    electricalCost +
    plumbingCost +
    sanitaryCost +
    basementCost;
  const contingency = subtotal * 0.08;
  const totalCost = subtotal + contingency;
  const costPerSqft = totalCost / totalArea;

  return {
    totalCost,
    costPerSqft,
    totalArea,
    breakdown: {
      structure: structureCost,
      finishing: adjustedFinishing,
      labour: labourCost,
      electrical: electricalCost,
      plumbing: plumbingCost,
      sanitary: sanitaryCost,
      basement: basementCost,
      contingency,
    },
    quantities: {
      structure: `${Math.round(cement)} bags cement, ${Math.round(steel)} kg steel`,
      finishing: `${Math.round(paint)} L paint, ${Math.round(tiles)} sq.ft tiles`,
      labour: `${Math.round(labourDays)} man-days`,
    },
  };
}
