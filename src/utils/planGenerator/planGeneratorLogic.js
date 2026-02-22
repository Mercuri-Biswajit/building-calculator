/* eslint-disable no-unused-vars */
// planGeneratorLogic.js — v11
// Room sizes are fully user-supplied. No default/auto sizing.

const VASTU_STRIP = {
  hall: "front",
  dining: "front",
  pooja: "front",
  study: "front",
  master_bed: "middle",
  bed2: "middle",
  bed3: "middle",
  bed4: "middle",
  kitchen: "rear",
  wc: "rear",
  wc2: "rear",
  store: "rear",
  garage: "rear",
};

export const ROOM_CATALOGUE = [
  { id: "master_bed", label: "Master Bedroom", cat: "bedroom" },
  { id: "bed2", label: "Bedroom 2", cat: "bedroom" },
  { id: "bed3", label: "Bedroom 3", cat: "bedroom" },
  { id: "bed4", label: "Bedroom 4", cat: "bedroom" },
  { id: "hall", label: "Living / Hall", cat: "living" },
  { id: "dining", label: "Dining Room", cat: "living" },
  { id: "kitchen", label: "Kitchen", cat: "utility" },
  { id: "wc", label: "Toilet / Bath", cat: "utility" },
  { id: "wc2", label: "Toilet 2", cat: "utility" },
  { id: "pooja", label: "Pooja Room", cat: "extra" },
  { id: "study", label: "Study Room", cat: "extra" },
  { id: "store", label: "Store / Utility", cat: "extra" },
  { id: "garage", label: "Garage / Parking", cat: "extra" },
];

export const ROOM_CATEGORIES = [
  { id: "bedroom", label: "Bedrooms" },
  { id: "living", label: "Living Spaces" },
  { id: "utility", label: "Utility" },
  { id: "extra", label: "Extra Rooms" },
];

export const FACE_OPTIONS = [
  { value: "bottom", label: "South", symbol: "↓", desc: "South facing" },
  { value: "top", label: "North", symbol: "↑", desc: "North facing" },
  { value: "left", label: "East", symbol: "←", desc: "East facing" },
  { value: "right", label: "West", symbol: "→", desc: "West facing" },
];

export const FLOOR_OPTIONS = [
  { value: 1, label: "Ground Only", short: "G" },
  { value: 2, label: "G + 1", short: "G+1" },
  { value: 3, label: "G + 2", short: "G+2" },
  { value: 4, label: "G + 3", short: "G+3" },
];

export const FLOOR_TITLES = ["G-Floor", "1st Floor", "2nd Floor", "3rd Floor"];

export const LAYOUT_VARIANTS = [
  {
    id: "standard",
    label: "Standard",
    desc: "Living front · Bedrooms middle · Service rear",
  },
  {
    id: "split",
    label: "Split",
    desc: "Bedrooms split left & right · Service center",
  },
  {
    id: "linear",
    label: "Linear",
    desc: "All rooms in a single depth row — open plan",
  },
];

const ROOM_COLORS = {
  master_bed: { fill: "#DBEAFE", stroke: "#2563EB" },
  bed2: { fill: "#DCFCE7", stroke: "#16A34A" },
  bed3: { fill: "#FEF9C3", stroke: "#CA8A04" },
  bed4: { fill: "#FCE7F3", stroke: "#DB2777" },
  hall: { fill: "#EDE9FE", stroke: "#7C3AED" },
  dining: { fill: "#F3E8FF", stroke: "#9333EA" },
  kitchen: { fill: "#FFEDD5", stroke: "#EA580C" },
  wc: { fill: "#E0F2FE", stroke: "#0284C7" },
  wc2: { fill: "#CFFAFE", stroke: "#0891B2" },
  pooja: { fill: "#FEF2F2", stroke: "#DC2626" },
  study: { fill: "#F0FDF4", stroke: "#15803D" },
  store: { fill: "#F1F5F9", stroke: "#64748B" },
  garage: { fill: "#FFF7ED", stroke: "#C2410C" },
  staircase: { fill: "#FEF3C7", stroke: "#D97706" },
  landing: { fill: "#FEF3C7", stroke: "#D97706" },
};

const CMAP = ROOM_CATALOGUE.reduce((m, r) => {
  m[r.id] = r;
  return m;
}, {});
const r2 = (n) => Math.round(n * 100) / 100;
const clr = (id) => ROOM_COLORS[id] || { fill: "#F1F5F9", stroke: "#94A3B8" };

// VASTU
const VASTU_RULES = {
  master_bed: {
    good: ["SW"],
    ok: ["S", "W", "NW"],
    bad: ["NE", "SE", "N", "E"],
  },
  bed2: { good: ["NW"], ok: ["S", "W"], bad: ["NE"] },
  bed3: { good: ["S", "W"], ok: ["NW", "SW"], bad: ["NE"] },
  bed4: { good: ["S", "W"], ok: ["NW"], bad: ["NE"] },
  hall: { good: ["N", "NE"], ok: ["E", "NW"], bad: ["SW", "S"] },
  dining: { good: ["W", "NW"], ok: ["E", "N"], bad: ["SE", "NE"] },
  kitchen: { good: ["SE"], ok: ["E", "NW"], bad: ["NE", "SW", "N", "S"] },
  wc: { good: ["NW", "W"], ok: ["S"], bad: ["NE", "SW", "SE", "E"] },
  wc2: { good: ["NW", "W"], ok: ["S"], bad: ["NE", "SW"] },
  pooja: { good: ["NE", "N"], ok: ["E"], bad: ["S", "SW", "W"] },
  study: { good: ["NE", "N", "E"], ok: ["NW"], bad: ["S", "SW"] },
  store: { good: ["NW", "W"], ok: ["SW"], bad: ["NE", "E"] },
  garage: { good: ["NW", "SE"], ok: ["N", "S"], bad: ["NE", "SW"] },
};
const FR = {
  bottom: {
    NW: "NW",
    N: "N",
    NE: "NE",
    E: "E",
    SE: "SE",
    S: "S",
    SW: "SW",
    W: "W",
  },
  top: {
    NW: "SE",
    N: "S",
    NE: "SW",
    E: "W",
    SE: "NW",
    S: "N",
    SW: "NE",
    W: "E",
  },
  left: {
    NW: "NE",
    N: "E",
    NE: "SE",
    E: "S",
    SE: "SW",
    S: "W",
    SW: "NW",
    W: "N",
  },
  right: {
    NW: "SW",
    N: "W",
    NE: "NW",
    E: "N",
    SE: "NE",
    S: "E",
    SW: "SE",
    W: "S",
  },
};

export function checkVastu(floorPlans, plotL, plotB, face) {
  const rot = FR[face] || FR.bottom;
  const results = [];
  floorPlans.forEach((fp) => {
    fp.rooms.forEach((room) => {
      const rule = VASTU_RULES[room.baseId];
      if (!rule) return;
      const cx = (room.x + room.w / 2) / plotL;
      const cy = (room.y + room.h / 2) / plotB;
      let raw;
      if (cx < 0.38 && cy < 0.38) raw = "NW";
      else if (cx > 0.62 && cy < 0.38) raw = "NE";
      else if (cx < 0.38 && cy > 0.62) raw = "SW";
      else if (cx > 0.62 && cy > 0.62) raw = "SE";
      else if (cy < 0.3) raw = "N";
      else if (cy > 0.7) raw = "S";
      else if (cx < 0.3) raw = "W";
      else if (cx > 0.7) raw = "E";
      else raw = "C";
      const zone = rot[raw] || raw;
      let status, message;
      if (rule.good.includes(zone)) {
        status = "good";
        message = `${room.label} in ${zone} — Vastu favorable ✓`;
      } else if (rule.bad.includes(zone)) {
        status = "bad";
        message = `${room.label} in ${zone} — Vastu unfavorable ✗`;
      } else {
        status = "ok";
        message = `${room.label} in ${zone} — Acceptable`;
      }
      results.push({
        roomId: room.id,
        baseId: room.baseId,
        floor: fp.floorLabel,
        zone,
        status,
        message,
      });
    });
  });
  return results;
}

// LAYOUT
function mkRoom(id, x, y, w, h, fi, doorWall = "right") {
  const c = clr(id),
    cat = CMAP[id];
  return {
    id: `${id}_f${fi}`,
    baseId: id,
    label: cat?.label || id,
    x: r2(x),
    y: r2(y),
    w: r2(Math.max(w, 0.5)),
    h: r2(Math.max(h, 0.5)),
    fill: c.fill,
    stroke: c.stroke,
    doorWall,
  };
}
function mkStair(baseId, x, y, w, h, fi) {
  const c = clr(baseId);
  return {
    id: `${baseId}_f${fi}`,
    baseId,
    label: baseId === "staircase" ? "Staircase" : "Landing",
    x: r2(x),
    y: r2(y),
    w: r2(Math.max(w, 0.5)),
    h: r2(Math.max(h, 0.5)),
    fill: c.fill,
    stroke: c.stroke,
    doorWall: "left",
  };
}

function layoutFloor({
  plotL,
  plotB,
  wt,
  roomIds,
  floorIndex,
  roomSizes,
  staircase,
  floorHeight,
}) {
  const rooms = [];

  // Staircase footprint: width=length, depth=tread*numSteps
  const numSteps =
    floorHeight > 0 && staircase.rise > 0
      ? Math.ceil(floorHeight / staircase.rise)
      : 10;
  const stairW = r2(Math.max(staircase.length || 4, 0.5));
  const stairDepth = r2(Math.max((staircase.tread || 0.83) * numSteps, 1));
  const stairH = r2(Math.min(stairDepth, plotB - 2 * wt));

  // Staircase sits in top-right corner
  const stairX = r2(plotL - wt - stairW);
  const stairY = wt;

  // Room zone: full height, width minus staircase column
  const rzX = wt;
  const rzY = wt;
  const rzW = r2(plotL - 2 * wt - stairW - wt);
  const rzH = r2(plotB - 2 * wt);

  // Vastu strips
  const front = roomIds.filter((id) => VASTU_STRIP[id] === "front");
  const middle = roomIds.filter((id) => CMAP[id]?.cat === "bedroom");
  const rear = roomIds.filter((id) => {
    const s = VASTU_STRIP[id];
    return (
      s === "rear" ||
      (!s && CMAP[id]?.cat !== "bedroom" && CMAP[id]?.cat !== "living")
    );
  });
  const active = [front, middle, rear].filter((s) => s.length > 0);

  let curY = rzY;
  active.forEach((strip, si) => {
    // Strip height = max room height in this strip (user-supplied)
    const sh = Math.max(...strip.map((id) => roomSizes[id]?.h || 1));
    let cx = rzX;
    const totalUserW =
      strip.reduce((a, id) => a + (roomSizes[id]?.w || 1), 0) +
      (strip.length - 1) * wt;
    const surplus = r2(Math.max(rzW - totalUserW, 0));
    strip.forEach((id, ri) => {
      // Last room absorbs any leftover width from plot
      const w =
        ri === strip.length - 1
          ? r2((roomSizes[id]?.w || 1) + surplus)
          : r2(roomSizes[id]?.w || 1);
      const doorWall =
        si === 0 ? "bottom" : si === active.length - 1 ? "top" : "right";
      rooms.push(mkRoom(id, cx, curY, w, sh, floorIndex, doorWall));
      cx = r2(cx + w + wt);
    });
    curY = r2(curY + sh + wt);
  });

  rooms.push(mkStair("staircase", stairX, stairY, stairW, stairH, floorIndex));
  if (floorIndex > 0) {
    const ly = r2(stairY + stairH + wt);
    const lh = r2(Math.min((staircase.tread || 0.83) * 3, plotB - wt - ly));
    if (lh >= 0.5)
      rooms.push(mkStair("landing", stairX, ly, stairW, lh, floorIndex));
  }

  return rooms;
}

// MAIN EXPORT
// floorRoomIds:   string[][]                    — selected rooms per floor
// floorRoomSizes: { [roomId]: {w,h} }[]         — user-supplied sizes per floor
// staircase:      { tread, rise, length }        — ft units
// floorHeight:    number                         — ft, used to compute num steps
export function generatePlan({
  plotL,
  plotB,
  wallThickness = 0.75,
  floorRoomIds,
  floorRoomSizes,
  floors = 1,
  variant = "standard",
  roadFacing = ["bottom"],
  staircase = { tread: 0.83, rise: 0.58, length: 4 },
  floorHeight = 10,
}) {
  if (!plotL || !plotB)
    return { valid: false, error: "Please enter plot dimensions." };
  const wt = wallThickness;
  const floorPlans = [];
  for (let i = 0; i < floors; i++) {
    const roomIds = floorRoomIds?.[i] || [];
    const roomSizes = floorRoomSizes?.[i] || {};
    const rooms = layoutFloor({
      plotL,
      plotB,
      wt,
      roomIds,
      floorIndex: i,
      roomSizes,
      staircase,
      floorHeight,
    });
    floorPlans.push({
      floorIndex: i,
      floorLabel: FLOOR_TITLES[i] || `Floor ${i}`,
      rooms,
    });
  }
  return {
    valid: true,
    floorPlans,
    plotL,
    plotB,
    wallThickness: wt,
    floors,
    variant,
    roadFacing,
    staircase,
    floorHeight,
  };
}
