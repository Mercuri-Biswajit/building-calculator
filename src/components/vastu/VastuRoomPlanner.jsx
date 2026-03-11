import React, { useState } from "react";
import { VastuPlotForm } from "./VastuPlotForm";
import { VastuLayoutGrid } from "./VastuLayoutGrid";

// ─── Vastu Room Planner Data ───────────────────────────────────────────────
export const VASTU_ROOM_DATA = {
  "Main Entrance": {
    zones: ["north", "northeast", "east"],
    color: "#F59E0B",
    emoji: "🚪",
    priority: 1,
  },
  "Living Room": {
    zones: ["north", "northeast", "east", "northwest"],
    color: "#3B82F6",
    emoji: "🛋️",
    priority: 2,
  },
  "Master Bedroom": {
    zones: ["southwest"],
    color: "#6D28D9",
    emoji: "🛏️",
    priority: 1,
  },
  "Bedroom 2": {
    zones: ["south", "west", "northwest"],
    color: "#7C3AED",
    emoji: "🛏️",
    priority: 2,
  },
  "Bedroom 3": {
    zones: ["south", "west"],
    color: "#9333EA",
    emoji: "🛏️",
    priority: 3,
  },
  Kitchen: { zones: ["southeast"], color: "#EF4444", emoji: "🍳", priority: 1 },
  "Pooja Room": {
    zones: ["northeast", "north", "east"],
    color: "#F97316",
    emoji: "🪔",
    priority: 1,
  },
  "Dining Room": {
    zones: ["west", "east"],
    color: "#10B981",
    emoji: "🍽️",
    priority: 2,
  },
  "Bathroom/Toilet": {
    zones: ["northwest", "west", "south"],
    color: "#06B6D4",
    emoji: "🚿",
    priority: 2,
  },
  "Study/Office": {
    zones: ["west", "southwest", "northeast"],
    color: "#6366F1",
    emoji: "📚",
    priority: 2,
  },
  "Store Room": {
    zones: ["northwest", "west", "south"],
    color: "#78716C",
    emoji: "📦",
    priority: 3,
  },
  Garage: {
    zones: ["northwest", "southeast", "west"],
    color: "#64748B",
    emoji: "🚗",
    priority: 3,
  },
  Staircase: {
    zones: ["south", "west", "southwest"],
    color: "#D97706",
    emoji: "🪜",
    priority: 2,
  },
  "Balcony/Terrace": {
    zones: ["north", "east", "northeast"],
    color: "#84CC16",
    emoji: "🌿",
    priority: 3,
  },
};

const DEFAULT_ROOMS = [
  "Main Entrance",
  "Living Room",
  "Master Bedroom",
  "Kitchen",
  "Pooja Room",
  "Dining Room",
  "Bathroom/Toilet",
  "Study/Office",
  "Bedroom 2",
];

const ZONE_GRID = [
  ["northwest", "north", "northeast"],
  ["west", "center", "east"],
  ["southwest", "south", "southeast"],
];

function generateLayout(selectedRooms) {
  const grid = Array(3)
    .fill(null)
    .map(() => Array(3).fill(null));
  const placed = {};

  const sorted = [...selectedRooms].sort(
    (a, b) => VASTU_ROOM_DATA[a].priority - VASTU_ROOM_DATA[b].priority,
  );

  for (const roomName of sorted) {
    const rd = VASTU_ROOM_DATA[roomName];
    let bestRow = -1,
      bestCol = -1,
      bestZone = null;

    for (const zoneName of rd.zones) {
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          if (ZONE_GRID[r][c] === zoneName && !grid[r][c]) {
            bestZone = zoneName;
            bestRow = r;
            bestCol = c;
            break;
          }
        }
        if (bestZone) break;
      }
      if (bestZone) break;
    }

    if (!bestZone) {
      let found = false;
      for (let r = 0; r < 3 && !found; r++) {
        for (let c = 0; c < 3 && !found; c++) {
          if (!grid[r][c]) {
            bestRow = r;
            bestCol = c;
            bestZone = ZONE_GRID[r][c];
            found = true;
          }
        }
      }
    }

    if (bestRow >= 0) {
      grid[bestRow][bestCol] = roomName;
      placed[roomName] = {
        zone: bestZone,
        isIdeal: rd.zones.includes(bestZone),
      };
    }
  }

  return { grid, placed };
}

// ─── VastuRoomPlanner Component ───────────────────────────────────────────
export default function VastuRoomPlanner() {
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState({
    length: "",
    width: "",
    facing: "north",
    plotShape: "rectangle",
    floors: "1",
    rooms: DEFAULT_ROOMS,
  });
  const [layout, setLayout] = useState(null);
  const [hoveredRoom, setHoveredRoom] = useState(null);

  const allRooms = Object.keys(VASTU_ROOM_DATA);

  function handleGenerate() {
    if (!inputs.length || !inputs.width) return;
    setLayout(generateLayout(inputs.rooms));
    setStep(2);
  }

  return (
    <div className="planner-wrap">
      <h2 className="vastu-content-title">Vastu Room Planner</h2>
      <p className="planner-subtitle">
        Enter your plot specifications to get a Vastu-compliant room layout
      </p>

      {/* Step Indicator */}
      <div className="planner-steps">
        <div className={`planner-step ${step >= 1 ? "active" : ""}`}>
          <span className="planner-step-num">1</span>
          <span>Plot Details</span>
        </div>
        <div className="planner-step-line" />
        <div className={`planner-step ${step >= 2 ? "active" : ""}`}>
          <span className="planner-step-num">2</span>
          <span>Vastu Layout</span>
        </div>
      </div>

      {step === 1 && (
        <VastuPlotForm 
          inputs={inputs} 
          setInputs={setInputs} 
          allRooms={allRooms}
          roomData={VASTU_ROOM_DATA} 
          onGenerate={handleGenerate} 
        />
      )}

      {step === 2 && layout && (
        <VastuLayoutGrid 
          inputs={inputs}
          layout={layout}
          roomData={VASTU_ROOM_DATA}
          hoveredRoom={hoveredRoom}
          setHoveredRoom={setHoveredRoom}
          onEditInputs={() => setStep(1)}
        />
      )}
    </div>
  );
}
