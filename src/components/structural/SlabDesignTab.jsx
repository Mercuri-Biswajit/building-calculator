/* eslint-disable no-unused-vars */
// ═══════════════════════════════════════════════════════════════════════════
// SLAB DESIGN TAB — IS 456:2000 (One-way & Two-way)
// Place in: src/pages/CalculatorPage/components/SlabDesignTab.jsx
// ═══════════════════════════════════════════════════════════════════════════

import "./SlabDesignTab.css";

export function SlabDesignTab({
  inputs,
  onInputChange,
  onCalculate,
  onReset,
  results,
  onSendToBeam, // callback(beamLoadEntry) → switches to beam tab
  onSendToColumn, // NEW: callback(columnLoad, position) → switches to column tab
}) {
  const isTwoWay = inputs.slabType === "two_way";

  return (
    <div className="calc-result-card slab-design-container">
      <h3 className="calc-breakdown-header">
        <span>⬜</span> Slab Design Calculator (IS 456:2000)
      </h3>

      {/* ── Inputs ──────────────────────────────────────────────────── */}
      <div className="calc-card">
        <h4 className="calc-card-subtitle">Slab Parameters</h4>

        {/* Slab type toggle */}
        <div className="calc-card-section">
          <h5 className="calc-section-label">Slab Type</h5>
          <div className="slab-type-toggle">
            {[
              {
                val: "one_way",
                icon: "➡️",
                label: "One-Way Slab",
                desc: "ly / lx > 2",
              },
              {
                val: "two_way",
                icon: "⤢",
                label: "Two-Way Slab",
                desc: "ly / lx ≤ 2",
              },
            ].map(({ val, icon, label, desc }) => (
              <button
                key={val}
                className={`slab-type-btn ${inputs.slabType === val ? "active" : ""}`}
                onClick={() =>
                  onInputChange({ target: { name: "slabType", value: val } })
                }
              >
                <span className="slab-type-icon">{icon}</span>
                <span className="slab-type-text">
                  <span className="slab-type-label">{label}</span>
                  <span className="slab-type-desc">{desc}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Spans */}
        <div className="calc-card-section">
          <h5 className="calc-section-label">Span &amp; Support</h5>
          <div className="calc-grid-3">
            <InputField
              name="lx"
              label={
                isTwoWay ? "Short Span, lx (m) *" : "Effective Span, lx (m) *"
              }
              placeholder="4"
              value={inputs.lx}
              onChange={onInputChange}
              hint={
                isTwoWay
                  ? "Shorter direction (controls design)"
                  : "Clear span between supports"
              }
            />
            {isTwoWay && (
              <InputField
                name="ly"
                label="Long Span, ly (m) *"
                placeholder="5"
                value={inputs.ly}
                onChange={onInputChange}
                hint="Must be ≥ lx"
              />
            )}
            <div className="calc-input-group">
              <label className="calc-label-primary">Support Condition *</label>
              <select
                className="calc-input-primary calc-select-input"
                name="supportType"
                value={inputs.supportType}
                onChange={onInputChange}
              >
                <option value="simply_supported">Simply Supported</option>
                <option value="one_end_cont">One End Continuous</option>
                <option value="both_end_cont">Both Ends Continuous</option>
                {!isTwoWay && <option value="cantilever">Cantilever</option>}
              </select>
              <small className="calc-input-hint">
                Affects span/depth ratio &amp; moments
              </small>
            </div>
          </div>
        </div>

        {/* Loads */}
        <div className="calc-card-section">
          <h5 className="calc-section-label">Applied Loads</h5>
          <div className="calc-grid-3">
            <InputField
              name="ll"
              label="Live Load (kN/m²) *"
              placeholder="3"
              value={inputs.ll}
              onChange={onInputChange}
              hint="IS 875: Residential 2, Office 3–4"
              step="0.5"
            />
            <InputField
              name="ff"
              label="Floor Finish Load (kN/m²)"
              placeholder="1.5"
              value={inputs.ff}
              onChange={onInputChange}
              hint="Tiles + screed: 1–2 kN/m²"
              step="0.25"
            />
          </div>
        </div>

        {/* Materials */}
        <div className="calc-card-section">
          <h5 className="calc-section-label">Material Properties</h5>
          <div className="calc-grid-3">
            <div className="calc-input-group">
              <label className="calc-label-primary">Concrete Grade *</label>
              <select
                className="calc-input-primary calc-select-input"
                name="fck"
                value={inputs.fck}
                onChange={onInputChange}
              >
                {[15, 20, 25, 30, 35, 40].map((v) => (
                  <option key={v} value={v}>
                    M{v} (fck = {v} MPa)
                  </option>
                ))}
              </select>
              <small className="calc-input-hint">
                Min M20 for slabs (IS 456)
              </small>
            </div>
            <div className="calc-input-group">
              <label className="calc-label-primary">Steel Grade *</label>
              <select
                className="calc-input-primary calc-select-input"
                name="fy"
                value={inputs.fy}
                onChange={onInputChange}
              >
                <option value="415">Fe415 (fy = 415 MPa)</option>
                <option value="500">Fe500 (fy = 500 MPa)</option>
                <option value="550">Fe550 (fy = 550 MPa)</option>
              </select>
              <small className="calc-input-hint">Fe500 recommended</small>
            </div>
            <InputField
              name="cover"
              label="Clear Cover (mm) *"
              placeholder="20"
              value={inputs.cover}
              onChange={onInputChange}
              hint="Mild: 20 mm, Moderate: 30 mm"
            />
          </div>
        </div>

        <div className="calc-action-row">
          <button
            className="calc-btn-primary"
            onClick={onCalculate}
            disabled={!inputs.lx || (isTwoWay && !inputs.ly)}
          >
            <span>🎯</span> DESIGN SLAB
          </button>
          <button className="calc-btn-secondary" onClick={onReset}>
            ↺ Reset
          </button>
        </div>
      </div>

      {/* ── Results ─────────────────────────────────────────────────── */}
      {results && !results.error && (
        <SlabResults
          results={results}
          onSendToBeam={onSendToBeam}
          onSendToColumn={onSendToColumn}
        />
      )}
      {results?.error && (
        <div className="calc-alert calc-alert-error">
          <strong>Error:</strong> {results.error}
        </div>
      )}
    </div>
  );
}

// ── Results ──────────────────────────────────────────────────────────────────

function SlabResults({ results: r, onSendToBeam, onSendToColumn }) {
  const isOneWay = r.slabType === "one_way";
  const beamLoads = r.beamLoads || null;
  const columnLoad = r.columnLoad || null;

  return (
    <>
      {/* Section summary */}
      <div className="calc-struct-section">
        <h4 className="calc-struct-section-title">
          <span>📐</span> Slab Section &amp; Loading
        </h4>
        <div className="calc-struct-grid">
          <StructCard
            icon="📏"
            title="Overall Depth (D)"
            value={`${r.D_prov} mm`}
            sub="Provided slab thickness"
          />
          <StructCard
            icon="📐"
            title="Effective Depth (d)"
            value={`${r.d_prov} mm`}
            sub="To tension steel centroid"
          />
          <StructCard
            icon="⚖️"
            title="Self Weight"
            value={`${r.sw} kN/m²`}
            sub={`Factored total: ${r.wu} kN/m²`}
          />
          <StructCard
            icon="🔢"
            title="Span/Depth Ratio"
            value={`${r.actualSD}`}
            sub={`Limit: ${r.sdRatio} — ${r.deflOk ? "✓ OK" : "⚠ Revise"}`}
          />
          {!isOneWay && (
            <StructCard
              icon="📊"
              title="ly / lx Ratio"
              value={r.ratio}
              sub={r.ratio <= 2 ? "Two-way action ✓" : "Behaves as one-way"}
            />
          )}
        </div>

        {!r.deflOk && (
          <div className="calc-alert calc-alert-warning">
            <strong>⚠️ Deflection:</strong> Actual span/depth ratio {r.actualSD}{" "}
            exceeds limit {r.sdRatio}. Increase slab thickness or add
            compression steel.
          </div>
        )}
      </div>

      {/* Bending moments */}
      <div className="calc-card">
        <h4 className="calc-card-subtitle">
          <span>📊</span> Design Bending Moments
        </h4>
        <div className="calc-detail-grid">
          {isOneWay ? (
            <>
              <DetailItem label="Mu (mid-span)" value={`${r.Mux} kN·m/m`} />
              {r.Mux_neg > 0 && (
                <DetailItem
                  label="Mu (support)"
                  value={`${r.Mux_neg} kN·m/m`}
                />
              )}
            </>
          ) : (
            <>
              <DetailItem
                label="Mx (short span +)"
                value={`${r.Mux} kN·m/m`}
                note="Mid-span"
              />
              <DetailItem
                label="My (long span +)"
                value={`${r.Muy} kN·m/m`}
                note="Mid-span"
              />
              <DetailItem
                label="Mx (support −)"
                value={`${r.Mux_neg} kN·m/m`}
                note="Continuous edge"
              />
              <DetailItem
                label="My (support −)"
                value={`${r.Muy_neg} kN·m/m`}
                note="Continuous edge"
              />
            </>
          )}
        </div>
      </div>

      {/* ── Beam Load Transfer Panel ─────────────────────────────── */}
      {beamLoads && (
        <BeamLoadPanel beamLoads={beamLoads} onSendToBeam={onSendToBeam} />
      )}

      {/* ── Column Load Transfer Panel ────────────────────────────── */}
      {columnLoad && (
        <ColumnLoadPanel
          columnLoad={columnLoad}
          onSendToColumn={onSendToColumn}
        />
      )}

      {/* Main reinforcement — X direction */}
      <ReinforcementCard
        title={
          isOneWay
            ? "Main Reinforcement (Short Span)"
            : "Reinforcement — Short Span (lx)"
        }
        icon="⬛"
        steel={r.steelX}
        steelNeg={r.steelX_neg}
        bars={r.barsX}
        barsNeg={r.barsX_neg}
        posLabel="Mid-span (bottom)"
        negLabel="Support (top)"
      />

      {/* Y direction — two-way only */}
      {!isOneWay && (
        <ReinforcementCard
          title="Reinforcement — Long Span (ly)"
          icon="⬜"
          steel={r.steelY}
          steelNeg={r.steelY_neg}
          bars={r.barsY}
          barsNeg={r.barsY_neg}
          posLabel="Mid-span (bottom)"
          negLabel="Support (top)"
        />
      )}

      {/* Distribution bars — one-way only */}
      {isOneWay && r.distBars?.length > 0 && (
        <div className="calc-card">
          <h4 className="calc-card-subtitle">
            <span>➡️</span> Distribution Reinforcement (Long Span)
          </h4>
          <p className="calc-card-desc">
            0.12% of gross cross-section area (IS 456 Cl. 26.5.2)
          </p>
          <div className="calc-detail-grid">
            <DetailItem
              label="Ast Min (distribution)"
              value={`${r.distAst} mm²/m`}
            />
          </div>
          <BarTable bars={r.distBars} />
        </div>
      )}

      {/* Anchorage & summary */}
      <div className="calc-card">
        <h4 className="calc-card-subtitle">
          <span>📌</span> Anchorage &amp; Detailing
        </h4>
        <div className="calc-detail-grid">
          <DetailItem
            label="Development Length (Ld)"
            value={`${r.Ld} mm`}
            note="Assumed 10mm bar"
          />
          <DetailItem
            label="Est. Steel (main bars)"
            value={`${r.steelKgPerM2} kg/m²`}
            note="Approx. incl. all layers"
          />
          <DetailItem label="Concrete Grade" value={`M${r.fck}`} />
          <DetailItem label="Steel Grade" value={`Fe${r.fy}`} />
        </div>
      </div>

      <div className="calc-note">
        <strong>📌 IS 456:2000 — Detailing Notes:</strong>
        <ul>
          <li>
            Minimum slab thickness: <strong>125 mm</strong> for roof,{" "}
            <strong>100 mm</strong> for floors.
          </li>
          <li>
            Maximum bar spacing: <strong>3d or 300 mm</strong> (main),{" "}
            <strong>5d or 450 mm</strong> (distribution).
          </li>
          <li>
            Provide cranked bars at supports for negative moment (50% of
            mid-span steel).
          </li>
          <li>
            Top steel at discontinuous edges:{" "}
            <strong>0.5 × bottom steel</strong> for torsion.
          </li>
          <li>
            Development length of bent-up bars must satisfy Ld at the point of
            inflection.
          </li>
          {r.slabType === "two_way" && (
            <li>
              Corner reinforcement in two-way slab: provide mesh of size lx/5 at
              top and bottom at all corners.
            </li>
          )}
        </ul>
      </div>
    </>
  );
}

// ── NEW: Column Load Transfer Panel ──────────────────────────────────────────

function ColumnLoadPanel({ columnLoad, onSendToColumn }) {
  if (!columnLoad) return null;

  const positions = [
    {
      key: "interior",
      label: "Interior Column",
      trib: columnLoad.trib_interior,
      Pu: columnLoad.Pu_interior,
      icon: "🟦",
      hint: "Surrounded by slabs on all 4 sides",
    },
    {
      key: "edge",
      label: "Edge Column",
      trib: columnLoad.trib_edge,
      Pu: columnLoad.Pu_edge,
      icon: "🟧",
      hint: "On perimeter — slab on 2–3 sides",
    },
    {
      key: "corner",
      label: "Corner Column",
      trib: columnLoad.trib_corner,
      Pu: columnLoad.Pu_corner,
      icon: "🟥",
      hint: "At building corner — slab on 1 side",
    },
  ];

  return (
    <div
      className="calc-card"
      style={{ border: "2px solid #10B981", backgroundColor: "#F0FDF4" }}
    >
      <h4 className="calc-card-subtitle" style={{ color: "#059669" }}>
        <span>🏛️</span> Column Load Transfer (from Slab)
      </h4>
      <p
        style={{ fontSize: "0.875rem", color: "#6B7280", marginBottom: "1rem" }}
      >
        Factored axial load (Pu) on columns based on tributary area method.
        Includes a 1.1× factor for approximate column self-weight. Click{" "}
        <strong>Send to Column Design</strong> for the position you want to
        design.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
        }}
      >
        {positions.map(({ key, label, trib, Pu, icon, hint }) => (
          <div
            key={key}
            style={{
              background: "#fff",
              borderRadius: "10px",
              border: "1px solid #6EE7B7",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <div
              style={{ fontWeight: 700, color: "#059669", fontSize: "0.95rem" }}
            >
              {icon} {label}
            </div>
            <div style={{ fontSize: "0.78rem", color: "#6B7280" }}>{hint}</div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.4rem",
                marginTop: "0.25rem",
              }}
            >
              <MiniStat label="Tributary Area" value={`${trib} m²`} />
              <MiniStat label="Pu (per floor)" value={`${Pu} kN`} accent />
            </div>

            {onSendToColumn && (
              <button
                className="calc-btn-primary"
                style={{
                  marginTop: "0.5rem",
                  fontSize: "0.82rem",
                  padding: "0.45rem 0.8rem",
                  background: "#059669",
                }}
                onClick={() => onSendToColumn(columnLoad, key)}
              >
                → Send to Column Design
              </button>
            )}
          </div>
        ))}
      </div>

      <p
        style={{ fontSize: "0.78rem", color: "#9CA3AF", marginTop: "0.75rem" }}
      >
        ⓘ For multi-storey buildings, multiply Pu by the number of floors above.
        Column dimensions (b, D, L) must be entered manually in the Column
        Design tab.
      </p>
    </div>
  );
}

// ── NEW: Beam Load Transfer Panel ────────────────────────────────────────────

function BeamLoadPanel({ beamLoads, onSendToBeam }) {
  const entries = [beamLoads.beamOnShortSide, beamLoads.beamOnLongSide].filter(
    Boolean,
  );

  if (!entries.length) return null;

  return (
    <div
      className="calc-card"
      style={{ border: "2px solid #6366F1", backgroundColor: "#F5F3FF" }}
    >
      <h4 className="calc-card-subtitle" style={{ color: "#4F46E5" }}>
        <span>🏗️</span> Beam Load Transfer (from Slab)
      </h4>
      <p
        style={{ fontSize: "0.875rem", color: "#6B7280", marginBottom: "1rem" }}
      >
        The slab transfers load to its supporting beams. These factored Mu &amp;
        Vu values are computed using IS 456 equivalent UDL method. Click{" "}
        <strong>Send to Beam Design</strong> to auto-fill the Beam Design tab.
      </p>

      <div className="calc-detail-grid">
        {entries.map((entry, idx) => (
          <div
            key={idx}
            style={{
              background: "#fff",
              borderRadius: "10px",
              border: "1px solid #C7D2FE",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                color: "#4F46E5",
                marginBottom: "0.25rem",
              }}
            >
              {entry.label}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.5rem",
              }}
            >
              <MiniStat label="Beam Span" value={`${entry.span} m`} />
              <MiniStat label="Equiv. UDL" value={`${entry.w_beam} kN/m`} />
              <MiniStat
                label="Mu (factored)"
                value={`${entry.Mu} kN·m`}
                accent
              />
              <MiniStat label="Vu (factored)" value={`${entry.Vu} kN`} accent />
            </div>

            <div style={{ fontSize: "0.78rem", color: "#6B7280" }}>
              Support: {entry.supportType.replace(/_/g, " ")}
            </div>

            {onSendToBeam && (
              <button
                className="calc-btn-primary"
                style={{
                  marginTop: "0.5rem",
                  fontSize: "0.85rem",
                  padding: "0.5rem 1rem",
                }}
                onClick={() => onSendToBeam(entry)}
              >
                <span>→</span> Send to Beam Design
              </button>
            )}
          </div>
        ))}
      </div>

      <p
        style={{ fontSize: "0.78rem", color: "#9CA3AF", marginTop: "0.75rem" }}
      >
        ⓘ Beam dimensions (b, D) are not auto-filled — enter them in the Beam
        Design tab based on architectural requirements. Typical beam width =
        slab thickness × 2 to 3; depth = span / 10 to 15.
      </p>
    </div>
  );
}

function MiniStat({ label, value, accent }) {
  return (
    <div>
      <div style={{ fontSize: "0.72rem", color: "#6B7280" }}>{label}</div>
      <div
        style={{
          fontWeight: 600,
          fontSize: "0.95rem",
          color: accent ? "#4F46E5" : "#111827",
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ── Reinforcement card ───────────────────────────────────────────────────────

function ReinforcementCard({
  title,
  icon,
  steel,
  steelNeg,
  bars,
  barsNeg,
  posLabel,
  negLabel,
}) {
  if (!steel) return null;
  return (
    <div className="calc-card">
      <h4 className="calc-card-subtitle">
        <span>{icon}</span> {title}
      </h4>

      <h5 className="calc-section-label">{posLabel}</h5>
      <div className="calc-detail-grid">
        <DetailItem label="Ast Required" value={`${steel.Ast_req} mm²/m`} />
        <DetailItem label="Ast Minimum" value={`${steel.Ast_min} mm²/m`} />
        <DetailItem
          label="Ast Provided"
          value={`${steel.Ast_prov} mm²/m`}
          accent
        />
        <DetailItem label="Steel %" value={`${steel.pt}%`} />
      </div>
      <BarTable bars={bars} recommended />

      {steelNeg && steelNeg.Ast_prov > 0 && (
        <>
          <h5 className="calc-section-label" style={{ marginTop: "1.25rem" }}>
            {negLabel}
          </h5>
          <div className="calc-detail-grid">
            <DetailItem
              label="Ast Required"
              value={`${steelNeg.Ast_req} mm²/m`}
            />
            <DetailItem
              label="Ast Provided"
              value={`${steelNeg.Ast_prov} mm²/m`}
              accent
            />
          </div>
          <BarTable bars={barsNeg} />
        </>
      )}
    </div>
  );
}

// ── Bar spacing table ─────────────────────────────────────────────────────────

function BarTable({ bars, recommended }) {
  if (!bars?.length) return null;
  return (
    <div className="calc-table-container">
      <table className="calc-table">
        <thead>
          <tr>
            {recommended && <th>Option</th>}
            <th>Bar Dia</th>
            <th>Spacing (c/c)</th>
            <th>Ast Provided (mm²/m)</th>
          </tr>
        </thead>
        <tbody>
          {bars.slice(0, 4).map((b, i) => (
            <tr
              key={i}
              className={i === 0 && recommended ? "slab-table-recommended" : ""}
            >
              {recommended && (
                <td>{i === 0 ? "⭐ Recommended" : `Option ${i + 1}`}</td>
              )}
              <td>{b.dia} mm φ</td>
              <td>{b.spacing} mm</td>
              <td>{b.actualAst} mm²/m</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Small shared components ───────────────────────────────────────────────────

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

function DetailItem({ label, value, note, accent }) {
  return (
    <div
      className={`calc-detail-item${accent ? " calc-detail-item--accent" : ""}`}
    >
      <span className="calc-detail-label">{label}</span>
      <span className="calc-detail-value">{value}</span>
      {note && <span className="calc-detail-note">{note}</span>}
    </div>
  );
}

export default SlabDesignTab;
