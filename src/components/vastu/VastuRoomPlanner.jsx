import { useState, Fragment } from "react";

// ─── Vastu Room Planner Data ───────────────────────────────────────────────
const VASTU_ROOM_DATA = {
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

const ZONE_GRID = [
  ["northwest", "north", "northeast"],
  ["west", "center", "east"],
  ["southwest", "south", "southeast"],
];

const ZONE_LABELS = {
  northwest: "NW",
  north: "N",
  northeast: "NE",
  west: "W",
  center: "C",
  east: "E",
  southwest: "SW",
  south: "S",
  southeast: "SE",
};

const FACING_DATA = {
  north: {
    icon: "⬆️",
    benefit: "Wealth & prosperity — ruled by Kubera (God of wealth)",
  },
  northeast: {
    icon: "↗️",
    benefit: "Wisdom & spirituality — most auspicious corner (Ishanya)",
  },
  east: {
    icon: "➡️",
    benefit: "Health & new beginnings — ruled by Indra, sunlight entry",
  },
  southeast: {
    icon: "↘️",
    benefit: "Energy & vitality — ruled by Agni (Fire God)",
  },
  south: { icon: "⬇️", benefit: "Fame & stability — ruled by Yama" },
  southwest: {
    icon: "↙️",
    benefit: "Strength & relationships — ruled by Nirrti",
  },
  west: { icon: "⬅️", benefit: "Gains & success — ruled by Varuna" },
  northwest: {
    icon: "↖️",
    benefit: "Change & travel — ruled by Vayu (Wind God)",
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

  function toggleRoom(name) {
    setInputs((p) => ({
      ...p,
      rooms: p.rooms.includes(name)
        ? p.rooms.filter((r) => r !== name)
        : [...p.rooms, name],
    }));
  }

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

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <div className="planner-form">
          {/* Dimensions */}
          <div className="planner-card">
            <h3 className="planner-card-title">🏗️ Plot Dimensions</h3>
            <div className="planner-grid-3">
              <div className="planner-field">
                <label>Length (feet)</label>
                <input
                  type="number"
                  min="10"
                  placeholder="e.g. 60"
                  value={inputs.length}
                  onChange={(e) =>
                    setInputs((p) => ({ ...p, length: e.target.value }))
                  }
                />
              </div>
              <div className="planner-field">
                <label>Width (feet)</label>
                <input
                  type="number"
                  min="10"
                  placeholder="e.g. 40"
                  value={inputs.width}
                  onChange={(e) =>
                    setInputs((p) => ({ ...p, width: e.target.value }))
                  }
                />
              </div>
              <div className="planner-field">
                <label>Number of Floors</label>
                <select
                  value={inputs.floors}
                  onChange={(e) =>
                    setInputs((p) => ({ ...p, floors: e.target.value }))
                  }
                >
                  <option value="1">Ground Floor (G)</option>
                  <option value="2">G + 1</option>
                  <option value="3">G + 2</option>
                  <option value="4">G + 3</option>
                </select>
              </div>
            </div>
            <div className="planner-field" style={{ marginTop: "1rem" }}>
              <label>Plot Shape</label>
              <select
                value={inputs.plotShape}
                onChange={(e) =>
                  setInputs((p) => ({ ...p, plotShape: e.target.value }))
                }
              >
                <option value="rectangle">
                  Rectangle / Square (Most Auspicious)
                </option>
                <option value="north-ext">
                  Rectangle with North Extension
                </option>
                <option value="east-ext">Rectangle with East Extension</option>
                <option value="irregular">Irregular (Needs Remedies)</option>
              </select>
            </div>

            {inputs.length && inputs.width && (
              <div className="planner-area-badge">
                📐 Plot Area:{" "}
                <strong>
                  {(inputs.length * inputs.width).toLocaleString()} sq.ft
                </strong>
                &nbsp;·&nbsp;Ratio {inputs.length}:{inputs.width}
                {Math.min(
                  inputs.length / inputs.width,
                  inputs.width / inputs.length,
                ) >= 0.6 ? (
                  <span className="planner-badge-ok"> ✓ Vastu-compliant</span>
                ) : (
                  <span className="planner-badge-warn"> ⚠ Irregular ratio</span>
                )}
              </div>
            )}
          </div>

          {/* Facing Direction */}
          <div className="planner-card">
            <h3 className="planner-card-title">
              🧭 Main Door Facing Direction
            </h3>
            <div className="planner-facing-grid">
              {Object.entries(FACING_DATA).map(([dir, data]) => (
                <button
                  key={dir}
                  className={`planner-facing-btn ${inputs.facing === dir ? "active" : ""}`}
                  onClick={() => setInputs((p) => ({ ...p, facing: dir }))}
                >
                  <span className="planner-facing-icon">{data.icon}</span>
                  <span>
                    {dir.charAt(0).toUpperCase() +
                      dir.slice(1).replace("-", " ")}
                  </span>
                </button>
              ))}
            </div>
            {inputs.facing && (
              <div className="planner-facing-desc">
                {FACING_DATA[inputs.facing].icon}{" "}
                {FACING_DATA[inputs.facing].benefit}
              </div>
            )}
          </div>

          {/* Room Selection */}
          <div className="planner-card">
            <h3 className="planner-card-title">🏠 Select Rooms to Include</h3>
            <div className="planner-rooms-grid">
              {allRooms.map((name) => {
                const selected = inputs.rooms.includes(name);
                const rd = VASTU_ROOM_DATA[name];
                return (
                  <button
                    key={name}
                    className={`planner-room-btn ${selected ? "active" : ""}`}
                    onClick={() => toggleRoom(name)}
                  >
                    <span>{rd.emoji}</span>
                    <span>{name}</span>
                  </button>
                );
              })}
            </div>
            <p className="planner-rooms-note">
              {inputs.rooms.length} rooms selected · max 9 rooms shown in
              single-floor plan
            </p>
          </div>

          <div className="planner-actions">
            <button
              className="btn btn-primary"
              disabled={!inputs.length || !inputs.width}
              onClick={handleGenerate}
            >
              Generate Vastu Layout →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2 ── */}
      {step === 2 && layout && (
        <div className="planner-result">
          {/* Summary bar */}
          <div className="planner-summary-bar">
            <div className="planner-summary-item">
              <span className="planner-summary-label">Plot Size</span>
              <span className="planner-summary-val">
                {inputs.length} × {inputs.width} ft
              </span>
            </div>
            <div className="planner-summary-divider" />
            <div className="planner-summary-item">
              <span className="planner-summary-label">Facing</span>
              <span className="planner-summary-val">
                {FACING_DATA[inputs.facing].icon}{" "}
                {inputs.facing.charAt(0).toUpperCase() + inputs.facing.slice(1)}
              </span>
            </div>
            <div className="planner-summary-divider" />
            <div className="planner-summary-item">
              <span className="planner-summary-label">Floors</span>
              <span className="planner-summary-val">
                {inputs.floors === "1"
                  ? "G"
                  : `G + ${parseInt(inputs.floors) - 1}`}
              </span>
            </div>
            <div className="planner-summary-divider" />
            <div className="planner-summary-item">
              <span className="planner-summary-label">Vastu Score</span>
              <span className="planner-summary-val planner-score-val">
                {(() => {
                  const vals = Object.values(layout.placed);
                  return Math.round(
                    (vals.filter((p) => p.isIdeal).length / vals.length) * 100,
                  );
                })()}
                %
              </span>
            </div>
          </div>

          <div className="planner-result-layout">
            {/* Floor Plan Grid */}
            <div className="planner-floorplan-wrap">
              <p className="planner-compass-top">⬆ NORTH</p>
              <div className="planner-floor-grid">
                {ZONE_GRID.map((row, ri) => (
                  <Fragment key={ri}>
                    {row.map((zone, ci) => {
                      const roomName = layout.grid[ri][ci];
                      const rd = roomName ? VASTU_ROOM_DATA[roomName] : null;
                      const info = roomName ? layout.placed[roomName] : null;
                      const isHovered = hoveredRoom === roomName && !!roomName;

                      return (
                        <div
                          key={`${ri}-${ci}`}
                          className={`planner-zone-cell ${!roomName ? "planner-zone-empty" : ""} ${isHovered ? "planner-zone-hovered" : ""}`}
                          style={
                            rd
                              ? {
                                  background: `${rd.color}18`,
                                  borderColor: isHovered
                                    ? rd.color
                                    : `${rd.color}35`,
                                }
                              : {}
                          }
                          onMouseEnter={() => setHoveredRoom(roomName)}
                          onMouseLeave={() => setHoveredRoom(null)}
                        >
                          <span className="planner-zone-label">
                            {ZONE_LABELS[zone]}
                          </span>
                          {roomName ? (
                            <>
                              <span className="planner-zone-emoji">
                                {rd.emoji}
                              </span>
                              <span className="planner-zone-name">
                                {roomName}
                              </span>
                              <span className="planner-zone-badge">
                                {info.isIdeal ? "✅" : "⚠️"}
                              </span>
                            </>
                          ) : (
                            <span className="planner-zone-empty-label">
                              {ZONE_LABELS[zone]}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </Fragment>
                ))}
              </div>
              <div className="planner-compass-bottom">
                <span>⬅ WEST</span>
                <span>⬇ SOUTH</span>
                <span>EAST ➡</span>
              </div>
              <div className="planner-legend">
                <span>✅ Ideal placement</span>
                <span>⚠️ Acceptable placement</span>
              </div>
            </div>

            {/* Analysis Panel */}
            <div className="planner-analysis">
              <h4 className="planner-analysis-title">Room-by-Room Analysis</h4>
              <div className="planner-analysis-list">
                {Object.entries(layout.placed).map(([roomName, info]) => {
                  const rd = VASTU_ROOM_DATA[roomName];
                  return (
                    <div
                      key={roomName}
                      className={`planner-analysis-card ${info.isIdeal ? "ideal" : "warn"}`}
                      onMouseEnter={() => setHoveredRoom(roomName)}
                      onMouseLeave={() => setHoveredRoom(null)}
                    >
                      <div className="planner-analysis-header">
                        <span className="planner-analysis-emoji">
                          {rd.emoji}
                        </span>
                        <div className="planner-analysis-info">
                          <span className="planner-analysis-name">
                            {roomName}
                          </span>
                          <span className="planner-analysis-zone">
                            {info.zone.charAt(0).toUpperCase() +
                              info.zone.slice(1)}{" "}
                            zone
                          </span>
                        </div>
                        <span
                          className={`planner-badge ${info.isIdeal ? "planner-badge-ideal" : "planner-badge-adjust"}`}
                        >
                          {info.isIdeal ? "✓ Ideal" : "△ Adjust"}
                        </span>
                      </div>
                      {!info.isIdeal && (
                        <p className="planner-analysis-tip">
                          Ideal zones: {rd.zones.join(", ")} — apply Vastu
                          remedy if relocation not possible
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Vastu Tips */}
          <div className="planner-card planner-tips-section">
            <h3 className="planner-card-title">
              💡 Vastu Recommendations for Your Layout
            </h3>
            <div className="planner-tips-grid">
              {[
                {
                  icon: "🪔",
                  tip: "Pooja room: use white, cream, or light yellow walls. Always face east while praying. Keep it clutter-free.",
                },
                {
                  icon: "🍳",
                  tip: "Kitchen in southeast. Cook facing east. Never place kitchen directly below or above the pooja room.",
                },
                {
                  icon: "🛏️",
                  tip: "Master bedroom owner should sleep with head pointing south or west for restful, energised sleep.",
                },
                {
                  icon: "🚪",
                  tip: `${inputs.facing.charAt(0).toUpperCase() + inputs.facing.slice(1)}-facing entrance: keep it well-lit, attractive and unobstructed at all times.`,
                },
                {
                  icon: "🚿",
                  tip: "Toilets must never be in the northeast corner. Use camphor or sea salt as a Vastu remedy if unavoidable.",
                },
                {
                  icon: "🌿",
                  tip: "Plant Tulsi in the northeast. Avoid thorny plants (except roses) inside the home.",
                },
                {
                  icon: "🪟",
                  tip: "Windows on north and east walls maximise positive morning sunlight and fresh energy flow.",
                },
                {
                  icon: "⚖️",
                  tip: "Keep the Brahmasthan (centre of home) open and clutter-free — no toilets or heavy pillars here.",
                },
              ].map((item, i) => (
                <div key={i} className="planner-tip-item">
                  <span className="planner-tip-icon">{item.icon}</span>
                  <span>{item.tip}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="planner-actions">
            <button className="btn btn-secondary" onClick={() => setStep(1)}>
              ← Edit Inputs
            </button>
            <button className="btn btn-primary" onClick={() => window.print()}>
              🖨️ Print Layout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
