import React, { useState } from "react";
import { useUnit } from "../../context/UnitContext";
import "./BrickMasonryForm.css";

// ─── Validation rules ────────────────────────────────────────────────────────
const RULES = {
  buildingLength: {
    min: 5,
    max: 500,
    required: true,
    label: "Building Length",
  },
  buildingBreadth: {
    min: 5,
    max: 500,
    required: true,
    label: "Building Breadth",
  },
  floorHeight: { min: 8, max: 20, required: true, label: "Floor Height" },
  doorWidth: { min: 2, max: 8, required: false, label: "Door Width" },
  doorHeight: { min: 5, max: 10, required: false, label: "Door Height" },
  windowWidth: { min: 1, max: 8, required: false, label: "Window Width" },
  windowHeight: { min: 1, max: 8, required: false, label: "Window Height" },
  extraDeductionSqFt: {
    min: 0,
    max: 5000,
    required: false,
    label: "Extra Deduction",
  },
};

export function validate(field, value) {
  const rule = RULES[field];
  if (!rule) return null;
  const isEmpty = value === "" || value === null || value === undefined;
  if (rule.required && isEmpty) return `${rule.label} is required.`;
  if (!rule.required && isEmpty) return null;
  const num = parseFloat(value);
  if (isNaN(num)) return `${rule.label} must be a number.`;
  if (num < rule.min) return `${rule.label} must be ≥ ${rule.min}.`;
  if (num > rule.max) return `${rule.label} must be ≤ ${rule.max}.`;
  return null;
}

export function validateAll(inputs) {
  const errors = {};
  Object.keys(RULES).forEach((field) => {
    const err = validate(field, inputs[field]);
    if (err) errors[field] = err;
  });
  return errors;
}

export function FieldError({ message }) {
  if (!message) return null;
  return (
    <span className="brick-field-error">
      ⚠ {message}
    </span>
  );
}

// ─── Main Form Component ───────────────────────────────────────────────────────────
export function BrickMasonryForm({
  inputs,
  onInputChange,
  onCalculate,
  onReset,
}) {
  const { getLengthLabel, getAreaLabel } = useUnit();
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validate(field, inputs[field]) }));
  };

  const handleChange = (e) => {
    onInputChange(e);
    const { name, value } = e.target;
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
    }
  };

  const handleCalculate = () => {
    const allErrors = validateAll(inputs);
    setErrors(allErrors);
    setTouched(Object.keys(RULES).reduce((a, f) => ({ ...a, [f]: true }), {}));
    if (Object.keys(allErrors).length > 0) return;
    onCalculate();
  };

  const handleReset = () => {
    setErrors({});
    setTouched({});
    onReset();
  };

  const inputClass = (field, base = "calc-input-primary") =>
    `${base}${errors[field] && touched[field] ? " calc-input-error" : ""}`;

  return (
    <div className="calc-card brick-form-card">
      {/* ── Building Dimensions ───────────────────────────────────── */}
      <h4 className="calc-card-subtitle">Building Dimensions</h4>
      <div className="calc-card-section">
        <div className="calc-grid-3">
          <div className="calc-input-group">
            <label className="calc-label-primary">
              Building Length <span className="calc-label-unit">{getLengthLabel()}</span> *
            </label>
            <input
              type="number"
              onWheel={(e) => e.target.blur()}
              name="buildingLength"
              className={inputClass("buildingLength")}
              placeholder="e.g. 40"
              value={inputs.buildingLength}
              onChange={handleChange}
              onBlur={handleBlur("buildingLength")}
            />
            <small className="calc-input-hint">Outer dimension</small>
            {touched.buildingLength && (
              <FieldError message={errors.buildingLength} />
            )}
          </div>

          <div className="calc-input-group">
            <label className="calc-label-primary">
              Building Breadth <span className="calc-label-unit">{getLengthLabel()}</span> *
            </label>
            <input
              type="number"
              onWheel={(e) => e.target.blur()}
              name="buildingBreadth"
              className={inputClass("buildingBreadth")}
              placeholder="e.g. 30"
              value={inputs.buildingBreadth}
              onChange={handleChange}
              onBlur={handleBlur("buildingBreadth")}
            />
            <small className="calc-input-hint">Outer dimension</small>
            {touched.buildingBreadth && (
              <FieldError message={errors.buildingBreadth} />
            )}
          </div>

          <div className="calc-input-group">
            <label className="calc-label-primary">
              Floor Height <span className="calc-label-unit">{getLengthLabel()}</span> *
            </label>
            <input
              type="number"
              onWheel={(e) => e.target.blur()}
              name="floorHeight"
              className={inputClass("floorHeight")}
              placeholder="10"
              value={inputs.floorHeight}
              onChange={handleChange}
              onBlur={handleBlur("floorHeight")}
            />
            <small className="calc-input-hint">Floor-to-floor height</small>
            {touched.floorHeight && (
              <FieldError message={errors.floorHeight} />
            )}
          </div>
        </div>

        {/* Number of Floors */}
        <div className="calc-input-group" style={{ marginTop: "1rem" }}>
          <label className="calc-label-primary">Number of Floors</label>
          <div className="calc-floor-buttons">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                className={`calc-floor-btn ${parseInt(inputs.floors) === num ? "active" : ""}`}
                onClick={() =>
                  onInputChange({ target: { name: "floors", value: num } })
                }
              >
                {num === 1 ? "G" : `G+${num - 1}`}
              </button>
            ))}
          </div>
        </div>

        {/* Wall Thickness */}
        <div className="calc-grid-3" style={{ marginTop: "1rem" }}>
          <div className="calc-input-group">
            <label className="calc-label-primary">Wall Thickness *</label>
            <select
              className="calc-input-primary calc-select-input"
              name="wallThickness"
              value={inputs.wallThickness}
              onChange={handleChange}
            >
              <option value="4.5">4.5" — Half-brick / Partition</option>
              <option value="9">9" — One-brick / External wall</option>
              <option value="13.5">13.5" — One-and-half brick</option>
            </select>
            <small className="calc-input-hint">IS standard sizes</small>
          </div>
        </div>
      </div>

      {/* ── Deductions ─────────────────────────────────────────────── */}
      <h4 className="calc-card-subtitle" style={{ marginTop: "1.5rem" }}>
        Deductions (Openings)
      </h4>
      <div className="calc-card-section">
        <h5 className="calc-section-label">Doors</h5>
        <div className="calc-grid-3">
          <div className="calc-input-group">
            <label className="calc-label-primary">No. of Doors</label>
            <input
              type="number"
              onWheel={(e) => e.target.blur()}
              name="numDoors"
              className="calc-input-primary"
              placeholder="2"
              value={inputs.numDoors}
              onChange={handleChange}
            />
            <small className="calc-input-hint">Total across all floors</small>
          </div>
          <div className="calc-input-group">
            <label className="calc-label-primary">
              Door Width <span className="calc-label-unit">{getLengthLabel()}</span>
            </label>
            <input
              type="number"
              onWheel={(e) => e.target.blur()}
              name="doorWidth"
              className={inputClass("doorWidth")}
              placeholder="3.5"
              value={inputs.doorWidth}
              onChange={handleChange}
              onBlur={handleBlur("doorWidth")}
            />
            <small className="calc-input-hint">Typical: 3–4 ft</small>
            {touched.doorWidth && <FieldError message={errors.doorWidth} />}
          </div>
          <div className="calc-input-group">
            <label className="calc-label-primary">
              Door Height <span className="calc-label-unit">{getLengthLabel()}</span>
            </label>
            <input
              type="number"
              onWheel={(e) => e.target.blur()}
              name="doorHeight"
              className={inputClass("doorHeight")}
              placeholder="7"
              value={inputs.doorHeight}
              onChange={handleChange}
              onBlur={handleBlur("doorHeight")}
            />
            <small className="calc-input-hint">Typical: 7 ft</small>
            {touched.doorHeight && <FieldError message={errors.doorHeight} />}
          </div>
        </div>
      </div>

      <div className="calc-card-section">
        <h5 className="calc-section-label">Windows</h5>
        <div className="calc-grid-3">
          <div className="calc-input-group">
            <label className="calc-label-primary">No. of Windows</label>
            <input
              type="number"
              onWheel={(e) => e.target.blur()}
              name="numWindows"
              className="calc-input-primary"
              placeholder="4"
              value={inputs.numWindows}
              onChange={handleChange}
            />
            <small className="calc-input-hint">Total across all floors</small>
          </div>
          <div className="calc-input-group">
            <label className="calc-label-primary">
              Window Width <span className="calc-label-unit">{getLengthLabel()}</span>
            </label>
            <input
              type="number"
              onWheel={(e) => e.target.blur()}
              name="windowWidth"
              className={inputClass("windowWidth")}
              placeholder="4"
              value={inputs.windowWidth}
              onChange={handleChange}
              onBlur={handleBlur("windowWidth")}
            />
            <small className="calc-input-hint">Typical: 3–5 ft</small>
            {touched.windowWidth && (
              <FieldError message={errors.windowWidth} />
            )}
          </div>
          <div className="calc-input-group">
            <label className="calc-label-primary">
              Window Height <span className="calc-label-unit">{getLengthLabel()}</span>
            </label>
            <input
              type="number"
              onWheel={(e) => e.target.blur()}
              name="windowHeight"
              className={inputClass("windowHeight")}
              placeholder="4"
              value={inputs.windowHeight}
              onChange={handleChange}
              onBlur={handleBlur("windowHeight")}
            />
            <small className="calc-input-hint">Typical: 3.5–4.5 ft</small>
            {touched.windowHeight && (
              <FieldError message={errors.windowHeight} />
            )}
          </div>
        </div>
      </div>

      <div className="calc-card-section">
        <h5 className="calc-section-label">Additional Deduction</h5>
        <div className="calc-grid-3">
          <div className="calc-input-group">
            <label className="calc-label-primary">
              Extra Deduction <span className="calc-label-unit">{getAreaLabel()}</span>
            </label>
            <input
              type="number"
              onWheel={(e) => e.target.blur()}
              name="extraDeductionSqFt"
              className={inputClass("extraDeductionSqFt")}
              placeholder="0"
              value={inputs.extraDeductionSqFt}
              onChange={handleChange}
              onBlur={handleBlur("extraDeductionSqFt")}
            />
            <small className="calc-input-hint">
              Ventilators, arches, AC slots, etc.
            </small>
            {touched.extraDeductionSqFt && (
              <FieldError message={errors.extraDeductionSqFt} />
            )}
          </div>
        </div>
      </div>

      {/* ── Materials & Mix ─────────────────────────────────────────── */}
      <h4 className="calc-card-subtitle" style={{ marginTop: "1.5rem" }}>
        Materials &amp; Mix
      </h4>
      <div className="calc-card-section">
        <div className="calc-grid-3">
          <div className="calc-input-group">
            <label className="calc-label-primary">Brick Type</label>
            <select
              className="calc-input-primary calc-select-input"
              name="brickType"
              value={inputs.brickType}
              onChange={handleChange}
            >
              <option value="standard">
                Standard Clay Brick (230×115×75mm)
              </option>
              <option value="flyash">Fly-Ash Brick (230×110×90mm)</option>
              <option value="hollow">
                Hollow Concrete Block (400×200×200mm)
              </option>
            </select>
            <small className="calc-input-hint">IS 1077 / IS 12894</small>
          </div>
          <div className="calc-input-group">
            <label className="calc-label-primary">
              Mortar Mix (CM Ratio)
            </label>
            <select
              className="calc-input-primary calc-select-input"
              name="mortarRatio"
              value={inputs.mortarRatio}
              onChange={handleChange}
            >
              <option value="1:3">1:3 — Rich mix (waterproofing)</option>
              <option value="1:4">1:4 — Strong structural</option>
              <option value="1:5">1:5 — General masonry</option>
              <option value="1:6">1:6 — Standard (IS 456)</option>
              <option value="1:8">1:8 — Economy / partition</option>
            </select>
            <small className="calc-input-hint">Cement : Sand ratio</small>
          </div>
          <div className="calc-input-group">
            <label className="calc-label-primary">
              Wastage Allowance (%)
            </label>
            <select
              className="calc-input-primary calc-select-input"
              name="wastagePercent"
              value={inputs.wastagePercent}
              onChange={handleChange}
            >
              <option value="3">3% — Controlled site</option>
              <option value="5">5% — Standard (recommended)</option>
              <option value="7">7% — Mixed skill labour</option>
              <option value="10">10% — High breakage / remote</option>
            </select>
            <small className="calc-input-hint">
              Breakage &amp; cutting losses
            </small>
          </div>
        </div>
      </div>

      {/* ── Foundation ─────────────────────────────────────────────── */}
      <h4 className="calc-card-subtitle" style={{ marginTop: "1.5rem" }}>
        Foundation Brickwork
      </h4>
      <div className="calc-card-section">
        {/* Toggle */}
        <div className="calc-input-group" style={{ marginBottom: "1rem" }}>
          <label className="calc-label-primary">Include Foundation?</label>
          <div className="calc-floor-buttons">
            {[true, false].map((val) => (
              <button
                key={String(val)}
                className={`calc-floor-btn ${String(inputs.includeFoundation) === String(val) ? "active" : ""}`}
                onClick={() =>
                  onInputChange({
                    target: { name: "includeFoundation", value: val },
                  })
                }
              >
                {val ? "Yes" : "No"}
              </button>
            ))}
          </div>
          <small className="calc-input-hint">
            Adds brick footing below plinth level
          </small>
        </div>

        {inputs.includeFoundation && (
          <div className="calc-grid-3">
            <div className="calc-input-group">
              <label className="calc-label-primary">
                Foundation Depth <span className="calc-label-unit">{getLengthLabel()}</span>
              </label>
              <input
                type="number"
                onWheel={(e) => e.target.blur()}
                name="foundationDepth"
                className="calc-input-primary"
                placeholder="3"
                value={inputs.foundationDepth}
                onChange={handleChange}
              />
              <small className="calc-input-hint">
                Typical: 2.5–4 ft below plinth
              </small>
            </div>
            <div className="calc-input-group">
              <label className="calc-label-primary">
                Foundation Width{" "}
                <span className="calc-label-unit">inches</span>
              </label>
              <select
                className="calc-input-primary calc-select-input"
                name="foundationWidth"
                value={inputs.foundationWidth}
                onChange={handleChange}
              >
                <option value="13.5">13.5" — 1½-brick (for 4.5" wall)</option>
                <option value="18">18" — 2-brick (for 9" wall)</option>
                <option value="27">
                  27" — 3-brick (for 9" wall, standard)
                </option>
                <option value="36">36" — 4-brick (heavy load)</option>
              </select>
              <small className="calc-input-hint">
                Wider than superstructure wall
              </small>
            </div>
          </div>
        )}
      </div>

      <div className="calc-action-row">
        <button className="calc-btn-primary" onClick={handleCalculate}>
          <span>🧮</span> CALCULATE QUANTITIES
        </button>
        <button className="calc-btn-secondary" onClick={handleReset}>
          ↺ Reset
        </button>
      </div>
    </div>
  );
}
