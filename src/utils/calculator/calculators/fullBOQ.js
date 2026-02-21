/* eslint-disable no-unused-vars */
// ═══════════════════════════════════════════════════════════════════════════
// FULL BOQ CALCULATOR — WB PWD RATES
// Exports: calcStandardBOQ | calcPremiumBOQ | calcFloorWiseBOQ
// ═══════════════════════════════════════════════════════════════════════════

import * as STD from "../../../config/wbPwdRatesStandard";
import * as PRE from "../../../config/wbPwdRatesPremium";

// ───────────────────────────────────────────────────────────────────────────
// UNIT HELPERS
// ───────────────────────────────────────────────────────────────────────────
const toSqm = (sqft) => Math.round(sqft * 0.0929 * 100) / 100;
const toCum = (cft) => Math.round(cft * 0.02832 * 100) / 100;
const r2 = (n) => Math.round(n * 100) / 100;

function floorName(idx) {
  if (idx === -1) return "Foundation & Substructure";
  if (idx === 0) return "Ground Floor (G)";
  return `Floor ${idx} (G+${idx})`;
}

function getEscalation(RATES, floorIndex) {
  const keys = Object.keys(RATES.FLOOR_ESCALATION)
    .map(Number)
    .sort((a, b) => a - b);
  const clampedIdx = Math.min(floorIndex, keys[keys.length - 1]);
  return RATES.FLOOR_ESCALATION[clampedIdx] ?? 1.12;
}

// ───────────────────────────────────────────────────────────────────────────
// CORE: build site-prep & foundation BOQ items (once for whole building)
// ───────────────────────────────────────────────────────────────────────────
function buildFoundation(plotArea, RATES) {
  const items = [];
  const matQty = {
    cement: 0,
    steel: 0,
    sand: 0,
    aggregate: 0,
    bricks: 0,
    tiles: 0,
    paint: 0,
  };

  const addItem = (key, qty, unit) => {
    const ir = RATES.ITEM_RATES[key];
    if (!ir) return;
    const amt = Math.round(qty * ir.rate);
    items.push({
      description: ir.description,
      unit: ir.unit ?? unit,
      quantity: r2(qty),
      rate: ir.rate,
      amount: amt,
      labourDays: r2((ir.labourDaysPerUnit ?? 0) * qty),
    });
    if (ir.cementBagsPerUnit) matQty.cement += ir.cementBagsPerUnit * qty;
    if (ir.steelKgPerUnit) matQty.steel += ir.steelKgPerUnit * qty;
    if (ir.sandCftPerUnit) matQty.sand += ir.sandCftPerUnit * qty;
    if (ir.aggCftPerUnit) matQty.aggregate += ir.aggCftPerUnit * qty;
    if (ir.bricksPerUnit) matQty.bricks += ir.bricksPerUnit * qty;
  };

  // ── SITE PREPARATION ──────────────────────────────────────────────────
  // Site cleaning: full plot area
  addItem("siteCleaning", toSqm(plotArea), "sqm");

  // Anti-termite: full plot area (applied once pre-construction)
  addItem("antiTermite", toSqm(plotArea), "sqm");

  // ── EARTHWORK & PCC ───────────────────────────────────────────────────
  const excCum = toCum(plotArea * 3);
  addItem("excavation", excCum, "cum");

  const pccCum = toCum(plotArea * 0.5);
  addItem("pcc148", pccCum, "cum");

  // ── FOOTING ───────────────────────────────────────────────────────────
  const footKey =
    RATES.GRADE_KEY === "premium" ? "rccM25Footing" : "rccM20Footing";
  const footCum = toCum(plotArea * 1.5);
  addItem(footKey, footCum, "cum");

  // ── SUB-STRUCTURE ─────────────────────────────────────────────────────
  // DPC: full plot footprint
  addItem("dpcConcrete", toSqm(plotArea), "sqm");

  // Sand filling in plinth: ~300 mm average depth
  addItem("sandFilling", toCum(plotArea * 1.0), "cum");

  // ── SEPTIC TANK ───────────────────────────────────────────────────────
  // ~1.5 cum capacity for a 2-3 BHK residential building
  addItem("septicTank", 1.5, "cum");

  // ── PRELIMINARIES ─────────────────────────────────────────────────────
  // Mobilization: lump sum once per project
  addItem("mobilization", 1, "lump sum");
  // Temporary godown for cement storage
  addItem("tempGodown", 1, "lump sum");
  // Borewell: ~100 rft depth (standard residential boring)
  addItem("borewell", 100, "rft");

  // ── GATE & ELEVATION ──────────────────────────────────────────────────
  // Main gate: ~250 kg (heavy MS double-leaf gate)
  addItem("mainGate", 250, "kg");
  // Front elevation design: lump sum (premium/aesthetic item)
  addItem("elevationDesign", 1, "lump sum");

  return { items, matQty };
}

// ───────────────────────────────────────────────────────────────────────────
// CORE: build per-floor BOQ items
// ───────────────────────────────────────────────────────────────────────────
function buildFloorItems(floorArea, plotArea, RATES, floorIndex, isTopFloor) {
  const esc = getEscalation(RATES, floorIndex);
  const items = [];
  const matQty = {
    cement: 0,
    steel: 0,
    sand: 0,
    aggregate: 0,
    bricks: 0,
    tiles: 0,
    paint: 0,
  };

  const addItem = (key, qty) => {
    const ir = RATES.ITEM_RATES[key];
    if (!ir || qty <= 0) return;
    const rate = Math.round(ir.rate * esc);
    const amt = Math.round(qty * rate);
    items.push({
      description: ir.description,
      unit: ir.unit,
      quantity: r2(qty),
      rate,
      amount: amt,
      labourDays: r2((ir.labourDaysPerUnit ?? 0) * qty),
    });
    if (ir.cementBagsPerUnit) matQty.cement += ir.cementBagsPerUnit * qty;
    if (ir.steelKgPerUnit) matQty.steel += ir.steelKgPerUnit * qty;
    if (ir.sandCftPerUnit) matQty.sand += ir.sandCftPerUnit * qty;
    if (ir.aggCftPerUnit) matQty.aggregate += ir.aggCftPerUnit * qty;
    if (ir.bricksPerUnit) matQty.bricks += ir.bricksPerUnit * qty;
    if (ir.tilesPerUnit) matQty.tiles += ir.tilesPerUnit * qty;
    if (ir.paintLitresPerUnit) matQty.paint += ir.paintLitresPerUnit * qty;
  };

  const isPremium = RATES.GRADE_KEY === "premium";

  // ── STRUCTURAL RCC ────────────────────────────────────────────────────
  const colKey = isPremium ? "rccM25Column" : "rccM20Column";
  const beamKey = isPremium ? "rccM25Beam" : "rccM20Beam";
  const slabKey = isPremium ? "rccM25Slab" : "rccM20Slab";

  addItem(colKey, toCum(floorArea * 0.04));
  addItem(beamKey, toCum(floorArea * 0.055));
  addItem(slabKey, toCum(floorArea * (isPremium ? 0.44 : 0.42)));

  // ── MASONRY ───────────────────────────────────────────────────────────
  addItem("brickwork230", toCum(floorArea * 3.5 * 0.75 * 0.6));
  addItem("brickwork115", toCum(floorArea * 3.5 * 0.75 * 0.4));

  // ── PLASTERING ────────────────────────────────────────────────────────
  const plasterSqm = toSqm(floorArea * 3.5 * 2);
  addItem("plasterInternal", plasterSqm);
  if (floorIndex === 0) {
    addItem("plasterExternal", toSqm(floorArea * 0.6));
  }

  // ── FLOORING & DADO ───────────────────────────────────────────────────
  const floorSqm = toSqm(floorArea);
  addItem(isPremium ? "flooringVitrified" : "flooringCeramic", floorSqm);
  addItem(
    isPremium ? "dadoLargeFormat" : "dadoCeramic",
    toSqm(floorArea * 0.12 * 2.5),
  );

  // ── SKIRTING ─────────────────────────────────────────────────────────
  // Perimeter of floor × 1 rmt per linear metre (100 mm height)
  const perimeterRmt = r2(Math.sqrt(floorArea) * 4 * 0.0254 * 100); // approx from sqft → rmt
  // Simpler: assume ~0.35 rmt per sqft of floor area
  addItem("skirting", r2(floorArea * 0.35));

  // ── WALL PUTTY ───────────────────────────────────────────────────────
  // Applied to all internal plastered surfaces before painting
  addItem("wallPutty", plasterSqm);

  // ── PAINTING ──────────────────────────────────────────────────────────
  addItem("paintInternal", plasterSqm);
  if (floorIndex === 0) {
    addItem("paintExternal", toSqm(floorArea * 0.6));
  }

  // ── DOORS & WINDOWS ───────────────────────────────────────────────────
  const numDoors = Math.max(2, Math.round(floorArea / 250));
  const numWindows = Math.max(2, Math.round(floorArea / 120));

  if (floorIndex === 0) {
    addItem("doorMain", 1);
    addItem(isPremium ? "windowUPVC" : "windowAluminium", numWindows);
    addItem("doorFlush", numDoors - 1);
  } else {
    addItem("doorFlush", numDoors);
    addItem(isPremium ? "windowUPVC" : "windowAluminium", numWindows);
  }

  addItem(isPremium ? "grillDecorative" : "grillMS", toSqm(numWindows * 1.0));

  // ── ELECTRICAL & PLUMBING ─────────────────────────────────────────────
  addItem("electrical", floorArea);
  addItem("plumbing", floorArea);
  addItem("wpWetArea", toSqm(floorArea * 0.12));

  // ── KITCHEN ───────────────────────────────────────────────────────────
  // Granite platform: ~2 sqm per floor (one kitchen per floor)
  addItem("granitePlatform", toSqm(floorArea * 0.02));
  // Kitchen sink: 1 per floor
  addItem("kitchenSink", 1);

  // ── STAIR & RAILING ───────────────────────────────────────────────────
  addItem("stairRailing", 4.5);

  // ── FALSE CEILING (ground floor only, or all floors for premium) ──────
  if (isPremium || floorIndex === 0) {
    // False ceiling for living + dining area (~40% of floor area)
    addItem("falseCeiling", floorArea * 0.4);
  }

  // ── TERRACE / TOP FLOOR ───────────────────────────────────────────────
  if (isTopFloor) {
    addItem("wpTerrace", toSqm(plotArea));
    // Headroom / staircase cover on roof
    addItem("headroomRoof", toSqm(plotArea * 0.08));
    // Parapet wall: full perimeter of plot (~4 × √plotArea rmt, 3ft high)
    addItem("parapetWall", r2(Math.sqrt(plotArea) * 4 * 0.3048));
  }

  // ── RCC LOFT / CHAJJA ─────────────────────────────────────────────────
  // Over all external door/window openings (~0.15 rmt loft per sqft floor area)
  addItem("rccLoft", r2(floorArea * 0.15));

  return { items, matQty };
}

// ───────────────────────────────────────────────────────────────────────────
// HELPERS
// ───────────────────────────────────────────────────────────────────────────
function mergeMatQty(a, b) {
  const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])];
  const out = {};
  keys.forEach((k) => {
    out[k] = (a[k] ?? 0) + (b[k] ?? 0);
  });
  return out;
}

function summarise(items, GST_RATE) {
  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const gst = Math.round(subtotal * GST_RATE);
  return {
    subtotal,
    gst,
    grandTotal: subtotal + gst,
    totalItems: items.length,
  };
}

function totalLabourDays(items) {
  return r2(items.reduce((s, i) => s + (i.labourDays ?? 0), 0));
}

function notes(RATES) {
  const base = [
    `Rates: WB PWD SOR 2023-24 — ${RATES.GRADE_LABEL} specification.`,
    "GST @ 18% on construction services (GST Act).",
    "Quantities computed from standard thumb rules for RCC framed structure.",
    "Floor cost escalation applied: +3–3.5% per floor above ground.",
    "Rates subject to ±5% variation for site access and market fluctuation.",
  ];
  if (RATES.GRADE_KEY === "premium") {
    base.push(
      "Concrete: M25 (OPC 53, UltraTech/Ambuja). Steel: Fe 500D (SAIL/TATA/JSW).",
      "Tiles: Vitrified 600×600 (Kajaria). Paint: Asian Royale / Dulux Velvet Touch.",
      "Windows: UPVC double-sliding, 5 mm toughened. Plumbing: CPVC + Jaquar fittings.",
    );
  } else {
    base.push(
      "Concrete: M20 (OPC 43, Ambuja/ACC). Steel: Fe 415 TMT.",
      "Tiles: Ceramic 300×300. Paint: Nerolac Impressions / Apex WeatherCoat.",
      "Windows: Aluminium sliding, 4 mm plain glass. Plumbing: GI/CPVC + Cera fittings.",
    );
  }
  return base;
}

// ───────────────────────────────────────────────────────────────────────────
// PUBLIC: calcStandardBOQ
// ───────────────────────────────────────────────────────────────────────────
export function calcStandardBOQ(inputs) {
  const { length, breadth, floors, includeBasement } = inputs;
  const plotArea = length * breadth;
  const totalFloors = floors + (includeBasement ? 1 : 0);

  const allItems = [];
  let totalMat = {
    cement: 0,
    steel: 0,
    sand: 0,
    aggregate: 0,
    bricks: 0,
    tiles: 0,
    paint: 0,
  };

  const { items: fItems, matQty: fMat } = buildFoundation(plotArea, STD);
  allItems.push(...fItems);
  totalMat = mergeMatQty(totalMat, fMat);

  for (let i = 0; i < totalFloors; i++) {
    const { items, matQty } = buildFloorItems(
      plotArea,
      plotArea,
      STD,
      i,
      i === totalFloors - 1,
    );
    allItems.push(...items);
    totalMat = mergeMatQty(totalMat, matQty);
  }

  allItems.forEach((item, idx) => {
    item.srNo = idx + 1;
  });

  return {
    grade: STD.GRADE_KEY,
    gradeLabel: STD.GRADE_LABEL,
    items: allItems,
    summary: summarise(allItems, STD.GST_RATE),
    materialQty: {
      ...Object.fromEntries(
        Object.entries(totalMat).map(([k, v]) => [k, r2(v)]),
      ),
    },
    totalLabour: totalLabourDays(allItems),
    notes: notes(STD),
  };
}

// ───────────────────────────────────────────────────────────────────────────
// PUBLIC: calcPremiumBOQ
// ───────────────────────────────────────────────────────────────────────────
export function calcPremiumBOQ(inputs) {
  const { length, breadth, floors, includeBasement } = inputs;
  const plotArea = length * breadth;
  const totalFloors = floors + (includeBasement ? 1 : 0);

  const allItems = [];
  let totalMat = {
    cement: 0,
    steel: 0,
    sand: 0,
    aggregate: 0,
    bricks: 0,
    tiles: 0,
    paint: 0,
  };

  const { items: fItems, matQty: fMat } = buildFoundation(plotArea, PRE);
  allItems.push(...fItems);
  totalMat = mergeMatQty(totalMat, fMat);

  for (let i = 0; i < totalFloors; i++) {
    const { items, matQty } = buildFloorItems(
      plotArea,
      plotArea,
      PRE,
      i,
      i === totalFloors - 1,
    );
    allItems.push(...items);
    totalMat = mergeMatQty(totalMat, matQty);
  }

  allItems.forEach((item, idx) => {
    item.srNo = idx + 1;
  });

  return {
    grade: PRE.GRADE_KEY,
    gradeLabel: PRE.GRADE_LABEL,
    items: allItems,
    summary: summarise(allItems, PRE.GST_RATE),
    materialQty: {
      ...Object.fromEntries(
        Object.entries(totalMat).map(([k, v]) => [k, r2(v)]),
      ),
    },
    totalLabour: totalLabourDays(allItems),
    notes: notes(PRE),
  };
}

// ───────────────────────────────────────────────────────────────────────────
// PUBLIC: calcFloorWiseBOQ
// ───────────────────────────────────────────────────────────────────────────
export function calcFloorWiseBOQ(inputs) {
  const {
    length,
    breadth,
    floors,
    includeBasement,
    finishGrade = "standard",
  } = inputs;
  const RATES = finishGrade === "premium" ? PRE : STD;
  const plotArea = length * breadth;
  const totalFloors = floors + (includeBasement ? 1 : 0);

  const sheets = [];

  const { items: fItems, matQty: fMat } = buildFoundation(plotArea, RATES);
  fItems.forEach((item, idx) => {
    item.srNo = idx + 1;
  });
  sheets.push({
    floorLabel: floorName(-1),
    floorIndex: -1,
    items: fItems,
    summary: summarise(fItems, RATES.GST_RATE),
    materialQty: {
      ...Object.fromEntries(Object.entries(fMat).map(([k, v]) => [k, r2(v)])),
    },
    totalLabour: totalLabourDays(fItems),
  });

  for (let i = 0; i < totalFloors; i++) {
    const { items, matQty } = buildFloorItems(
      plotArea,
      plotArea,
      RATES,
      i,
      i === totalFloors - 1,
    );
    items.forEach((item, idx) => {
      item.srNo = idx + 1;
    });
    sheets.push({
      floorLabel: floorName(i),
      floorIndex: i,
      items,
      summary: summarise(items, RATES.GST_RATE),
      materialQty: {
        ...Object.fromEntries(
          Object.entries(matQty).map(([k, v]) => [k, r2(v)]),
        ),
      },
      totalLabour: totalLabourDays(items),
    });
  }

  const grandSubtotal = sheets.reduce((s, sh) => s + sh.summary.subtotal, 0);
  const grandGst = Math.round(grandSubtotal * RATES.GST_RATE);

  return {
    grade: RATES.GRADE_KEY,
    gradeLabel: RATES.GRADE_LABEL,
    sheets,
    grandSummary: {
      subtotal: grandSubtotal,
      gst: grandGst,
      grandTotal: grandSubtotal + grandGst,
    },
    notes: notes(RATES),
  };
}
