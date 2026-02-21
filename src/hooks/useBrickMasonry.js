/* eslint-disable no-unused-vars */
import { useState } from "react";

const DEFAULT_INPUTS = {
  // Building dimensions
  buildingLength: "",
  buildingBreadth: "",
  floorHeight: "",
  floors: "1",

  // Wall thickness
  wallThickness: "9", // inches: 4.5, 9, 13.5

  // Deductions — doors
  numDoors: "2",
  doorWidth: "3.5",
  doorHeight: "7",

  // Deductions — windows
  numWindows: "4",
  windowWidth: "4",
  windowHeight: "4",

  // Deductions — extra (ventilators, arches, etc.)
  extraDeductionSqFt: "",

  // Materials
  mortarRatio: "1:6",
  brickType: "standard",
  wastagePercent: "5",

  // Foundation
  includeFoundation: true,
  foundationDepth: "3", // ft below plinth
  foundationWidth: "27", // inches (default = 3× a 9" wall)
};

// Brick sizes (mm): L × W × H
const BRICK_SIZES = {
  standard: {
    L: 230,
    W: 115,
    H: 75,
    label: "Standard Clay Brick (230×115×75mm)",
  },
  flyash: {
    L: 230,
    W: 110,
    H: 90,
    label: "Fly-Ash Brick (230×110×90mm)",
  },
  hollow: {
    L: 400,
    W: 200,
    H: 200,
    label: "Hollow Concrete Block (400×200×200mm)",
  },
};

const MORTAR_JOINT = 10; // mm
const MORTAR_FRACTION = 0.3; // ~30% of brickwork volume is mortar

const MORTAR_DATA = {
  "1:3": { cementBagsPerCum: 16.0, sandCftPerCum: 48.0 },
  "1:4": { cementBagsPerCum: 12.5, sandCftPerCum: 50.0 },
  "1:5": { cementBagsPerCum: 10.2, sandCftPerCum: 51.0 },
  "1:6": { cementBagsPerCum: 8.5, sandCftPerCum: 51.0 },
  "1:8": { cementBagsPerCum: 6.5, sandCftPerCum: 52.0 },
};

export function calcBrickMasonry(inputs) {
  const {
    buildingLength,
    buildingBreadth,
    floorHeight,
    floors,
    wallThickness,
    numDoors,
    doorWidth,
    doorHeight,
    numWindows,
    windowWidth,
    windowHeight,
    extraDeductionSqFt,
    mortarRatio,
    brickType,
    wastagePercent,
    includeFoundation,
    foundationDepth,
    foundationWidth,
  } = inputs;

  const L = parseFloat(buildingLength) || 0;
  const B = parseFloat(buildingBreadth) || 0;
  const FH = parseFloat(floorHeight) || 0;
  const F = parseInt(floors) || 1;
  const Th = parseFloat(wallThickness); // inches
  const ThM = Th * 0.0254; // metres

  if (L <= 0 || B <= 0 || FH <= 0) return null;

  // ── Total perimeter wall area (all 4 sides × all floors) ──────────────────
  const perimeter = 2 * (L + B); // ft
  const grossAreaPerFloor = perimeter * FH; // sq ft
  const grossAreaTotal = grossAreaPerFloor * F; // sq ft

  // ── Deductions ─────────────────────────────────────────────────────────────
  const nd = parseInt(numDoors) || 0;
  const dW = parseFloat(doorWidth) || 0;
  const dH = parseFloat(doorHeight) || 0;
  const nw = parseInt(numWindows) || 0;
  const wW = parseFloat(windowWidth) || 0;
  const wH = parseFloat(windowHeight) || 0;
  const ext = parseFloat(extraDeductionSqFt) || 0;

  const doorArea = nd * dW * dH;
  const windowArea = nw * wW * wH;
  const totalDeduction = doorArea + windowArea + ext;

  // Deductions repeat each floor
  const totalDeductionAllFloors = totalDeduction * F;

  const netArea = Math.max(0, grossAreaTotal - totalDeductionAllFloors);

  // ── Convert to SI ──────────────────────────────────────────────────────────
  const netAreaM2 = netArea * 0.0929;
  const brickworkVolCum = netAreaM2 * ThM;

  // ── Bricks per cum ─────────────────────────────────────────────────────────
  const brick = BRICK_SIZES[brickType];
  const bL = (brick.L + MORTAR_JOINT) / 1000; // m (with joint)
  const bH = (brick.H + MORTAR_JOINT) / 1000;
  const bW = (brick.W + MORTAR_JOINT) / 1000;

  const bricksPerCumRaw = 1 / (bL * bH * bW);
  const bricksPerCumPractical = Math.round(bricksPerCumRaw);

  const bricksNet = Math.round(brickworkVolCum * bricksPerCumPractical);
  const waste = (parseFloat(wastagePercent) || 5) / 100;
  const bricksWithWaste = Math.round(bricksNet * (1 + waste));

  // ── Mortar ─────────────────────────────────────────────────────────────────
  const mortarVolCum = brickworkVolCum * MORTAR_FRACTION;
  const md = MORTAR_DATA[mortarRatio] || MORTAR_DATA["1:6"];
  const cementBags = Math.round(mortarVolCum * md.cementBagsPerCum * 10) / 10;
  const sandCft = Math.round(mortarVolCum * md.sandCftPerCum * 10) / 10;

  // ── Foundation brickwork ────────────────────────────────────────────────────
  let foundationVolCum = 0;
  let foundationBricksNet = 0;
  let foundationBricksWithWaste = 0;
  let foundationCementBags = 0;
  let foundationSandCft = 0;
  let foundationMortarVolCum = 0;

  if (includeFoundation) {
    const FD = parseFloat(foundationDepth) || 0; // ft
    const FW = parseFloat(foundationWidth) || 0; // inches
    if (FD > 0 && FW > 0) {
      const FDm = FD * 0.3048;
      const FWm = FW * 0.0254;
      const perimeterM = perimeter * 0.3048;
      const rawFoundVol = perimeterM * FDm * FWm;

      foundationBricksNet = Math.round(rawFoundVol * bricksPerCumPractical);
      foundationBricksWithWaste = Math.round(foundationBricksNet * (1 + waste));
      foundationMortarVolCum =
        Math.round(rawFoundVol * MORTAR_FRACTION * 100) / 100;
      foundationCementBags =
        Math.round(foundationMortarVolCum * md.cementBagsPerCum * 10) / 10;
      foundationSandCft =
        Math.round(foundationMortarVolCum * md.sandCftPerCum * 10) / 10;
      foundationVolCum = Math.round(rawFoundVol * 100) / 100;
    }
  }

  const totalBricksWithWaste = bricksWithWaste + foundationBricksWithWaste;
  const totalCementBags =
    Math.round((cementBags + foundationCementBags) * 10) / 10;
  const totalSandCft = Math.round((sandCft + foundationSandCft) * 10) / 10;

  // ── Labour ─────────────────────────────────────────────────────────────────
  const labourFactor = Th <= 4.5 ? 3.0 : Th <= 9 ? 3.5 : 4.2;
  const superstructureVol = brickworkVolCum;
  const totalBrickworkVol = superstructureVol + foundationVolCum;
  const masonDays = Math.round(totalBrickworkVol * labourFactor * 10) / 10;
  const helperDays = Math.round(masonDays * 1.5 * 10) / 10;

  return {
    // Areas
    perimeter: Math.round(perimeter * 10) / 10,
    grossAreaPerFloor: Math.round(grossAreaPerFloor * 10) / 10,
    grossAreaTotal: Math.round(grossAreaTotal * 10) / 10,
    doorArea: Math.round(doorArea * 10) / 10,
    windowArea: Math.round(windowArea * 10) / 10,
    extraDeduction: Math.round(ext * 10) / 10,
    totalDeductionAllFloors: Math.round(totalDeductionAllFloors * 10) / 10,
    netArea: Math.round(netArea * 10) / 10,
    netAreaM2: Math.round(netAreaM2 * 10) / 10,
    floors: F,
    // Volume
    brickworkVolCum: Math.round(brickworkVolCum * 100) / 100,
    // Bricks (superstructure)
    bricksPerCum: bricksPerCumPractical,
    bricksNet,
    bricksWithWaste,
    wastageCount: bricksWithWaste - bricksNet,
    // Mortar (superstructure)
    mortarVolCum: Math.round(mortarVolCum * 100) / 100,
    cementBags,
    sandCft,
    // Foundation
    includeFoundation: !!includeFoundation,
    foundationVolCum,
    foundationBricksNet,
    foundationBricksWithWaste,
    foundationWastageCount: foundationBricksWithWaste - foundationBricksNet,
    foundationMortarVolCum,
    foundationCementBags,
    foundationSandCft,
    foundationDepthFt: parseFloat(foundationDepth) || 0,
    foundationWidthIn: parseFloat(foundationWidth) || 0,
    // Grand totals
    totalBricksWithWaste,
    totalCementBags,
    totalSandCft,
    // Labour
    masonDays,
    helperDays,
    // Labels
    wallThicknessLabel: `${Th}"`,
    brickLabel: BRICK_SIZES[brickType].label,
    mortarRatio,
  };
}

export function useBrickMasonry() {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [results, setResults] = useState(null);

  const handleInputChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const calculate = () => {
    const r = calcBrickMasonry(inputs);
    setResults(
      r || {
        error:
          "Please enter valid building dimensions (length, breadth, floor height).",
      },
    );
  };

  const reset = () => {
    setInputs(DEFAULT_INPUTS);
    setResults(null);
  };

  return { inputs, results, handleInputChange, calculate, reset };
}
