/* eslint-disable no-unused-vars */
// ═══════════════════════════════════════════════════════════════════════════
// MATERIAL QUANTITY & SUMMARY CALCULATIONS
// ═══════════════════════════════════════════════════════════════════════════

import { THUMB_RULES } from "../../../config/calculatorConstants";

/**
 * Calculate material quantities based on area
 */
export function calcMaterialQuantities(totalArea) {
  return {
    cement: Math.round(totalArea * THUMB_RULES.cement_bags_per_sqft),
    steel: Math.round(totalArea * THUMB_RULES.steel_kg_per_sqft),
    sand: Math.round(totalArea * THUMB_RULES.sand_cft_per_sqft),
    aggregate: Math.round(totalArea * THUMB_RULES.aggregate_cft_per_sqft),
    bricks: Math.round(totalArea * THUMB_RULES.bricks_per_sqft),
    paint: Math.round(totalArea * THUMB_RULES.paint_ltr_per_sqft * 10) / 10,
    tiles: Math.round(totalArea * THUMB_RULES.tiles_sqft_per_sqft),
  };
}

/**
 * Calculate material summary from quantities
 */
export function calcMaterialSummary(materialQty, rates) {
  return {
    cement: {
      quantity: materialQty.cement,
      unit: "bags",
      rate: rates.cement,
      amount: Math.round(materialQty.cement * rates.cement),
    },
    steel: {
      quantity: materialQty.steel,
      unit: "kg",
      rate: rates.steel,
      amount: Math.round(materialQty.steel * rates.steel),
    },
    sand: {
      quantity: materialQty.sand,
      unit: "cft",
      rate: rates.sand,
      amount: Math.round(materialQty.sand * rates.sand),
    },
    aggregate: {
      quantity: materialQty.aggregate,
      unit: "cft",
      rate: rates.aggregate,
      amount: Math.round(materialQty.aggregate * rates.aggregate),
    },
    bricks: {
      quantity: materialQty.bricks,
      unit: "nos",
      rate: rates.bricks,
      amount: Math.round(materialQty.bricks * rates.bricks),
    },
  };
}
