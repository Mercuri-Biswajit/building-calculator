import { safeFormat, safeGet } from "../utils/formatHelpers";

export function BeamDesignTab({ inputs, onInputChange, onCalculate, results }) {
  return (
    <div className="calc-result-card">
      <h3 className="calc-breakdown-header">
        <span>🏗️</span> Beam Design Calculator (IS 456:2000)
      </h3>

      {/* ── Inputs ──────────────────────────────────────────────────── */}
      <div className="calc-card">
        <h4 className="calc-card-subtitle">Input Parameters</h4>

        <div className="calc-card-section">
          <h5 className="calc-section-label">Loading Conditions</h5>
          <div className="calc-grid-3">
            <InputField name="Mu" label="Factored Bending Moment, Mu (kNm) *" hint="Design moment at critical section" placeholder="150" value={inputs.Mu} onChange={onInputChange} step="0.1" />
            <InputField name="Vu" label="Factored Shear Force, Vu (kN) *" hint="Design shear at support" placeholder="80" value={inputs.Vu} onChange={onInputChange} step="0.1" />
          </div>
        </div>

        <div className="calc-card-section">
          <h5 className="calc-section-label">Beam Dimensions</h5>
          <div className="calc-grid-3">
            <InputField name="b" label="Width, b (mm) *" hint="Typical: 230, 300, 350, 450 mm" placeholder="230" value={inputs.b} onChange={onInputChange} />
            <InputField name="D" label="Total Depth, D (mm) *" hint="Overall depth of beam" placeholder="450" value={inputs.D} onChange={onInputChange} />
            <InputField name="span" label="Span, L (mm)" hint="For deflection check (optional)" placeholder="6000" value={inputs.span} onChange={onInputChange} />
          </div>
        </div>

        <div className="calc-card-section">
          <h5 className="calc-section-label">Material Properties</h5>
          <div className="calc-grid-3">
            <div className="calc-input-group">
              <label className="calc-label-primary">Concrete Grade *</label>
              <select className="calc-input-primary" name="fck" value={inputs.fck || "25"} onChange={onInputChange}>
                {[15, 20, 25, 30, 35, 40].map((v) => <option key={v} value={v}>M{v} (fck = {v} MPa)</option>)}
              </select>
              <small className="calc-input-hint">Characteristic compressive strength</small>
            </div>
            <div className="calc-input-group">
              <label className="calc-label-primary">Steel Grade *</label>
              <select className="calc-input-primary" name="fy" value={inputs.fy || "500"} onChange={onInputChange}>
                <option value="415">Fe415 (fy = 415 MPa)</option>
                <option value="500">Fe500 (fy = 500 MPa)</option>
                <option value="550">Fe550 (fy = 550 MPa)</option>
              </select>
              <small className="calc-input-hint">Characteristic yield strength</small>
            </div>
            <InputField name="cover" label="Clear Cover (mm) *" hint="Mild: 25, Moderate: 30, Severe: 45" value={inputs.cover || "30"} onChange={onInputChange} />
          </div>
        </div>

        <button
          className="calc-btn-primary"
          onClick={onCalculate}
          disabled={!inputs.Mu || !inputs.Vu || !inputs.b || !inputs.D || !inputs.fck || !inputs.fy}
        >
          <span>🎯</span> DESIGN BEAM
        </button>
      </div>

      {/* ── Results ─────────────────────────────────────────────────── */}
      {results && !results.error && (
        <>
          <DesignSummary results={results} />
          <FlexuralDetails results={results} inputs={inputs} />
          {results.shearDesign && <ShearDetails shearDesign={results.shearDesign} />}
          {results.deflectionCheck && <DeflectionCheck deflectionCheck={results.deflectionCheck} />}
          {results.developmentLength && <AnchorageDetails developmentLength={results.developmentLength} />}
          <DesignNotes inputs={inputs} results={results} />
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

function DesignSummary({ results }) {
  const designType = safeGet(results, "summary.designType");
  const status = safeGet(results, "summary.status");

  return (
    <div className="calc-struct-section">
      <h4 className="calc-struct-section-title"><span>📊</span> Design Summary</h4>
      <div className="calc-struct-grid">
        <div className="calc-struct-card" style={{ borderColor: designType === "singly" ? "#3B82F6" : "#F59E0B" }}>
          <div className="calc-struct-icon">📐</div>
          <div className="calc-struct-title">Design Type</div>
          <div className="calc-struct-value">
            {designType === "singly" ? "Singly Reinforced" : designType === "doubly" ? "Doubly Reinforced" : "N/A"}
          </div>
          <div className="calc-struct-sub">Reinforcement configuration</div>
        </div>

        <div className="calc-struct-card">
          <div className="calc-struct-icon">⚙️</div>
          <div className="calc-struct-title">Tension Steel</div>
          <div className="calc-struct-value">{safeGet(results, "summary.tension")}</div>
          <div className="calc-struct-sub">Main reinforcement (bottom)</div>
        </div>

        {safeGet(results, "summary.compression") !== "Not required" && safeGet(results, "summary.compression") !== "N/A" && (
          <div className="calc-struct-card">
            <div className="calc-struct-icon">🔧</div>
            <div className="calc-struct-title">Compression Steel</div>
            <div className="calc-struct-value">{safeGet(results, "summary.compression")}</div>
            <div className="calc-struct-sub">Top reinforcement</div>
          </div>
        )}

        <div className="calc-struct-card">
          <div className="calc-struct-icon">🔗</div>
          <div className="calc-struct-title">Stirrups</div>
          <div className="calc-struct-value">{safeGet(results, "summary.stirrups")}</div>
          <div className="calc-struct-sub">Shear reinforcement</div>
        </div>

        <div
          className="calc-struct-card"
          style={{
            borderColor: status === "OK" ? "#10B981" : "#EF4444",
            backgroundColor: status === "OK" ? "#F0FDF4" : "#FEF2F2",
          }}
        >
          <div className="calc-struct-icon" style={{ color: status === "OK" ? "#10B981" : "#EF4444" }}>
            {status === "OK" ? "✓" : "✗"}
          </div>
          <div className="calc-struct-title">Design Status</div>
          <div className="calc-struct-value" style={{ color: status === "OK" ? "#10B981" : "#EF4444" }}>
            {safeGet(results, "summary.status", "UNKNOWN")}
          </div>
          <div className="calc-struct-sub">Overall compliance</div>
        </div>
      </div>
    </div>
  );
}

function FlexuralDetails({ results, inputs }) {
  if (!results.inputs) return null;

  const { flexuralDesign } = results;
  const barOptions = flexuralDesign?.barOptions || flexuralDesign?.tensionBarOptions;

  return (
    <div className="calc-card">
      <h4 className="calc-card-subtitle"><span>💪</span> Flexural Design Details</h4>

      <div className="calc-detail-grid">
        <DetailItem label="Effective Depth (d)" value={`${safeFormat(results.inputs.d, 0)} mm`} />
        <DetailItem label="Effective Cover (d')" value={`${safeFormat(results.inputs.d_prime, 0)} mm`} />
        <DetailItem label="Limiting Moment (Mu,lim)" value={`${safeFormat(results.limiting?.Mu_lim, 2)} kNm`} />
        <DetailItem label="xu,max / d" value={safeFormat(results.limiting?.xu_max_by_d, 3)} />
      </div>

      {flexuralDesign && (
        <div style={{ marginTop: "20px" }}>
          <h5 className="calc-section-label">Steel Reinforcement</h5>
          <div className="calc-detail-grid">
            <DetailItem label="Ast Required" value={`${safeFormat(flexuralDesign.Ast_required, 0)} mm²`} />
            <DetailItem label="Ast Minimum" value={`${safeFormat(flexuralDesign.Ast_min, 0)} mm²`} />
            <DetailItem
              label="Ast Provided"
              value={`${safeFormat(flexuralDesign.Ast_provided || flexuralDesign.barOptions?.[0]?.actualAst, 0)} mm²`}
              valueStyle={{ color: "#10B981", fontWeight: "bold" }}
            />
            <DetailItem label="Reinforcement %" value={`${safeFormat(flexuralDesign.pt_provided, 2)}%`} />
          </div>
        </div>
      )}

      {barOptions && (
        <div style={{ marginTop: "20px" }}>
          <h5 className="calc-section-label">Reinforcement Options</h5>
          <div className="calc-table-container">
            <table className="calc-table">
              <thead>
                <tr>
                  <th>Option</th><th>Bar Size</th><th>Number of Bars</th>
                  <th>Area Provided</th><th>Spacing</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {barOptions.map((opt, idx) => (
                  <tr key={idx} style={{ backgroundColor: idx === 0 ? "#F0F9FF" : "transparent", fontWeight: idx === 0 ? "bold" : "normal" }}>
                    <td>{idx === 0 ? "⭐ Recommended" : `Option ${idx + 1}`}</td>
                    <td>{opt.diameter || "N/A"} mm φ</td>
                    <td>{opt.numBars || "N/A"}</td>
                    <td>{safeFormat(opt.actualAst, 0)} mm²</td>
                    <td>{safeFormat(opt.spacing, 0)} mm</td>
                    <td>
                      <span style={{ color: opt.spacing >= 75 && opt.spacing <= 300 ? "#10B981" : "#F59E0B", fontSize: "18px" }}>
                        {opt.spacing >= 75 && opt.spacing <= 300 ? "✓" : "⚠️"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {flexuralDesign?.designType === "doubly" && flexuralDesign?.compressionBarOptions && (
        <div style={{ marginTop: "20px" }}>
          <h5 className="calc-section-label">Compression Steel Options</h5>
          <div className="calc-detail-grid">
            <DetailItem label="Asc Required" value={`${safeFormat(flexuralDesign.Asc_required, 0)} mm²`} />
            <DetailItem label="Additional Moment" value={`${safeFormat(flexuralDesign.Mu2, 2)} kNm`} />
          </div>
          <div className="calc-table-container" style={{ marginTop: "10px" }}>
            <table className="calc-table">
              <thead><tr><th>Option</th><th>Bar Size</th><th>Number of Bars</th><th>Area Provided</th></tr></thead>
              <tbody>
                {flexuralDesign.compressionBarOptions.map((opt, idx) => (
                  <tr key={idx} style={{ backgroundColor: idx === 0 ? "#FFF7ED" : "transparent", fontWeight: idx === 0 ? "bold" : "normal" }}>
                    <td>{idx === 0 ? "⭐ Recommended" : `Option ${idx + 1}`}</td>
                    <td>{opt.diameter || "N/A"} mm φ</td>
                    <td>{opt.numBars || "N/A"}</td>
                    <td>{safeFormat(opt.actualAsc, 0)} mm²</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ShearDetails({ shearDesign }) {
  return (
    <div className="calc-card">
      <h4 className="calc-card-subtitle"><span>🔗</span> Shear Design Details</h4>
      <div className="calc-detail-grid">
        <DetailItem label="Nominal Shear Stress (τv)" value={`${safeFormat(shearDesign.tau_v, 3)} MPa`} />
        <DetailItem label="Design Shear Strength (τc)" value={`${safeFormat(shearDesign.tau_c, 3)} MPa`} />
        <DetailItem label="Max Shear Stress (τc,max)" value={`${safeFormat(shearDesign.tau_c_max, 2)} MPa`} />
        <DetailItem
          label="Design Status"
          value={safeGet(shearDesign, "status", "UNKNOWN")}
          valueStyle={{ color: shearDesign.status === "FAIL" ? "#EF4444" : "#10B981" }}
        />
      </div>

      {shearDesign.status === "FAIL" && (
        <div className="calc-alert calc-alert-error">
          <strong>⚠️ Section Inadequate:</strong> {safeGet(shearDesign, "message", "Check section dimensions")}
        </div>
      )}

      {shearDesign.stirrupOptions && <StirrupTable options={shearDesign.stirrupOptions} showRecommended />}
      {shearDesign.stirrupDetails && (
        <>
          <h5 className="calc-section-label" style={{ marginTop: "20px" }}>Minimum Stirrups (No Shear Stress)</h5>
          <StirrupTable options={shearDesign.stirrupDetails} />
        </>
      )}
    </div>
  );
}

function StirrupTable({ options, showRecommended }) {
  return (
    <div style={{ marginTop: "20px" }}>
      {showRecommended && <h5 className="calc-section-label">Stirrup Options</h5>}
      <div className="calc-table-container">
        <table className="calc-table">
          <thead>
            <tr>
              {showRecommended && <th>Option</th>}
              <th>Diameter</th><th>Legs</th><th>Spacing</th><th>Description</th>
            </tr>
          </thead>
          <tbody>
            {options.map((opt, idx) => (
              <tr key={idx} style={{ backgroundColor: idx === 0 ? "#F0FDF4" : "transparent", fontWeight: idx === 0 ? "bold" : "normal" }}>
                {showRecommended && <td>{idx === 0 ? "⭐ Recommended" : `Option ${idx + 1}`}</td>}
                <td>{opt.diameter || "N/A"} mm φ</td>
                <td>{opt.legs || "N/A"}-legged</td>
                <td>{opt.spacing || "N/A"} mm c/c</td>
                <td>{opt.description || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DeflectionCheck({ deflectionCheck }) {
  return (
    <div className="calc-card">
      <h4 className="calc-card-subtitle"><span>📏</span> Deflection Control</h4>
      <div className="calc-detail-grid">
        <DetailItem label="Actual L/d Ratio" value={safeFormat(deflectionCheck.actual_ratio, 2)} />
        <DetailItem label="Allowable L/d Ratio" value={safeFormat(deflectionCheck.allowable_ratio, 2)} />
        <DetailItem
          label="Status"
          value={safeGet(deflectionCheck, "status", "N/A")}
          valueStyle={{ color: deflectionCheck.status === "OK" ? "#10B981" : "#EF4444" }}
        />
        <DetailItem label="Message" value={safeGet(deflectionCheck, "message", "N/A")} valueStyle={{ fontSize: "0.9em" }} />
      </div>
    </div>
  );
}

function AnchorageDetails({ developmentLength }) {
  return (
    <div className="calc-card">
      <h4 className="calc-card-subtitle"><span>📐</span> Anchorage Details</h4>
      <div className="calc-detail-grid">
        <DetailItem
          label="Development Length (Ld)"
          value={`${safeFormat(developmentLength, 0)} mm`}
          valueStyle={{ color: "#F59E0B", fontWeight: "bold" }}
        />
        <DetailItem label="Reference" value="IS 456 Cl. 26.2.1" valueStyle={{ fontSize: "0.9em" }} />
      </div>
    </div>
  );
}

function DesignNotes({ inputs, results }) {
  return (
    <div className="calc-card" style={{ backgroundColor: "#FFF7ED", border: "2px solid #F59E0B" }}>
      <h4 className="calc-card-subtitle" style={{ color: "#F59E0B" }}>
        <span>📝</span> Design Notes & Recommendations
      </h4>
      <ul style={{ paddingLeft: "20px", lineHeight: "1.8" }}>
        <li><strong>Design Standard:</strong> IS 456:2000 (Code of Practice for Plain and Reinforced Concrete)</li>
        <li><strong>Load Factor:</strong> Ensure loads are factored as per IS 456 Cl. 36</li>
        <li><strong>Concrete Cover:</strong> Provided cover is {inputs.cover || "N/A"}mm. Verify with exposure condition requirements.</li>
        <li><strong>Bar Spacing:</strong> Maintain minimum clear spacing ≥ bar diameter or ≥ aggregate size + 5mm</li>
        <li><strong>Curtailment:</strong> Ensure adequate development length at supports and bend points</li>
        <li><strong>Detailing:</strong> Follow IS 456 Cl. 26 for detailing requirements</li>
        {results.flexuralDesign?.designType === "doubly" && (
          <li><strong>Compression Steel:</strong> Provide lateral ties to prevent buckling of compression bars</li>
        )}
      </ul>
    </div>
  );
}

function DetailItem({ label, value, valueStyle }) {
  return (
    <div className="calc-detail-item">
      <span className="calc-detail-label">{label}</span>
      <span className="calc-detail-value" style={valueStyle}>{value}</span>
    </div>
  );
}

export default BeamDesignTab;