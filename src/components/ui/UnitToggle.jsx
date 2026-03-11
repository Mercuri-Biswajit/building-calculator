import "./UnitToggle.css";

export function UnitToggle({ unit, onChange }) {
  return (
    <div className="unit-toggle-wrapper">
      <span className="unit-toggle-label">Unit:</span>
      <div className="unit-toggle-container">
        <button
          className={`unit-toggle-btn ${unit === "feet" ? "active" : ""}`}
          onClick={() => onChange("feet")}
        >
          Feet
        </button>
        <button
          className={`unit-toggle-btn ${unit === "meters" ? "active" : ""}`}
          onClick={() => onChange("meters")}
        >
          Meters
        </button>
      </div>
    </div>
  );
}
