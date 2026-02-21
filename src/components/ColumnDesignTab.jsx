import { safeFormat, safeGet } from "../utils/formatHelpers";

export function ColumnDesignTab({
  inputs,
  onInputChange,
  onCalculate,
  results,
}) {
  return (
    <div className="calc-result-card">
      <h3 className="calc-breakdown-header">
        <span>🏛️</span> Column Design Calculator (IS 456:2000)
      </h3>

      {/* ── Inputs ──────────────────────────────────────────────────── */}
      <div className="calc-card">
        <h4 className="calc-card-subtitle">Input Parameters</h4>

        <div className="calc-card-section">
          <h5 className="calc-section-label">Loading Conditions</h5>
          <div className="calc-grid-3">
            <InputField
              name="Pu"
              label="Factored Axial Load, Pu (kN) *"
              hint="Compressive load including self-weight"
              placeholder="1500"
              value={inputs.Pu}
              onChange={onInputChange}
            />
            <InputField
              name="Mux"
              label="Moment Mux (kNm)"
              hint="Moment about major axis (optional)"
              placeholder="80"
              value={inputs.Mux}
              onChange={onInputChange}
              step="0.1"
            />
            <InputField
              name="Muy"
              label="Moment Muy (kNm)"
              hint="Moment about minor axis (optional)"
              placeholder="0"
              value={inputs.Muy}
              onChange={onInputChange}
              step="0.1"
            />
          </div>
        </div>

        <div className="calc-card-section">
          <h5 className="calc-section-label">Column Dimensions</h5>
          <div className="calc-grid-3">
            <InputField
              name="b"
              label="Width, b (mm) *"
              hint="Typical: 230, 300, 350, 450 mm"
              placeholder="300"
              value={inputs.b}
              onChange={onInputChange}
            />
            <InputField
              name="D"
              label="Depth, D (mm) *"
              hint="Larger dimension"
              placeholder="450"
              value={inputs.D}
              onChange={onInputChange}
            />
            <InputField
              name="L"
              label="Unsupported Length, L (mm) *"
              hint="Clear height between restraints"
              placeholder="3500"
              value={inputs.L}
              onChange={onInputChange}
            />
          </div>
        </div>

        <div className="calc-card-section">
          <h5 className="calc-section-label">Restraint Conditions</h5>
          <div className="calc-grid-2">
            <RestraintSelect
              name="restraintX"
              label="Major Axis Restraint"
              value={inputs.restraintX || "both-hinged"}
              onChange={onInputChange}
            />
            <RestraintSelect
              name="restraintY"
              label="Minor Axis Restraint"
              value={inputs.restraintY || "both-hinged"}
              onChange={onInputChange}
            />
          </div>
        </div>

        <div className="calc-card-section">
          <h5 className="calc-section-label">Material Properties</h5>
          <div className="calc-grid-3">
            <div className="calc-input-group">
              <label className="calc-label-primary">Concrete Grade *</label>
              <select
                className="calc-input-primary"
                name="fck"
                value={inputs.fck || "25"}
                onChange={onInputChange}
              >
                {[15, 20, 25, 30, 35, 40].map((v) => (
                  <option key={v} value={v}>
                    M{v} (fck = {v} MPa)
                  </option>
                ))}
              </select>
              <small className="calc-input-hint">
                Characteristic compressive strength
              </small>
            </div>
            <div className="calc-input-group">
              <label className="calc-label-primary">Steel Grade *</label>
              <select
                className="calc-input-primary"
                name="fy"
                value={inputs.fy || "500"}
                onChange={onInputChange}
              >
                <option value="415">Fe415 (fy = 415 MPa)</option>
                <option value="500">Fe500 (fy = 500 MPa)</option>
                <option value="550">Fe550 (fy = 550 MPa)</option>
              </select>
              <small className="calc-input-hint">
                Characteristic yield strength
              </small>
            </div>
            <InputField
              name="cover"
              label="Clear Cover (mm) *"
              hint="Minimum: 40mm for columns"
              value={inputs.cover || "40"}
              onChange={onInputChange}
            />
          </div>
        </div>

        <button
          className="calc-btn-primary"
          onClick={onCalculate}
          disabled={
            !inputs.Pu ||
            !inputs.b ||
            !inputs.D ||
            !inputs.L ||
            !inputs.fck ||
            !inputs.fy
          }
        >
          <span>🎯</span> DESIGN COLUMN
        </button>
      </div>

      {/* ── Results ─────────────────────────────────────────────────── */}
      {results && !results.error && (
        <>
          {results.slenderness && results.summary && (
            <DesignSummary results={results} />
          )}
          {results.effectiveLengths && results.slenderness && (
            <SlendernessAnalysis results={results} inputs={inputs} />
          )}
          {results.eccentricity && (
            <EccentricityAnalysis results={results} inputs={inputs} />
          )}
          {results.design && <ReinforcementDesign design={results.design} />}
          {results.ties && (
            <LateralReinforcement ties={results.ties} inputs={inputs} />
          )}
          <DesignNotes results={results} inputs={inputs} />
        </>
      )}

      {results?.error && (
        <div className="calc-alert calc-alert-error">
          <strong>Error:</strong> {results.error}
        </div>
      )}
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function InputField({ name, label, hint, placeholder, value, onChange, step }) {
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
        step={step}
      />
      {hint && <small className="calc-input-hint">{hint}</small>}
    </div>
  );
}

function RestraintSelect({ name, label, value, onChange }) {
  return (
    <div className="calc-input-group">
      <label className="calc-label-primary">{label}</label>
      <select
        className="calc-input-primary"
        name={name}
        value={value}
        onChange={onChange}
      >
        <option value="both-fixed">Both Ends Fixed</option>
        <option value="one-fixed-one-hinged">One Fixed, One Hinged</option>
        <option value="both-hinged">Both Ends Hinged</option>
        <option value="one-fixed-one-free">One Fixed, One Free</option>
      </select>
      <small className="calc-input-hint">
        Effective length factor: IS 456 Table 28
      </small>
    </div>
  );
}

function DetailItem({ label, value, valueStyle }) {
  return (
    <div className="calc-detail-item">
      <span className="calc-detail-label">{label}</span>
      <span className="calc-detail-value" style={valueStyle}>
        {value}
      </span>
    </div>
  );
}

function DesignSummary({ results }) {
  const status = safeGet(results, "summary.status");
  return (
    <div className="calc-struct-section">
      <h4 className="calc-struct-section-title">
        <span>📊</span> Design Summary
      </h4>
      <div className="calc-struct-grid">
        <div
          className="calc-struct-card"
          style={{
            borderColor: results.slenderness.isShort ? "#3B82F6" : "#F59E0B",
          }}
        >
          <div className="calc-struct-icon">📏</div>
          <div className="calc-struct-title">Classification</div>
          <div className="calc-struct-value">
            {safeGet(results, "summary.classification")}
          </div>
          <div className="calc-struct-sub">
            λx = {safeFormat(results.slenderness.slenderness_x, 1)}, λy ={" "}
            {safeFormat(results.slenderness.slenderness_y, 1)}
          </div>
        </div>
        <div className="calc-struct-card">
          <div className="calc-struct-icon">🎯</div>
          <div className="calc-struct-title">Design Type</div>
          <div className="calc-struct-value" style={{ fontSize: "0.9em" }}>
            {safeGet(results, "summary.designType", "N/A")
              .replace("-", " ")
              .toUpperCase()}
          </div>
          <div className="calc-struct-sub">Load condition</div>
        </div>
        <div className="calc-struct-card">
          <div className="calc-struct-icon">⚙️</div>
          <div className="calc-struct-title">Longitudinal Steel</div>
          <div className="calc-struct-value">
            {safeGet(results, "summary.longitudinalSteel")}
          </div>
          <div className="calc-struct-sub">
            p = {safeGet(results, "summary.reinforcementRatio")}
          </div>
        </div>
        <div className="calc-struct-card">
          <div className="calc-struct-icon">🔗</div>
          <div className="calc-struct-title">Lateral Ties</div>
          <div className="calc-struct-value">
            {safeGet(results, "summary.lateralTies")}
          </div>
          <div className="calc-struct-sub">Confinement reinforcement</div>
        </div>
        <div className="calc-struct-card">
          <div className="calc-struct-icon">💪</div>
          <div className="calc-struct-title">Load Capacity</div>
          <div className="calc-struct-value" style={{ color: "#10B981" }}>
            {safeGet(results, "summary.loadCapacity")}
          </div>
          <div className="calc-struct-sub">
            Factor: {safeGet(results, "summary.loadFactor")}
          </div>
        </div>
        <div
          className="calc-struct-card"
          style={{
            borderColor: status === "OK" ? "#10B981" : "#EF4444",
            backgroundColor: status === "OK" ? "#F0FDF4" : "#FEF2F2",
          }}
        >
          <div
            className="calc-struct-icon"
            style={{ color: status === "OK" ? "#10B981" : "#EF4444" }}
          >
            {status === "OK" ? "✓" : "✗"}
          </div>
          <div className="calc-struct-title">Design Status</div>
          <div
            className="calc-struct-value"
            style={{ color: status === "OK" ? "#10B981" : "#EF4444" }}
          >
            {safeGet(results, "summary.status", "UNKNOWN")}
          </div>
          <div className="calc-struct-sub">Overall compliance</div>
        </div>
      </div>
    </div>
  );
}

function SlendernessAnalysis({ results, inputs }) {
  return (
    <div className="calc-card">
      <h4 className="calc-card-subtitle">
        <span>📐</span> Slenderness Analysis
      </h4>
      <div className="calc-detail-grid">
        <DetailItem
          label="Unsupported Length (L)"
          value={`${inputs.L || "N/A"} mm`}
        />
        <DetailItem
          label="Effective Length (lex)"
          value={`${safeGet(results, "effectiveLengths.lex")} mm`}
        />
        <DetailItem
          label="Effective Length (ley)"
          value={`${safeGet(results, "effectiveLengths.ley")} mm`}
        />
        <DetailItem
          label="Classification"
          value={safeGet(results, "slenderness.classification")}
          valueStyle={{
            color: results.slenderness.isShort ? "#10B981" : "#F59E0B",
            fontWeight: "bold",
          }}
        />
      </div>
      <div style={{ marginTop: "15px" }}>
        <div className="calc-detail-grid">
          <DetailItem
            label="Slenderness Ratio (lex/D)"
            value={
              <>
                {safeFormat(results.slenderness.slenderness_x, 2)}
                {results.slenderness.isShort_x && (
                  <span style={{ color: "#10B981", marginLeft: "5px" }}>
                    ✓ Short
                  </span>
                )}
              </>
            }
          />
          <DetailItem
            label="Slenderness Ratio (ley/b)"
            value={
              <>
                {safeFormat(results.slenderness.slenderness_y, 2)}
                {results.slenderness.isShort_y && (
                  <span style={{ color: "#10B981", marginLeft: "5px" }}>
                    ✓ Short
                  </span>
                )}
              </>
            }
          />
          <DetailItem label="Limit (Short Column)" value="12.0" />
          <DetailItem
            label="Reference"
            value="IS 456 Cl. 25.1.2"
            valueStyle={{ fontSize: "0.9em" }}
          />
        </div>
      </div>
    </div>
  );
}

function EccentricityAnalysis({ results, inputs }) {
  return (
    <div className="calc-card">
      <h4 className="calc-card-subtitle">
        <span>🎯</span> Eccentricity Analysis
      </h4>
      <div className="calc-detail-grid">
        <DetailItem
          label="Min. Eccentricity ex"
          value={`${safeFormat(results.eccentricity.ex_min, 1)} mm`}
        />
        <DetailItem
          label="Min. Eccentricity ey"
          value={`${safeFormat(results.eccentricity.ey_min, 1)} mm`}
        />
        <DetailItem
          label="Actual ex"
          value={`${safeFormat(results.eccentricity.ex_actual, 1)} mm`}
          valueStyle={{ color: "#F59E0B", fontWeight: "bold" }}
        />
        <DetailItem
          label="Actual ey"
          value={`${safeFormat(results.eccentricity.ey_actual, 1)} mm`}
          valueStyle={{ color: "#F59E0B", fontWeight: "bold" }}
        />
      </div>
      <div style={{ marginTop: "15px" }}>
        <div className="calc-detail-grid">
          <DetailItem
            label="Design Moment Mux"
            value={`${safeFormat(inputs.Mux_design, 2)} kNm`}
          />
          <DetailItem
            label="Design Moment Muy"
            value={`${safeFormat(inputs.Muy_design, 2)} kNm`}
          />
          <DetailItem
            label="Reference"
            value="IS 456 Cl. 25.4"
            valueStyle={{ fontSize: "0.9em" }}
          />
        </div>
      </div>
    </div>
  );
}

function ReinforcementDesign({ design }) {
  if (design.status === "FAIL") {
    return (
      <div className="calc-card">
        <h4 className="calc-card-subtitle">
          <span>💪</span> Reinforcement Design
        </h4>
        <div className="calc-alert calc-alert-error">
          <strong>⚠️ Design Failed:</strong>{" "}
          {safeGet(design, "message", "Check input parameters")}
        </div>
      </div>
    );
  }

  return (
    <div className="calc-card">
      <h4 className="calc-card-subtitle">
        <span>💪</span> Reinforcement Design
      </h4>
      <div className="calc-detail-grid">
        <DetailItem
          label="Required Steel %"
          value={`${safeFormat(design.p_required, 2)}%`}
        />
        <DetailItem
          label="Required Area (Asc)"
          value={`${safeFormat(design.Asc_required, 0)} mm²`}
        />
        <DetailItem
          label="Axial Capacity (Pu)"
          value={`${safeFormat(design.Pu_capacity, 2)} kN`}
          valueStyle={{ color: "#10B981" }}
        />
        {design.Mu_capacity && (
          <DetailItem
            label="Moment Capacity (Mu)"
            value={`${safeFormat(design.Mu_capacity, 2)} kNm`}
            valueStyle={{ color: "#10B981" }}
          />
        )}
      </div>

      {design.utilization && (
        <div style={{ marginTop: "20px" }}>
          <h5 className="calc-section-label">Interaction Check</h5>
          <div className="calc-detail-grid">
            <DetailItem
              label="Axial Utilization"
              value={`${safeFormat(design.utilization.axial * 100, 1)}%`}
            />
            <DetailItem
              label="Moment Utilization"
              value={`${safeFormat(design.utilization.moment * 100, 1)}%`}
            />
            <DetailItem
              label="Total Interaction"
              value={`${safeFormat(design.utilization.total * 100, 1)}% ${design.utilization.total <= 1.0 ? "✓" : "✗"}`}
              valueStyle={{
                color: design.utilization.total <= 1.0 ? "#10B981" : "#EF4444",
                fontWeight: "bold",
              }}
            />
            <DetailItem label="Limit" value="100%" />
          </div>
        </div>
      )}

      {design.barOptions && (
        <div style={{ marginTop: "20px" }}>
          <h5 className="calc-section-label">Reinforcement Options</h5>
          <div className="calc-table-container">
            <table className="calc-table">
              <thead>
                <tr>
                  <th>Option</th>
                  <th>Bar Size</th>
                  <th>Number of Bars</th>
                  <th>Area Provided</th>
                  <th>Steel %</th>
                  <th>Spacing</th>
                </tr>
              </thead>
              <tbody>
                {design.barOptions.map((opt, idx) => (
                  <tr
                    key={idx}
                    style={{
                      backgroundColor: idx === 0 ? "#F0F9FF" : "transparent",
                      fontWeight: idx === 0 ? "bold" : "normal",
                    }}
                  >
                    <td>
                      {idx === 0 ? "⭐ Recommended" : `Option ${idx + 1}`}
                    </td>
                    <td>{opt.diameter || "N/A"} mm φ</td>
                    <td>{opt.numBars || "N/A"}</td>
                    <td>{safeFormat(opt.actualAsc, 0)} mm²</td>
                    <td>{safeFormat(opt.p_provided, 2)}%</td>
                    <td>{safeFormat(opt.spacing, 0)} mm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {design.biaxialNote && (
        <div
          className="calc-alert calc-alert-info"
          style={{ marginTop: "20px" }}
        >
          <strong>ℹ️ Note:</strong> {design.biaxialNote}
        </div>
      )}
    </div>
  );
}

function LateralReinforcement({ ties, inputs }) {
  return (
    <div className="calc-card">
      <h4 className="calc-card-subtitle">
        <span>🔗</span> Lateral Reinforcement
      </h4>
      <div className="calc-detail-grid">
        <DetailItem
          label="Tie Diameter"
          value={`${safeGet(ties, "diameter")} mm φ`}
        />
        <DetailItem
          label="Spacing"
          value={`${safeGet(ties, "spacing")} mm c/c`}
        />
        <DetailItem label="Type" value={safeGet(ties, "type")} />
        <DetailItem
          label="Description"
          value={safeGet(ties, "description")}
          valueStyle={{ fontWeight: "bold", color: "#F59E0B" }}
        />
      </div>
      <div className="calc-alert calc-alert-info" style={{ marginTop: "15px" }}>
        <strong>ℹ️ Spacing Criteria (IS 456 Cl. 26.5.3.2):</strong>
        <ul
          style={{ paddingLeft: "20px", marginTop: "8px", marginBottom: "0" }}
        >
          <li>
            ≤ Least lateral dimension ({Math.min(inputs.b || 0, inputs.D || 0)}{" "}
            mm)
          </li>
          <li>≤ 16 × longitudinal bar diameter</li>
          <li>≤ 300 mm</li>
        </ul>
      </div>
    </div>
  );
}

function DesignNotes({ results, inputs }) {
  return (
    <div
      className="calc-card"
      style={{ backgroundColor: "#FFF7ED", border: "2px solid #F59E0B" }}
    >
      <h4 className="calc-card-subtitle" style={{ color: "#F59E0B" }}>
        <span>📝</span> Design Notes & Recommendations
      </h4>
      <ul style={{ paddingLeft: "20px", lineHeight: "1.8" }}>
        <li>
          <strong>Design Standard:</strong> IS 456:2000 (Code of Practice for
          Plain and Reinforced Concrete)
        </li>
        <li>
          <strong>Load Factor:</strong> Ensure loads are factored as per IS 456
          Cl. 36
        </li>
        <li>
          <strong>Reinforcement Limits:</strong> Min 0.8%, Max 4% (up to 6% at
          laps)
        </li>
        <li>
          <strong>Minimum Bars:</strong> 4 bars for rectangular columns, 6 for
          circular
        </li>
        <li>
          <strong>Concrete Cover:</strong> Minimum 40mm for columns (verify
          exposure condition)
        </li>
        <li>
          <strong>Bar Spacing:</strong> Clear distance ≥ bar diameter or ≥
          aggregate size + 5mm
        </li>
        <li>
          <strong>Lap Splices:</strong> Stagger laps and provide additional ties
        </li>
        <li>
          <strong>Detailing:</strong> Follow IS 456 Cl. 26.5.3 for column
          detailing
        </li>
        {results.slenderness && !results.slenderness.isShort && (
          <li>
            <strong>Slender Column:</strong> Consider additional moments due to
            slenderness effects
          </li>
        )}
        {results.design?.type === "biaxial" && (
          <li>
            <strong>Biaxial Bending:</strong> Verify design using interaction
            curves or detailed analysis
          </li>
        )}
      </ul>
    </div>
  );
}

export default ColumnDesignTab;
