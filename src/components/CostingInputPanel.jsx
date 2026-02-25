import { useState } from "react";
import {
  BUILDING_TYPES,
  FINISH_GRADES,
  SOIL_CONDITIONS,
  REGIONS,
  MATERIAL_RATES,
} from "../utils/calculator/shared/calculatorConstants";

// ─── Validation rules ───────────────────────────────────────────────────────
const RULES = {
  length: { min: 5, max: 500, required: true, label: "Length" },
  breadth: { min: 5, max: 500, required: true, label: "Breadth" },
  floorHeight: { min: 8, max: 20, required: true, label: "Floor Height" },
  basementDepth: { min: 5, max: 30, required: false, label: "Basement Depth" },
  customCementRate: {
    min: 100,
    max: 1000,
    required: false,
    label: "Cement Rate",
  },
  customSteelRate: { min: 40, max: 500, required: false, label: "Steel Rate" },
  customSandRate: { min: 10, max: 200, required: false, label: "Sand Rate" },
  customAggregateRate: {
    min: 10,
    max: 200,
    required: false,
    label: "Aggregate Rate",
  },
};

function validate(field, value) {
  const rule = RULES[field];
  if (!rule) return null;

  const isEmpty = value === "" || value === null || value === undefined;

  if (rule.required && isEmpty) return `${rule.label} is required.`;
  if (!rule.required && isEmpty) return null; // optional blank is fine

  const num = parseFloat(value);
  if (isNaN(num)) return `${rule.label} must be a number.`;
  if (num < rule.min) return `${rule.label} must be ≥ ${rule.min}.`;
  if (num > rule.max) return `${rule.label} must be ≤ ${rule.max}.`;
  return null;
}

function validateAll(inputs) {
  const errors = {};
  Object.keys(RULES).forEach((field) => {
    // Only validate basementDepth when basement is included
    if (field === "basementDepth" && !inputs.includeBasement) return;
    const err = validate(field, inputs[field]);
    if (err) errors[field] = err;
  });
  return errors;
}

// ─── Small inline error component ───────────────────────────────────────────
function FieldError({ message }) {
  if (!message) return null;
  return (
    <span
      style={{
        display: "block",
        marginTop: "0.25rem",
        fontSize: "0.75rem",
        color: "var(--color-error, #e53e3e)",
        fontWeight: 500,
      }}
    >
      ⚠ {message}
    </span>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export function CostingInputPanel({
  inputs,
  updateField,
  onCalculate,
  onReset,
}) {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Mark field as touched and validate it on blur
  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validate(field, inputs[field]);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  // Validate on change if the field has already been touched
  const handleChange = (field) => (e) => {
    updateField(field)(e);
    if (touched[field]) {
      const err = validate(field, e.target.value);
      setErrors((prev) => ({ ...prev, [field]: err }));
    }
  };

  // Full validation on submit attempt
  const handleCalculate = () => {
    const allErrors = validateAll(inputs);
    // Mark all validated fields as touched so errors are visible
    const allTouched = Object.keys(RULES).reduce((acc, f) => {
      acc[f] = true;
      return acc;
    }, {});
    setErrors(allErrors);
    setTouched(allTouched);

    if (Object.keys(allErrors).length > 0) return; // stop if errors exist
    onCalculate();
  };

  const handleReset = () => {
    setErrors({});
    setTouched({});
    onReset();
  };

  // Returns CSS class with error modifier when field has a visible error
  const inputClass = (base, field) =>
    `${base}${errors[field] && touched[field] ? " calc-input-error" : ""}`;

  return (
    <section className="calc-input-section">
      <div className="calc-section-header">
        <div className="calc-panel-label">
          <span className="label-icon">▣</span>
          BUILDING SPECIFICATIONS
        </div>
        <button className="calc-btn-reset" onClick={handleReset}>
          ↺ Reset All
        </button>
      </div>

      {/* ── Basic Dimensions ──────────────────────────────────────── */}
      <div className="calc-card">
        <h3 className="calc-card-subtitle">Basic Dimensions</h3>
        <div className="calc-grid-3">
          {/* Length */}
          <div className="calc-input-group">
            <label className="calc-label-primary">
              Length <span className="calc-label-unit">feet</span>
            </label>
            <input
              type="number"
              className={inputClass("calc-input-primary", "length")}
              placeholder="e.g. 40"
              value={inputs.length}
              onChange={handleChange("length")}
              onBlur={handleBlur("length")}
              min={RULES.length.min}
              max={RULES.length.max}
            />
            {touched.length && <FieldError message={errors.length} />}
          </div>

          {/* Breadth */}
          <div className="calc-input-group">
            <label className="calc-label-primary">
              Breadth <span className="calc-label-unit">feet</span>
            </label>
            <input
              type="number"
              className={inputClass("calc-input-primary", "breadth")}
              placeholder="e.g. 30"
              value={inputs.breadth}
              onChange={handleChange("breadth")}
              onBlur={handleBlur("breadth")}
              min={RULES.breadth.min}
              max={RULES.breadth.max}
            />
            {touched.breadth && <FieldError message={errors.breadth} />}
          </div>

          {/* Floor Height */}
          <div className="calc-input-group">
            <label className="calc-label-primary">
              Floor Height <span className="calc-label-unit">feet</span>
            </label>
            <input
              type="number"
              className={inputClass("calc-input-primary", "floorHeight")}
              placeholder="10"
              value={inputs.floorHeight}
              onChange={handleChange("floorHeight")}
              onBlur={handleBlur("floorHeight")}
              min={RULES.floorHeight.min}
              max={RULES.floorHeight.max}
            />
            {touched.floorHeight && <FieldError message={errors.floorHeight} />}
          </div>
        </div>

        {/* Number of Floors — button group, no free-text validation needed */}
        <div className="calc-input-group">
          <label className="calc-label-primary">Number of Floors</label>
          <div className="calc-floor-buttons">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                className={`calc-floor-btn ${inputs.floors === num ? "active" : ""}`}
                onClick={() =>
                  updateField("floors")({ target: { value: num } })
                }
              >
                {num === 1 ? "G" : `G+${num - 1}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Building Type & Specifications ────────────────────────── */}
      <div className="calc-card">
        <h3 className="calc-card-subtitle">Building Type & Specifications</h3>
        <div className="calc-grid-2">
          <div className="calc-input-group">
            <label className="calc-label-primary">Building Type</label>
            <select
              className="calc-input-primary calc-select-input"
              value={inputs.buildingType}
              onChange={updateField("buildingType")}
            >
              {Object.entries(BUILDING_TYPES).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="calc-input-group">
            <label className="calc-label-primary">Finish Grade</label>
            <select
              className="calc-input-primary calc-select-input"
              value={inputs.finishGrade}
              onChange={updateField("finishGrade")}
            >
              {Object.entries(FINISH_GRADES).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="calc-input-group">
            <label className="calc-label-primary">Soil Condition</label>
            <select
              className="calc-input-primary calc-select-input"
              value={inputs.soilCondition}
              onChange={updateField("soilCondition")}
            >
              {Object.entries(SOIL_CONDITIONS).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="calc-input-group">
            <label className="calc-label-primary">Region / Location</label>
            <select
              className="calc-input-primary calc-select-input"
              value={inputs.region}
              onChange={updateField("region")}
            >
              {Object.entries(REGIONS).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Advanced Options ──────────────────────────────────────── */}
      <div className="calc-card">
        <h3 className="calc-card-subtitle">Advanced Options</h3>
        <div className="calc-toggle-group">
          <label className="calc-toggle-label">
            <input
              type="checkbox"
              className="calc-checkbox"
              checked={inputs.includeBasement}
              onChange={updateField("includeBasement")}
            />
            <span>Include Basement</span>
          </label>
          <label className="calc-toggle-label">
            <input
              type="checkbox"
              className="calc-checkbox"
              checked={inputs.includeStaircase}
              onChange={updateField("includeStaircase")}
            />
            <span>Include Staircase Design</span>
          </label>
        </div>

        {inputs.includeBasement && (
          <div className="calc-grid-3" style={{ marginTop: "1rem" }}>
            <div className="calc-input-group">
              <label className="calc-label-primary">
                Basement Depth <span className="calc-label-unit">feet</span>
              </label>
              <input
                type="number"
                className={inputClass("calc-input-primary", "basementDepth")}
                placeholder="8"
                value={inputs.basementDepth}
                onChange={handleChange("basementDepth")}
                onBlur={handleBlur("basementDepth")}
                min={RULES.basementDepth.min}
                max={RULES.basementDepth.max}
              />
              {touched.basementDepth && (
                <FieldError message={errors.basementDepth} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Custom Material Rates ─────────────────────────────────── */}
      <div className="calc-card">
        <h3 className="calc-card-subtitle">
          Custom Material Rates{" "}
          <span
            style={{
              fontSize: "0.8rem",
              color: "var(--color-text-dim)",
              fontWeight: 400,
            }}
          >
            (Optional — leave blank for default rates)
          </span>
        </h3>
        <div className="calc-material-grid">
          {[
            {
              field: "customCementRate",
              label: "Cement",
              unit: "bag",
              key: "cement",
            },
            {
              field: "customSteelRate",
              label: "Steel",
              unit: "kg",
              key: "steel",
            },
            {
              field: "customSandRate",
              label: "Sand",
              unit: "cft",
              key: "sand",
            },
            {
              field: "customAggregateRate",
              label: "Aggregate",
              unit: "cft",
              key: "aggregate",
            },
          ].map(({ field, label, unit, key }) => (
            <div key={field} className="calc-input-group">
              <label className="calc-label-secondary">
                {label}{" "}
                <span className="calc-rate-hint">
                  ₹/{unit} (default: {MATERIAL_RATES[key].rate})
                </span>
              </label>
              <input
                type="number"
                className={inputClass("calc-input-secondary", field)}
                placeholder={MATERIAL_RATES[key].rate}
                value={inputs[field]}
                onChange={handleChange(field)}
                onBlur={handleBlur(field)}
                min={RULES[field].min}
                max={RULES[field].max}
              />
              {touched[field] && <FieldError message={errors[field]} />}
            </div>
          ))}
        </div>
      </div>

      <button className="calc-btn-primary" onClick={handleCalculate}>
        CALCULATE ESTIMATE →
      </button>
    </section>
  );
}
