import React from "react";
import { useUnit } from "../../context/UnitContext";
import "./VastuPlotForm.css";

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

export function VastuPlotForm({ inputs, setInputs, allRooms, roomData, onGenerate }) {
  const { getLengthLabel, getAreaLabel, displayArea } = useUnit();

  function toggleRoom(name) {
    setInputs((p) => ({
      ...p,
      rooms: p.rooms.includes(name)
        ? p.rooms.filter((r) => r !== name)
        : [...p.rooms, name],
    }));
  }

  return (
    <div className="planner-form vastu-form-container">
      {/* Dimensions */}
      <div className="planner-card">
        <h3 className="planner-card-title">🏗️ Plot Dimensions</h3>
        <div className="planner-grid-3">
          <div className="planner-field">
            <label>Length ({getLengthLabel()})</label>
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
            <label>Width ({getLengthLabel()})</label>
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
              {displayArea(inputs.length * inputs.width).toLocaleString("en-IN")} {getAreaLabel()}
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
            const rd = roomData[name];
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
          onClick={onGenerate}
        >
          Generate Vastu Layout →
        </button>
      </div>
    </div>
  );
}

export { FACING_DATA };
