// ═══════════════════════════════════════════════════════════════════════════
// src/utils/planGenerator/planGeneratorLogic.js — v5
// Per-floor room selection. Each floor has its own independent room list.
// ═══════════════════════════════════════════════════════════════════════════

export const ROOM_CATALOGUE = [
  { id: "master_bed", label: "Master Bedroom",   cat: "bedroom" },
  { id: "bed2",       label: "Bedroom 2",        cat: "bedroom" },
  { id: "bed3",       label: "Bedroom 3",        cat: "bedroom" },
  { id: "bed4",       label: "Bedroom 4",        cat: "bedroom" },
  { id: "hall",       label: "Living / Hall",    cat: "living"  },
  { id: "dining",     label: "Dining Room",      cat: "living"  },
  { id: "kitchen",    label: "Kitchen",          cat: "utility" },
  { id: "wc",         label: "Toilet / Bath",    cat: "utility" },
  { id: "wc2",        label: "Toilet 2",         cat: "utility" },
  { id: "pooja",      label: "Pooja Room",       cat: "extra"   },
  { id: "study",      label: "Study Room",       cat: "extra"   },
  { id: "store",      label: "Store / Utility",  cat: "extra"   },
  { id: "garage",     label: "Garage / Parking", cat: "extra"   },
];

// Default rooms per floor index
export const DEFAULT_FLOOR_ROOMS = [
  ["hall", "dining", "kitchen", "wc", "garage"],          // G-Floor
  ["master_bed", "bed2", "bed3", "wc", "wc2", "study"],   // 1st Floor
  ["master_bed", "bed2", "wc", "study"],                  // 2nd Floor
  ["master_bed", "bed2", "wc", "store"],                  // 3rd Floor
];

export const ROOM_CATEGORIES = [
  { id: "bedroom", label: "🛏 Bedrooms"      },
  { id: "living",  label: "🛋 Living Spaces" },
  { id: "utility", label: "🍳 Utility"       },
  { id: "extra",   label: "✨ Extra Rooms"   },
];

export const FACE_OPTIONS = [
  { value: "bottom", label: "South Face", symbol: "↓", desc: "Main door faces South" },
  { value: "top",    label: "North Face", symbol: "↑", desc: "Main door faces North" },
  { value: "left",   label: "East Face",  symbol: "←", desc: "Main door faces East"  },
  { value: "right",  label: "West Face",  symbol: "→", desc: "Main door faces West"  },
];

export const FLOOR_OPTIONS = [
  { value: 1, label: "Ground Only", short: "G"   },
  { value: 2, label: "G + 1",       short: "G+1" },
  { value: 3, label: "G + 2",       short: "G+2" },
  { value: 4, label: "G + 3",       short: "G+3" },
];

export const FLOOR_TITLES = ["G-Floor", "1st Floor", "2nd Floor", "3rd Floor"];

const ROOM_COLORS = {
  master_bed: { fill: "#DBEAFE", stroke: "#2563EB" },
  bed2:       { fill: "#DCFCE7", stroke: "#16A34A" },
  bed3:       { fill: "#FEF9C3", stroke: "#CA8A04" },
  bed4:       { fill: "#FCE7F3", stroke: "#DB2777" },
  hall:       { fill: "#EDE9FE", stroke: "#7C3AED" },
  dining:     { fill: "#F3E8FF", stroke: "#9333EA" },
  kitchen:    { fill: "#FFEDD5", stroke: "#EA580C" },
  wc:         { fill: "#E0F2FE", stroke: "#0284C7" },
  wc2:        { fill: "#CFFAFE", stroke: "#0891B2" },
  pooja:      { fill: "#FEF2F2", stroke: "#DC2626" },
  study:      { fill: "#F0FDF4", stroke: "#15803D" },
  store:      { fill: "#F1F5F9", stroke: "#64748B" },
  garage:     { fill: "#FFF7ED", stroke: "#C2410C" },
  staircase:  { fill: "#FEF3C7", stroke: "#D97706" },
  landing:    { fill: "#FEF3C7", stroke: "#D97706" },
};

function clr(id) {
  return ROOM_COLORS[id] || { fill: "#F1F5F9", stroke: "#94A3B8" };
}

// ─── Layout engine ────────────────────────────────────────────────────────────
// Layout strategy per floor:
//   LEFT ZONE  → Bedrooms stacked vertically (proportional height)
//   RIGHT ZONE → Living + Utility stacked vertically (living gets more height)
//   BOTTOM BAND → Extra rooms spread horizontally
//   STAIR COLUMN → Far right, reserved for multi-floor only
//   All zones fill 100% of inner plot — no dead space

function layoutFloor({ plotL, plotB, wallThickness, roomIds, floorIndex, totalFloors }) {
  const wt     = wallThickness;
  const iL     = plotL - 2 * wt;
  const iB     = plotB - 2 * wt;
  const hasMulti = totalFloors > 1;
  const r      = (n) => Math.round(n * 100) / 100;
  const rooms  = [];

  const catMap = ROOM_CATALOGUE.reduce((m, rc) => { m[rc.id] = rc; return m; }, {});

  function push(id, label, x, y, w, h) {
    const c = clr(id);
    rooms.push({
      id: `${id}_f${floorIndex}`,
      baseId: id,
      label,
      x: wt + x, y: wt + y,
      w: Math.max(r(w), 0.5),
      h: Math.max(r(h), 0.5),
      fill: c.fill, stroke: c.stroke,
    });
  }

  // ── Staircase reservation ──
  const stairW = hasMulti ? r(Math.max(iL * 0.14, 5))  : 0;
  const stairH = hasMulti ? r(Math.max(iB * 0.22, 7))  : 0;
  const effL   = hasMulti ? r(iL - stairW - wt)         : iL;

  // ── Classify rooms ──
  const beds    = roomIds.filter(id => catMap[id]?.cat === "bedroom");
  const living  = roomIds.filter(id => catMap[id]?.cat === "living");
  const utility = roomIds.filter(id => catMap[id]?.cat === "utility");
  const extra   = roomIds.filter(id => catMap[id]?.cat === "extra");

  const hasExtra   = extra.length > 0;
  const extraBandH = hasExtra ? r(iB * 0.20) : 0;
  const mainH      = r(iB - extraBandH - (hasExtra ? wt : 0));

  // ── LEFT ZONE widths ──
  const leftFrac = beds.length >= 3 ? 0.42 : beds.length >= 2 ? 0.36 : beds.length === 1 ? 0.32 : 0;
  const leftW    = beds.length > 0 ? r(effL * leftFrac)                : 0;
  const rightW   = beds.length > 0 ? r(effL - leftW - wt)              : effL;

  // ── Bedrooms (left, stacked) ──
  if (beds.length > 0) {
    const bH = r((mainH - (beds.length - 1) * wt) / beds.length);
    beds.forEach((id, i) => {
      push(id, catMap[id]?.label || id, 0, i * (bH + wt), leftW, bH);
    });
  }

  // ── Living + Utility (right, stacked) ──
  const rightRooms = [...living, ...utility];
  if (rightRooms.length > 0) {
    const xOff       = beds.length > 0 ? leftW + wt : 0;
    const LW = 1.5, UW = 1.0; // height weights
    const totalW     = living.length * LW + utility.length * UW;
    const unitH      = r((mainH - (rightRooms.length - 1) * wt) / totalW);
    let yOff = 0;
    rightRooms.forEach(id => {
      const cat = catMap[id]?.cat;
      const h   = r(unitH * (cat === "living" ? LW : UW));
      push(id, catMap[id]?.label || id, xOff, yOff, rightW, h);
      yOff = r(yOff + h + wt);
    });
  }

  // ── Extra rooms (bottom band, spread horizontally) ──
  if (hasExtra) {
    const yBand  = r(mainH + wt);
    const eachW  = r((effL - (extra.length - 1) * wt) / extra.length);
    extra.forEach((id, i) => {
      push(id, catMap[id]?.label || id, i * (eachW + wt), yBand, eachW, extraBandH);
    });
  }

  // ── Staircase ──
  if (hasMulti) {
    push("staircase", "Staircase", effL + wt, 0, stairW, stairH);
    const remH = r(iB - stairH - wt);
    if (remH > 1.5) {
      const isGround = floorIndex === 0;
      push(isGround ? "store" : "landing",
           isGround ? "Store" : "Landing",
           effL + wt, stairH + wt, stairW, remH);
    }
  }

  return rooms;
}

// ─── Main export ─────────────────────────────────────────────────────────────
// floorRoomIds: string[][] — one array of room IDs per floor
export function generatePlan({ plotL, plotB, wallThickness = 0.75, floorRoomIds, floors = 1 }) {
  if (!plotL || !plotB) return { valid: false, error: "Please enter plot dimensions." };

  const floorPlans = [];
  for (let i = 0; i < floors; i++) {
    const roomIds = (floorRoomIds?.[i] && floorRoomIds[i].length > 0)
      ? floorRoomIds[i]
      : DEFAULT_FLOOR_ROOMS[i] || ["hall", "kitchen", "wc"];

    const rooms = layoutFloor({ plotL, plotB, wallThickness, roomIds, floorIndex: i, totalFloors: floors });
    floorPlans.push({ floorIndex: i, floorLabel: FLOOR_TITLES[i] || `Floor ${i}`, rooms });
  }

  return { valid: true, floorPlans, plotL, plotB, wallThickness, floors };
}