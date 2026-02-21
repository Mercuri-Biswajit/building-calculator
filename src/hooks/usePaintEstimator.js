import { useState } from "react";

const DEFAULT_INPUTS = {
  // Room / surface dimensions
  roomLength: "",
  roomBreadth: "",
  roomHeight: "10", // ft
  numRooms: "1",
  // Openings (to deduct)
  numDoors: "1",
  doorWidth: "3.5",
  doorHeight: "7",
  numWindows: "2",
  windowWidth: "4",
  windowHeight: "4",
  // Paint type
  paintType: "interior", // interior | exterior | primer | ceiling
  // Coats
  numCoats: "2",
  // Surface condition
  surfaceCondition: "new", // new | repaint | rough
  // Coverage
  customCoverage: "", // sq.ft per litre (optional override)
};

// Typical paint coverage (sq.ft per litre) — single coat
const PAINT_COVERAGE = {
  interior: 120, // emulsion
  exterior: 100, // weather coat (textured = less)
  primer: 150, // primer sealer
  ceiling: 130, // ceiling white / distemper
};

// Surface condition multiplier on paint quantity
const SURFACE_FACTOR = {
  new: 1.0,
  repaint: 0.85, // less required (surface sealed)
  rough: 1.2, // rough / porous surface absorbs more
};

// Wastage
const WASTAGE = {
  interior: 0.05,
  exterior: 0.07,
  primer: 0.05,
  ceiling: 0.05,
};

// Paint brand reference (litres available)
const PAINT_BRANDS = [
  { brand: "Asian Paints", product: "Tractor Emulsion", coverage: 130 },
  { brand: "Berger", product: "Bison Acrylic Distemper", coverage: 120 },
  { brand: "Nerolac", product: "Impressions", coverage: 125 },
  { brand: "Dulux", product: "Velvet Touch", coverage: 115 },
];

// Standard can sizes (litres)
const CAN_SIZES = [1, 4, 10, 20];

function cansNeeded(litres) {
  // Optimise can combinations (greedy)
  let remaining = litres;
  const cans = {};
  for (const size of [...CAN_SIZES].reverse()) {
    const count = Math.floor(remaining / size);
    if (count > 0) {
      cans[size] = count;
      remaining -= count * size;
    }
  }
  if (remaining > 0) cans[CAN_SIZES[0]] = (cans[CAN_SIZES[0]] || 0) + 1;
  return cans;
}

export function calcPaintQuantity(inputs) {
  const {
    roomLength,
    roomBreadth,
    roomHeight,
    numRooms,
    numDoors,
    doorWidth,
    doorHeight,
    numWindows,
    windowWidth,
    windowHeight,
    paintType,
    numCoats,
    surfaceCondition,
    customCoverage,
  } = inputs;

  const L = parseFloat(roomLength) || 0;
  const B = parseFloat(roomBreadth) || 0;
  const H = parseFloat(roomHeight) || 0;
  const nr = parseInt(numRooms) || 1;
  const nd = parseInt(numDoors) || 0;
  const dW = parseFloat(doorWidth) || 0;
  const dH = parseFloat(doorHeight) || 0;
  const nw = parseInt(numWindows) || 0;
  const wW = parseFloat(windowWidth) || 0;
  const wH = parseFloat(windowHeight) || 0;
  const coats = parseInt(numCoats) || 2;

  if (L <= 0 || B <= 0) return null;

  // For interior/ceiling: wall area + ceiling
  // For exterior: perimeter walls only
  let wallArea, ceilingArea;

  if (paintType === "ceiling") {
    wallArea = 0;
    ceilingArea = L * B * nr;
  } else if (paintType === "exterior") {
    // Exterior: perimeter of building × height (one set of rooms)
    wallArea = 2 * (L + B) * H * nr;
    ceilingArea = 0;
  } else {
    // Interior: 4 walls + ceiling
    wallArea = 2 * (L + B) * H * nr;
    ceilingArea = paintType === "interior" ? L * B * nr : 0;
  }

  // Openings
  const doorAreaTotal = nd * dW * dH * nr;
  const windowAreaTotal = nw * wW * wH * nr;
  const deductions = doorAreaTotal + windowAreaTotal;

  const netWallArea = Math.max(0, wallArea - deductions);
  const totalArea = netWallArea + ceilingArea;

  // Coverage per litre (single coat)
  const baseCoverage = customCoverage
    ? parseFloat(customCoverage)
    : PAINT_COVERAGE[paintType] || 120;

  const surfFactor = SURFACE_FACTOR[surfaceCondition] || 1.0;
  const wastage = WASTAGE[paintType] || 0.05;

  // Litres per coat = area / coverage × surface factor
  const litresPerCoat = (totalArea / baseCoverage) * surfFactor;
  const litresNet = litresPerCoat * coats;
  const litresFinal = Math.ceil(litresNet * (1 + wastage) * 10) / 10;

  // Can breakdown
  const cans = cansNeeded(Math.ceil(litresFinal));

  // Cost estimate (rough ₹ per litre)
  const costPerLitre =
    {
      interior: 280,
      exterior: 320,
      primer: 200,
      ceiling: 160,
    }[paintType] || 280;

  const estimatedCost = Math.round(litresFinal * costPerLitre);

  // Labour
  const sqftPerPainterDay = 300; // sq.ft per painter per day
  const painterDays =
    Math.round(((totalArea * coats) / sqftPerPainterDay) * 10) / 10;

  return {
    wallArea: Math.round(wallArea * 10) / 10,
    ceilingArea: Math.round(ceilingArea * 10) / 10,
    deductions: Math.round(deductions * 10) / 10,
    totalArea: Math.round(totalArea * 10) / 10,
    coats,
    litresPerCoat: Math.round(litresPerCoat * 10) / 10,
    litresNet: Math.round(litresNet * 10) / 10,
    litresFinal,
    cans,
    estimatedCost,
    costPerLitre,
    painterDays,
    coverage: baseCoverage,
    brands: PAINT_BRANDS,
  };
}

export function usePaintEstimator() {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [results, setResults] = useState(null);

  const handleInputChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const calculate = () => {
    const r = calcPaintQuantity(inputs);
    setResults(r || { error: "Please enter valid room dimensions." });
  };

  const reset = () => {
    setInputs(DEFAULT_INPUTS);
    setResults(null);
  };

  return { inputs, results, handleInputChange, calculate, reset };
}
