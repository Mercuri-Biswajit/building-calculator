import { useState } from "react";
import {
  BUILDING_TYPES,
  FINISH_GRADES,
  SOIL_CONDITIONS,
  REGIONS,
  MATERIAL_RATES,
} from "../../utils/shared/constants";

import { useUnit } from "../../context/UnitContext";

// ─── Validation rules ───────────────────────────────────────────────────────
const getRules = (unit) => ({
  projectName: { type: 'text', required: true, label: "Project Name" },
  clientName: { type: 'text', required: true, label: "Client Name" },
  engineerName: { type: 'text', required: true, label: "Engineer Name" },
  phoneNumber: { type: 'text', required: true, label: "Phone Number" },
  location: { type: 'text', required: false, label: "Location" },
  length: { min: unit==='meters'?1.5:5, max: unit==='meters'?150:500, required: true, label: "Length" },
  breadth: { min: unit==='meters'?1.5:5, max: unit==='meters'?150:500, required: true, label: "Breadth" },
  floorHeight: { min: unit==='meters'?2.4:8, max: unit==='meters'?6:20, required: true, label: "Floor Height" },
  basementDepth: { min: unit==='meters'?1.5:5, max: unit==='meters'?9:30, required: false, label: "Basement Depth" },
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
});

function validate(field, value, unit) {
  const rule = getRules(unit)[field];
  if (!rule) return null;

  const isEmpty = value === "" || value === null || value === undefined;

  if (rule.required && isEmpty) return `${rule.label} is required.`;
  if (!rule.required && isEmpty) return null; // optional blank is fine

  if (rule.type === 'text') return null; // text fields just need to not be empty if required

  const num = parseFloat(value);
  if (isNaN(num)) return `${rule.label} must be a number.`;
  if (num < rule.min) return `${rule.label} must be ≥ ${rule.min}.`;
  if (num > rule.max) return `${rule.label} must be ≤ ${rule.max}.`;
  return null;
}

function validateAll(inputs, unit) {
  const errors = {};
  const currentRules = getRules(unit);
  Object.keys(currentRules).forEach((field) => {
    // Only validate basementDepth when basement is included
    if (field === "basementDepth" && !inputs.includeBasement) return;
    const err = validate(field, inputs[field], unit);
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
  const { unit, setUnit } = useUnit();
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Mark field as touched and validate it on blur
  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validate(field, inputs[field], unit);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  // Validate on change if the field has already been touched
  const handleChange = (field) => (e) => {
    updateField(field)(e);
    if (touched[field]) {
      const err = validate(field, e.target.value, unit);
      setErrors((prev) => ({ ...prev, [field]: err }));
    }
  };

  // Full validation on submit attempt
  const handleCalculate = () => {
    const allErrors = validateAll(inputs, unit);
    const currentRules = getRules(unit);
    // Mark all validated fields as touched so errors are visible
    const allTouched = Object.keys(currentRules).reduce((acc, f) => {
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
        <div className="calc-panel-label" style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div>
            <span className="label-icon">▣</span>
            BUILDING SPECIFICATIONS
          </div>
        </div>
        <button className="calc-btn-reset" onClick={handleReset} style={{ marginLeft: 'auto' }}>
          ↺ Reset All
        </button>
      </div>

      {/* ── Project & Client Details ──────────────────────────────── */}
      <div className="calc-card" style={{ borderColor: 'var(--color-accent)' }}>
        <h3 className="calc-card-subtitle" style={{ color: 'var(--color-accent)' }}>Project Identity (Required)</h3>
        <div className="calc-grid-2">
          {/* Project Name */}
          <div className="calc-input-group">
            <label className="calc-label-primary">Project Name <span style={{color: 'red'}}>*</span></label>
            <input
              type="text"
              className={inputClass("calc-input-primary", "projectName")}
              placeholder="e.g. Sharma Residence"
              value={inputs.projectName || ''}
              onChange={handleChange("projectName")}
              onBlur={handleBlur("projectName")}
            />
            {touched.projectName && <FieldError message={errors.projectName} />}
          </div>

          {/* Client Name */}
          <div className="calc-input-group">
            <label className="calc-label-primary">Client Name <span style={{color: 'red'}}>*</span></label>
            <input
              type="text"
              className={inputClass("calc-input-primary", "clientName")}
              placeholder="e.g. Mr. Rajesh Sharma"
              value={inputs.clientName || ''}
              onChange={handleChange("clientName")}
              onBlur={handleBlur("clientName")}
            />
            {touched.clientName && <FieldError message={errors.clientName} />}
          </div>

          {/* Engineer Name */}
          <div className="calc-input-group">
            <label className="calc-label-primary">Engineer Name <span style={{color: 'red'}}>*</span></label>
            <input
              type="text"
              className={inputClass("calc-input-primary", "engineerName")}
              placeholder="e.g. Er. Biswajit Deb Barman"
              value={inputs.engineerName || ''}
              onChange={handleChange("engineerName")}
              onBlur={handleBlur("engineerName")}
            />
            {touched.engineerName && <FieldError message={errors.engineerName} />}
          </div>

          {/* Phone Number */}
          <div className="calc-input-group">
            <label className="calc-label-primary">Phone Number <span style={{color: 'red'}}>*</span></label>
            <input
              type="text"
              className={inputClass("calc-input-primary", "phoneNumber")}
              placeholder="e.g. +91 98765 43210"
              value={inputs.phoneNumber || ''}
              onChange={handleChange("phoneNumber")}
              onBlur={handleBlur("phoneNumber")}
            />
            {touched.phoneNumber && <FieldError message={errors.phoneNumber} />}
          </div>

          {/* Location */}
          <div className="calc-input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="calc-label-primary">Project Location</label>
            <input
              type="text"
              className={inputClass("calc-input-primary", "location")}
              placeholder="e.g. Raiganj, Uttar Dinajpur"
              value={inputs.location || ''}
              onChange={handleChange("location")}
              onBlur={handleBlur("location")}
            />
          </div>
        </div>
      </div>

      {/* ── Basic Dimensions ──────────────────────────────────────── */}
      <div className="calc-card">
        <h3 className="calc-card-subtitle">Basic Dimensions</h3>
        <div className="calc-grid-3">
          {/* Length */}
          <div className="calc-input-group">
            <label className="calc-label-primary">
              Length <span className="calc-label-unit">{unit}</span>
            </label>
            <input
              type="number"
              className={inputClass("calc-input-primary", "length")}
              placeholder={`e.g. ${unit === 'meters' ? '12.5' : '40'}`}
              value={inputs.length}
              onChange={handleChange("length")}
              onBlur={handleBlur("length")}
              min={getRules(unit).length.min}
              max={getRules(unit).length.max}
            />
            {touched.length && <FieldError message={errors.length} />}
          </div>

          {/* Breadth */}
          <div className="calc-input-group">
            <label className="calc-label-primary">
              Breadth <span className="calc-label-unit">{unit}</span>
            </label>
            <input
              type="number"
              className={inputClass("calc-input-primary", "breadth")}
              placeholder={`e.g. ${unit === 'meters' ? '9' : '30'}`}
              value={inputs.breadth}
              onChange={handleChange("breadth")}
              onBlur={handleBlur("breadth")}
              min={getRules(unit).breadth.min}
              max={getRules(unit).breadth.max}
            />
            {touched.breadth && <FieldError message={errors.breadth} />}
          </div>

          {/* Floor Height */}
          <div className="calc-input-group">
            <label className="calc-label-primary">
              Floor Height <span className="calc-label-unit">{unit}</span>
            </label>
            <input
              type="number"
              className={inputClass("calc-input-primary", "floorHeight")}
              placeholder={unit === 'meters' ? '3' : '10'}
              value={inputs.floorHeight}
              onChange={handleChange("floorHeight")}
              onBlur={handleBlur("floorHeight")}
              min={getRules(unit).floorHeight.min}
              max={getRules(unit).floorHeight.max}
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
                Basement Depth <span className="calc-label-unit">{unit}</span>
              </label>
              <input
                type="number"
                className={inputClass("calc-input-primary", "basementDepth")}
                placeholder={unit === 'meters' ? '2.5' : '8'}
                value={inputs.basementDepth}
                onChange={handleChange("basementDepth")}
                onBlur={handleBlur("basementDepth")}
                min={getRules(unit).basementDepth.min}
                max={getRules(unit).basementDepth.max}
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
                min={getRules(unit)[field].min}
                max={getRules(unit)[field].max}
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
