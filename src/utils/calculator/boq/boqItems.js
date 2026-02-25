/* eslint-disable no-unused-vars */
// ═══════════════════════════════════════════════════════════════════════════
// BOQ ITEM CREATORS
// ═══════════════════════════════════════════════════════════════════════════

import {
  calcExcavationVolume,
  calcPCCVolume,
  calcRCCVolume,
  calcBrickworkVolume,
  calcPlasterArea,
  calcFlooringArea,
} from "../../shared/volumeCalculations";

import {
  calcPCCRate,
  calcRCCRate,
  calcBrickworkRate,
  calcPlasterRate,
  calcFlooringRate,
  calcPaintingRate,
} from "../../shared";

// ═══════════════════════════════════════════════════════════════════════════
// ✏️  ALL RATES IN ONE PLACE — EDIT HERE ONLY
//
//  Items 1–10  → rates are CALCULATED from MATERIAL_RATES in
//                calculatorConstants.js  (cement, steel, sand, aggregate,
//                bricks, paint, tiles, labour)
//
//  Items 11–15 → rates are FIXED below — change them whenever
//                local market prices change
// ═══════════════════════════════════════════════════════════════════════════

const PWD_RATES = {

  // ── Item 1 · Earthwork Excavation ─────────────────────────────────────
  // Unit: ₹ per cum  |  Source: PWD Schedule of Rates
  excavation: 119,

  // ── Item 11 · Flush Doors (Standard buildings) ────────────────────────
  // Unit: ₹ per nos  |  Includes frame, hardware, painting
  doorsStandard: 12000,

  // ── Item 11 · Flush Doors (Villa / Luxury buildings) ──────────────────
  doorsLuxury: 15000,

  // ── Item 12 · Aluminium Sliding Windows (Standard) ───────────────────
  // Unit: ₹ per nos  |  Includes glass, fittings
  windowsStandard: 8500,

  // ── Item 12 · Aluminium Sliding Windows (Villa / Luxury) ─────────────
  windowsLuxury: 10500,

  // ── Item 13 · Electrical Installation ────────────────────────────────
  // Unit: ₹ per sqft  |  Complete wiring, fittings & fixtures
  electrical: 150,

  // ── Item 14 · Plumbing & Sanitary Installation ────────────────────────
  // Unit: ₹ per sqft  |  Complete system including fixtures
  plumbing: 120,

  // ── Item 15 · Terrace Waterproofing ───────────────────────────────────
  // Unit: ₹ per sqm  |  Polymer-based membrane with protection screed
  waterproofing: 450,

};

// ═══════════════════════════════════════════════════════════════════════════
// ITEM CREATOR FUNCTIONS — no need to edit below this line
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Item 1 — Earthwork Excavation
 */
export function createExcavationItem(srNo, plotArea, includeBasement, basementDepth) {
  const quantity = calcExcavationVolume(plotArea, includeBasement, basementDepth);
  const rate = PWD_RATES.excavation;

  return {
    srNo,
    description: "Earthwork in Excavation for Foundation & Levelling",
    unit: "cum",
    quantity,
    rate,
    amount: Math.round(quantity * rate),
  };
}

/**
 * Item 2 — Plain Cement Concrete (PCC 1:4:8)
 * Rate auto-calculated from cement + sand + aggregate + labour
 */
export function createPCCItem(srNo, plotArea, rates, labourCostPerDay) {
  const quantity = calcPCCVolume(plotArea);
  const rate = Math.round(calcPCCRate(rates, labourCostPerDay));

  return {
    srNo,
    description: "Plain Cement Concrete 1:4:8 (150mm thick) including compaction",
    unit: "cum",
    quantity,
    rate,
    amount: Math.round(quantity * rate),
  };
}

/**
 * Item 3 — RCC Footing (M20)
 * Rate auto-calculated from cement + sand + aggregate + steel + labour
 */
export function createFootingItem(srNo, plotArea, rates, labourCostPerDay) {
  const quantity = calcRCCVolume(plotArea, 1.5 / plotArea);
  const rate = Math.round(calcRCCRate(8, 40, 6, rates, labourCostPerDay));

  return {
    srNo,
    description: "RCC Work in Footing (M20 grade) including reinforcement, formwork",
    unit: "cum",
    quantity,
    rate,
    amount: Math.round(quantity * rate),
  };
}

/**
 * Item 4 — RCC Columns (M20)
 * Rate auto-calculated from cement + sand + aggregate + steel + labour
 */
export function createColumnsItem(srNo, totalArea, rates, labourCostPerDay) {
  const quantity = calcRCCVolume(totalArea, 0.12 * 35.31);
  const rate = Math.round(calcRCCRate(8, 60, 8, rates, labourCostPerDay));

  return {
    srNo,
    description: "RCC Work in Columns (M20 grade) with reinforcement & formwork",
    unit: "cum",
    quantity,
    rate,
    amount: Math.round(quantity * rate),
  };
}

/**
 * Item 5 — RCC Beams (M20)
 * Rate auto-calculated from cement + sand + aggregate + steel + labour
 */
export function createBeamsItem(srNo, totalArea, rates, labourCostPerDay) {
  const quantity = calcRCCVolume(totalArea, 0.18 * 35.31);
  const rate = Math.round(calcRCCRate(8, 55, 7, rates, labourCostPerDay));

  return {
    srNo,
    description: "RCC Work in Beams (M20 grade) with reinforcement & formwork",
    unit: "cum",
    quantity,
    rate,
    amount: Math.round(quantity * rate),
  };
}

/**
 * Item 6 — RCC Slab (M20, 125mm)
 * Rate auto-calculated from cement + sand + aggregate + steel + labour
 */
export function createSlabItem(srNo, totalArea, rates, labourCostPerDay) {
  const quantity = calcRCCVolume(totalArea, 0.42);
  const rate = Math.round(calcRCCRate(8, 45, 5, rates, labourCostPerDay));

  return {
    srNo,
    description: "RCC Work in Slab (M20 grade, 125mm thick) with reinforcement",
    unit: "cum",
    quantity,
    rate,
    amount: Math.round(quantity * rate),
  };
}

/**
 * Item 7 — Brick Masonry CM 1:6
 * Rate auto-calculated from bricks + cement + sand + labour
 */
export function createBrickworkItem(srNo, totalArea, materialQty, rates, labourCostPerDay) {
  const quantity = calcBrickworkVolume(totalArea);
  const bricksPerCum = materialQty.bricks / quantity;
  const rate = Math.round(calcBrickworkRate(bricksPerCum, rates, labourCostPerDay));

  return {
    srNo,
    description: "Brick Masonry in CM 1:6 (230mm thick) in superstructure",
    unit: "cum",
    quantity,
    rate,
    amount: Math.round(quantity * rate),
  };
}

/**
 * Item 8 — Cement Plaster 1:4
 * Rate auto-calculated from cement + sand + labour
 */
export function createPlasteringItem(srNo, totalArea, rates, labourCostPerDay) {
  const quantity = calcPlasterArea(totalArea);
  const rate = Math.round(calcPlasterRate(rates, labourCostPerDay));

  return {
    srNo,
    description: "Cement Plaster 1:4 (12mm thick internal, 15mm external)",
    unit: "sqm",
    quantity,
    rate,
    amount: Math.round(quantity * rate),
  };
}

/**
 * Item 9 — Vitrified Tile Flooring 600×600mm
 * Rate auto-calculated from tiles + cement + labour
 */
export function createFlooringItem(srNo, totalArea, materialQty, rates, labourCostPerDay) {
  const quantity = calcFlooringArea(totalArea);
  const tilesPerSqm = materialQty.tiles / quantity;
  const rate = Math.round(calcFlooringRate(tilesPerSqm, rates, labourCostPerDay));

  return {
    srNo,
    description: "Vitrified Tile Flooring 600x600mm with cement bed & grouting",
    unit: "sqm",
    quantity,
    rate,
    amount: Math.round(quantity * rate),
  };
}

/**
 * Item 10 — Acrylic Emulsion Paint (2 coats)
 * Rate auto-calculated from paint + labour
 */
export function createPaintingItem(srNo, totalArea, materialQty, rates, labourCostPerDay) {
  const plasterSqm = calcPlasterArea(totalArea);
  const paintLtrsPerSqm = materialQty.paint / plasterSqm;
  const rate = Math.round(calcPaintingRate(paintLtrsPerSqm, rates, labourCostPerDay));

  return {
    srNo,
    description: "Acrylic Emulsion Paint (2 coats) on plastered surface",
    unit: "sqm",
    quantity: plasterSqm,
    rate,
    amount: Math.round(plasterSqm * rate),
  };
}

/**
 * Item 11 — Flush Doors
 * Fixed rate from PWD_RATES above
 */
export function createDoorsItem(srNo, totalArea, buildingType) {
  const quantity = Math.ceil(totalArea / 300);
  const rate =
    buildingType === "villa" || buildingType === "luxury"
      ? PWD_RATES.doorsLuxury
      : PWD_RATES.doorsStandard;

  return {
    srNo,
    description: "Flush Doors with Frame, Hardware & Painting",
    unit: "nos",
    quantity,
    rate,
    amount: quantity * rate,
  };
}

/**
 * Item 12 — Aluminium Sliding Windows
 * Fixed rate from PWD_RATES above
 */
export function createWindowsItem(srNo, totalArea, buildingType) {
  const quantity = Math.ceil(totalArea / 150);
  const rate =
    buildingType === "villa" || buildingType === "luxury"
      ? PWD_RATES.windowsLuxury
      : PWD_RATES.windowsStandard;

  return {
    srNo,
    description: "Aluminium Sliding Windows with Glass & Fittings",
    unit: "nos",
    quantity,
    rate,
    amount: quantity * rate,
  };
}

/**
 * Item 13 — Electrical Installation
 * Fixed rate from PWD_RATES above
 */
export function createElectricalItem(srNo, totalArea) {
  const rate = PWD_RATES.electrical;

  return {
    srNo,
    description: "Electrical Wiring, Fittings & Fixtures (Complete installation)",
    unit: "sqft",
    quantity: totalArea,
    rate,
    amount: Math.round(totalArea * rate),
  };
}

/**
 * Item 14 — Plumbing & Sanitary
 * Fixed rate from PWD_RATES above
 */
export function createPlumbingItem(srNo, totalArea) {
  const rate = PWD_RATES.plumbing;

  return {
    srNo,
    description: "Plumbing, Sanitary Installation & Fixtures (Complete system)",
    unit: "sqft",
    quantity: totalArea,
    rate,
    amount: Math.round(totalArea * rate),
  };
}

/**
 * Item 15 — Terrace Waterproofing
 * Fixed rate from PWD_RATES above
 */
export function createWaterproofingItem(srNo, plotArea) {
  const quantity = Math.round(plotArea * 0.0929 * 10) / 10;
  const rate = PWD_RATES.waterproofing;

  return {
    srNo,
    description: "Terrace Waterproofing (Polymer based membrane with protection)",
    unit: "sqm",
    quantity,
    rate,
    amount: Math.round(quantity * rate),
  };
}