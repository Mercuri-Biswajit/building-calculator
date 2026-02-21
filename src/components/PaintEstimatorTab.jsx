// ═══════════════════════════════════════════════════════════════════════════
// PAINT QUANTITY ESTIMATOR TAB
// ═══════════════════════════════════════════════════════════════════════════

export function PaintEstimatorTab({
  inputs,
  onInputChange,
  onCalculate,
  onReset,
  results,
}) {
  return (
    <div className="calc-result-card">
      <h3 className="calc-breakdown-header">
        <span>🎨</span> Paint Quantity Estimator
      </h3>

      {/* ── Inputs ──────────────────────────────────────────────── */}
      <div className="calc-card">
        <h4 className="calc-card-subtitle">Room / Surface Details</h4>

        <div className="calc-card-section">
          <h5 className="calc-section-label">Dimensions</h5>
          <div className="calc-grid-3">
            <InputField
              name="roomLength"
              label="Room Length (ft) *"
              placeholder="20"
              value={inputs.roomLength}
              onChange={onInputChange}
              hint="Length of one room"
            />
            <InputField
              name="roomBreadth"
              label="Room Breadth (ft) *"
              placeholder="15"
              value={inputs.roomBreadth}
              onChange={onInputChange}
              hint="Width of one room"
            />
            <InputField
              name="roomHeight"
              label="Ceiling Height (ft)"
              placeholder="10"
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
              label="Door Width (ft)"
              placeholder="3.5"
              value={inputs.doorWidth}
              onChange={onInputChange}
            />
            <InputField
              name="doorHeight"
              label="Door Height (ft)"
              placeholder="7"
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
              label="Window Width (ft)"
              placeholder="4"
              value={inputs.windowWidth}
              onChange={onInputChange}
            />
            <InputField
              name="windowHeight"
              label="Window Height (ft)"
              placeholder="4"
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
              <small className="calc-input-hint">
                Affects coverage &amp; cost
              </small>
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
              <small className="calc-input-hint">
                Primer not included here
              </small>
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
              <small className="calc-input-hint">
                Affects paint absorption
              </small>
            </div>
            <div className="calc-input-group">
              <label className="calc-label-primary">
                Custom Coverage (sq.ft/litre)
              </label>
              <input
                type="number"
                className="calc-input-primary"
                name="customCoverage"
                value={inputs.customCoverage || ""}
                onChange={onInputChange}
                placeholder="Leave blank for auto"
              />
              <small className="calc-input-hint">
                Override brand coverage rate
              </small>
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

      {/* ── Results ───────────────────────────────────────────────── */}
      {results && !results.error && <PaintResults results={results} />}
      {results?.error && (
        <div className="calc-alert calc-alert-error">
          <strong>Error:</strong> {results.error}
        </div>
      )}
    </div>
  );
}

// ── Results ─────────────────────────────────────────────────────────────────

function PaintResults({ results: r }) {
  const canEntries = Object.entries(r.cans).filter(([, count]) => count > 0);

  return (
    <>
      <div className="calc-struct-section">
        <h4 className="calc-struct-section-title">
          <span>📐</span> Surface Area Breakdown
        </h4>
        <div className="calc-struct-grid">
          <StructCard
            icon="🧱"
            title="Wall Area"
            value={`${r.wallArea} sq.ft`}
            sub="Gross wall surface"
          />
          <StructCard
            icon="🪟"
            title="Openings"
            value={`${r.deductions} sq.ft`}
            sub="Doors + Windows (deducted)"
          />
          <StructCard
            icon="⬜"
            title="Ceiling Area"
            value={`${r.ceilingArea} sq.ft`}
            sub="Flat ceiling"
          />
          <StructCard
            icon="✅"
            title="Total Net Area"
            value={`${r.totalArea} sq.ft`}
            sub="Paintable surface"
          />
        </div>
      </div>

      <div className="calc-card">
        <h4 className="calc-card-subtitle">
          <span>🎨</span> Paint Quantity Required
        </h4>
        <div className="calc-highlight-grid">
          <HighlightCard
            label={`Per Coat (${r.coats} coats planned)`}
            value={r.litresPerCoat}
            unit="litres"
            modifier="primary"
          />
          <HighlightCard
            label="Total (all coats)"
            value={r.litresNet}
            unit="litres"
            modifier="purple"
          />
          <HighlightCard
            label="Final Qty (with wastage)"
            value={r.litresFinal}
            unit="litres"
            modifier="accent"
            note="5–7% wastage included"
          />
          <HighlightCard
            label="Estimated Cost"
            value={`₹${r.estimatedCost.toLocaleString("en-IN")}`}
            unit={`@ ₹${r.costPerLitre}/litre`}
            modifier="green"
          />
        </div>
        <div className="calc-detail-grid">
          <DetailItem
            label="Coverage Rate"
            value={`${r.coverage} sq.ft / litre`}
          />
          <DetailItem label="Number of Coats" value={r.coats} />
          <DetailItem label="Painter Labour" value={`${r.painterDays} days`} />
          <DetailItem label="Reference" value="IS 15489 / Manufacturer spec" />
        </div>
      </div>

      {canEntries.length > 0 && (
        <div className="calc-card">
          <h4 className="calc-card-subtitle">
            <span>🪣</span> Recommended Can Sizes
          </h4>
          <p className="calc-card-desc">
            Optimal combination to purchase{" "}
            <strong>{r.litresFinal} litres</strong>:
          </p>
          <div className="calc-can-grid">
            {canEntries.map(([size, count]) => (
              <div key={size} className="calc-can-card">
                <div className="calc-can-icon">🪣</div>
                <div className="calc-can-count">{count}×</div>
                <div className="calc-can-size">{size}L can</div>
                <div className="calc-can-total">
                  {count * parseInt(size)} litres
                </div>
              </div>
            ))}
          </div>
          <p className="calc-card-hint">
            * Always buy 10% extra for touch-ups after move-in.
          </p>
        </div>
      )}

      <div className="calc-card">
        <h4 className="calc-card-subtitle">
          <span>🏷️</span> Brand Reference
        </h4>
        <div className="calc-table-container">
          <table className="calc-table">
            <thead>
              <tr>
                <th>Brand</th>
                <th>Product</th>
                <th>Coverage (sq.ft/L)</th>
                <th>Litres Needed</th>
              </tr>
            </thead>
            <tbody>
              {r.brands.map((b, i) => {
                const litres =
                  Math.ceil(
                    ((r.totalArea * r.coats) / b.coverage) * 1.05 * 10,
                  ) / 10;
                return (
                  <tr key={i}>
                    <td>
                      <strong>{b.brand}</strong>
                    </td>
                    <td>{b.product}</td>
                    <td>{b.coverage}</td>
                    <td>
                      <strong>{litres} L</strong>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="calc-note">
        <strong>📌 Notes:</strong>
        <ul>
          <li>
            Coverage rates are for <strong>one coat on smooth plaster</strong>;
            rough surfaces need 15–20% more.
          </li>
          <li>
            Always apply <strong>one coat of primer</strong> before topcoat on
            new plaster (calculate separately).
          </li>
          <li>
            Stir paint thoroughly; thin with max 5% water for first coat only.
          </li>
          <li>
            Cost estimate based on mid-range market rates — actual prices may
            vary ±15%.
          </li>
        </ul>
      </div>
    </>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

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

function StructCard({ icon, title, value, sub }) {
  return (
    <div className="calc-struct-card">
      <div className="calc-struct-icon">{icon}</div>
      <div className="calc-struct-title">{title}</div>
      <div className="calc-struct-value">{value}</div>
      <div className="calc-struct-sub">{sub}</div>
    </div>
  );
}

function HighlightCard({ label, value, unit, modifier, note }) {
  return (
    <div className={`calc-highlight-card calc-highlight-card--${modifier}`}>
      <div className="calc-highlight-label">{label}</div>
      <div className="calc-highlight-value">{value}</div>
      <div className="calc-highlight-unit">{unit}</div>
      {note && <div className="calc-highlight-note">{note}</div>}
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="calc-detail-item">
      <span className="calc-detail-label">{label}</span>
      <span className="calc-detail-value">{value}</span>
    </div>
  );
}

export default PaintEstimatorTab;
