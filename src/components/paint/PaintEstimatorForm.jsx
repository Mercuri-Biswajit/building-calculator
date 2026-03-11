import React, { useState } from "react";
import { useUnit } from "../../context/UnitContext";
import "./PaintEstimatorForm.css";

export function PaintEstimatorForm({ inputs, onInputChange, onCalculate, onReset }) {
  const { getLengthLabel, getAreaLabel } = useUnit();

  return (
    <div className="calc-card paint-form-card">
      <h4 className="calc-card-subtitle">Room / Surface Details</h4>

      <div className="calc-card-section">
        <h5 className="calc-section-label">Dimensions</h5>
        <div className="calc-grid-3">
          <InputField
            name="roomLength"
            label={`Room Length (${getLengthLabel()}) *`}
            placeholder={getLengthLabel() === "m" ? "6" : "20"}
            value={inputs.roomLength}
            onChange={onInputChange}
            hint="Length of one room"
          />
          <InputField
            name="roomBreadth"
            label={`Room Breadth (${getLengthLabel()}) *`}
            placeholder={getLengthLabel() === "m" ? "4.5" : "15"}
            value={inputs.roomBreadth}
            onChange={onInputChange}
            hint="Width of one room"
          />
          <InputField
            name="roomHeight"
            label={`Ceiling Height (${getLengthLabel()})`}
            placeholder={getLengthLabel() === "m" ? "3" : "10"}
            value={inputs.roomHeight}
            onChange={onInputChange}
            hint="Typically 9–12 ft"
          />
        </div>
        <div className="calc-grid-3" style={{ marginTop: "1rem" }}>
          <InputField
            name="numRooms"
            label="Number of Rooms"
            placeholder="1"
            value={inputs.numRooms}
            onChange={onInputChange}
            hint="Same dimensions applied to all"
          />
        </div>
      </div>

      <div className="calc-card-section">
        <h5 className="calc-section-label">Openings (Deductions)</h5>
        <div className="calc-grid-3">
          <InputField
            name="numDoors"
            label="No. of Doors"
            placeholder="1"
            value={inputs.numDoors}
            onChange={onInputChange}
            hint="Per room"
          />
          <InputField
            name="doorWidth"
            label={`Door Width (${getLengthLabel()})`}
            placeholder={getLengthLabel() === "m" ? "1" : "3.5"}
            value={inputs.doorWidth}
            onChange={onInputChange}
          />
          <InputField
            name="doorHeight"
            label={`Door Height (${getLengthLabel()})`}
            placeholder={getLengthLabel() === "m" ? "2.1" : "7"}
            value={inputs.doorHeight}
            onChange={onInputChange}
          />
          <InputField
            name="numWindows"
            label="No. of Windows"
            placeholder="2"
            value={inputs.numWindows}
            onChange={onInputChange}
            hint="Per room"
          />
          <InputField
            name="windowWidth"
            label={`Window Width (${getLengthLabel()})`}
            placeholder={getLengthLabel() === "m" ? "1.2" : "4"}
            value={inputs.windowWidth}
            onChange={onInputChange}
          />
          <InputField
            name="windowHeight"
            label={`Window Height (${getLengthLabel()})`}
            placeholder={getLengthLabel() === "m" ? "1.2" : "4"}
            value={inputs.windowHeight}
            onChange={onInputChange}
          />
        </div>
      </div>

      <div className="calc-card-section">
        <h5 className="calc-section-label">Paint Specifications</h5>
        <div className="calc-grid-3">
          <div className="calc-input-group">
            <label className="calc-label-primary">Paint Type</label>
            <select
              className="calc-input-primary calc-select-input"
              name="paintType"
              value={inputs.paintType}
              onChange={onInputChange}
            >
              <option value="interior">Interior Emulsion (Walls)</option>
              <option value="exterior">Exterior Weatherproof (Walls)</option>
              <option value="ceiling">Ceiling White / Distemper</option>
              <option value="primer">Primer / Sealer (Under-coat)</option>
            </select>
            <small className="calc-input-hint">Affects coverage &amp; cost</small>
          </div>
          <div className="calc-input-group">
            <label className="calc-label-primary">Number of Coats</label>
            <select
              className="calc-input-primary calc-select-input"
              name="numCoats"
              value={inputs.numCoats}
              onChange={onInputChange}
            >
              <option value="1">1 coat — Touch-up / Primer</option>
              <option value="2">2 coats — Standard (recommended)</option>
              <option value="3">3 coats — Premium finish</option>
            </select>
            <small className="calc-input-hint">Primer not included here</small>
          </div>
          <div className="calc-input-group">
            <label className="calc-label-primary">Surface Condition</label>
            <select
              className="calc-input-primary calc-select-input"
              name="surfaceCondition"
              value={inputs.surfaceCondition}
              onChange={onInputChange}
            >
              <option value="new">New / Fresh plaster</option>
              <option value="repaint">Repainting (sealed surface)</option>
              <option value="rough">Rough / Porous surface</option>
            </select>
            <small className="calc-input-hint">Affects paint absorption</small>
          </div>
          <div className="calc-input-group">
            <label className="calc-label-primary">
              Custom Coverage ({getAreaLabel()}/litre)
            </label>
            <input
              type="number"
              className="calc-input-primary"
              name="customCoverage"
              value={inputs.customCoverage || ""}
              onChange={onInputChange}
              placeholder="Leave blank for auto"
            />
            <small className="calc-input-hint">Override brand coverage rate</small>
          </div>
        </div>
      </div>

      <div className="calc-action-row">
        <button
          className="calc-btn-primary"
          onClick={onCalculate}
          disabled={!inputs.roomLength || !inputs.roomBreadth}
        >
          <span>🎨</span> CALCULATE PAINT QUANTITY
        </button>
        <button className="calc-btn-secondary" onClick={onReset}>
          ↺ Reset
        </button>
      </div>
    </div>
  );
}

function InputField({ name, label, hint, placeholder, value, onChange }) {
  return (
    <div className="calc-input-group">
      <label className="calc-label-primary">{label}</label>
      <input
        type="number"
        className="calc-input-primary"
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
      />
      {hint && <small className="calc-input-hint">{hint}</small>}
    </div>
  );
}
