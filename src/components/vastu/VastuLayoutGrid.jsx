import React, { Fragment } from "react";
import { useUnit } from "../../context/UnitContext";
import { FACING_DATA } from "./VastuPlotForm";
import "./VastuLayoutGrid.css";

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

export function VastuLayoutGrid({
  inputs,
  layout,
  roomData,
  hoveredRoom,
  setHoveredRoom,
  onEditInputs,
}) {
  const { getLengthLabel } = useUnit();

  return (
    <div className="planner-result vastu-layout-container">
      {/* Summary bar */}
      <div className="planner-summary-bar">
        <div className="planner-summary-item">
          <span className="planner-summary-label">Plot Size</span>
          <span className="planner-summary-val">
            {inputs.length} × {inputs.width} {getLengthLabel()}
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
                  const rd = roomName ? roomData[roomName] : null;
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
              const rd = roomData[roomName];
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
        <button className="btn btn-secondary" onClick={onEditInputs}>
          ← Edit Inputs
        </button>
        <button className="btn btn-primary" onClick={() => window.print()}>
          🖨️ Print Layout
        </button>
      </div>
    </div>
  );
}
