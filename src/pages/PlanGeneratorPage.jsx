// ═══════════════════════════════════════════════════════════════════════════
// src/pages/PlanGeneratorPage.jsx — v5
// Per-floor room selection — each floor is independently configured
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import {
  generatePlan,
  ROOM_CATALOGUE,
  ROOM_CATEGORIES,
  DEFAULT_FLOOR_ROOMS,
  FACE_OPTIONS,
  FLOOR_OPTIONS,
  FLOOR_TITLES,
} from "../utils/planGenerator/planGeneratorLogic";
import PlanCanvas from "../components/PlanCanvas";
import "../styles/pages/_plan-generator.css";

// Build initial per-floor room sets from defaults
function buildDefaultRoomSets(floors) {
  return Array.from({ length: floors }, (_, i) =>
    new Set(DEFAULT_FLOOR_ROOMS[i] || DEFAULT_FLOOR_ROOMS[0])
  );
}

export default function PlanGeneratorPage() {
  const [inputs, setInputs] = useState({
    plotL:         40,
    plotB:         30,
    wallThickness: 0.75,
    face:          "bottom",
    floors:        1,
    showDims:      true,
  });

  // floorRooms: array of Set<string>, one per floor
  const [floorRooms, setFloorRooms] = useState(() => buildDefaultRoomSets(1));
  // Which floor's room panel is currently open in the configurator
  const [activeConfigFloor, setActiveConfigFloor] = useState(0);

  const [planResult, setPlanResult] = useState(null);
  const [error,      setError]      = useState(null);
  const [generated,  setGenerated]  = useState(false);

  const autoScale = Math.min(
    Math.floor(560 / (inputs.plotL || 40)),
    Math.floor(440 / (inputs.plotB || 30)),
    18
  );
  const scale = Math.max(autoScale, 5);

  // ── Handle basic inputs ──────────────────────────────────────────────────
  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? (parseFloat(value) || "") : value,
    }));
  };

  // ── Handle floor count change — resize floorRooms array ─────────────────
  const handleFloorsChange = (newFloors) => {
    setInputs(prev => ({ ...prev, floors: newFloors }));
    setFloorRooms(prev => {
      const next = [...prev];
      // Add new floors with defaults
      while (next.length < newFloors) {
        const i = next.length;
        next.push(new Set(DEFAULT_FLOOR_ROOMS[i] || DEFAULT_FLOOR_ROOMS[0]));
      }
      // Trim extra
      return next.slice(0, newFloors);
    });
    // Keep active config floor in range
    setActiveConfigFloor(f => Math.min(f, newFloors - 1));
  };

  // ── Toggle room on a specific floor ─────────────────────────────────────
  const toggleRoom = (floorIdx, roomId) => {
    setFloorRooms(prev => {
      const next = prev.map(s => new Set(s)); // deep copy
      const s = next[floorIdx];
      if (s.has(roomId)) {
        if (s.size <= 1) return prev; // keep at least 1
        s.delete(roomId);
      } else {
        s.add(roomId);
      }
      return next;
    });
  };

  // ── Copy this floor's rooms to all other floors ──────────────────────────
  const copyToAll = (srcIdx) => {
    const src = floorRooms[srcIdx];
    setFloorRooms(prev => prev.map((_, i) => i === srcIdx ? new Set(src) : new Set(src)));
  };

  // ── Generate ─────────────────────────────────────────────────────────────
  const handleGenerate = useCallback(() => {
    const { plotL, plotB, wallThickness, floors } = inputs;
    if (!plotL || !plotB) { setError("Please enter plot dimensions."); return; }

    const floorRoomIds = floorRooms.map(s => [...s]);
    const result = generatePlan({ plotL, plotB, wallThickness, floorRoomIds, floors });

    if (!result.valid) {
      setError(result.error);
      setPlanResult(null);
    } else {
      setError(null);
      setPlanResult(result);
      setGenerated(true);
    }
  }, [inputs, floorRooms]);

  // ── Reset ────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setInputs({ plotL: 40, plotB: 30, wallThickness: 0.75, face: "bottom", floors: 1, showDims: true });
    setFloorRooms(buildDefaultRoomSets(1));
    setActiveConfigFloor(0);
    setPlanResult(null);
    setError(null);
    setGenerated(false);
  };

  const planMeta = planResult
    ? { plotL: planResult.plotL, plotB: planResult.plotB, wallThickness: planResult.wallThickness }
    : null;

  const byCategory = ROOM_CATEGORIES.map(cat => ({
    ...cat,
    rooms: ROOM_CATALOGUE.filter(r => r.cat === cat.id),
  }));

  return (
    <>
      <Helmet>
        <title>2D Floor Plan Generator | Er. Biswajit Deb Barman – Raiganj</title>
        <meta name="description" content="Free 2D floor plan generator. Configure each floor independently — duplex, G+1, G+2, G+3. Built by Er. Biswajit Deb Barman, Civil Engineer, Raiganj." />
      </Helmet>

      <div className="plan-page">

        {/* ── Hero ──────────────────────────────────────────── */}
        <section className="hs-root">
          <div className="hs-topbar">
            <div className="hs-topbar-inner container">
              <span className="hs-topbar-badge">
                <span className="hs-topbar-dot" />
                2D Plan Generator
              </span>
              <span className="hs-topbar-sep" />
              {["Per-Floor Room Config", "Duplex Ready", "G to G+3", "SVG Export"].map(t => (
                <span key={t} className="hs-topbar-feat">
                  <span className="hs-topbar-check">✓</span>{t}
                </span>
              ))}
            </div>
          </div>

          <div className="hs-body">
            <div className="hs-bg-grid" aria-hidden="true" />
            <div className="hs-bg-glow" aria-hidden="true" />
            <div className="container hs-body-inner">
              <div className="hs-headline">
                <div className="hs-eyebrow">
                  <span className="hs-eyebrow-icon">📐</span>
                  Residential Floor Plan Generator
                </div>
                <h1 className="hs-title">
                  Design Each Floor<br />
                  <span className="hs-title-accent">Your Way</span>
                </h1>
                <p className="hs-desc">
                  Configure every floor independently — put Hall, Kitchen &amp;
                  Guest Room on the ground floor; Bedrooms &amp; Study on the first.
                  Perfect for duplex, G+1, G+2 and G+3 buildings.
                </p>
                <div className="hs-pills">
                  <span className="hs-pill hs-pill--navy">Per-Floor Rooms</span>
                  <span className="hs-pill hs-pill--orange">Duplex Ready</span>
                  <span className="hs-pill hs-pill--green">G to G+3</span>
                </div>
              </div>

              <div className="hs-stats-block">
                <div className="hs-stats-row">
                  <div className="hs-stat-box hs-stat-box--orange">
                    <span className="hs-stat-icon">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
                      </svg>
                    </span>
                    <strong className="hs-stat-num">{ROOM_CATALOGUE.length}</strong>
                    <span className="hs-stat-label">Room Types</span>
                  </div>
                  <div className="hs-stat-box hs-stat-box--navy">
                    <span className="hs-stat-icon">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="3" width="20" height="4" rx="1"/>
                        <rect x="2" y="10" width="20" height="4" rx="1"/>
                        <rect x="2" y="17" width="20" height="4" rx="1"/>
                      </svg>
                    </span>
                    <strong className="hs-stat-num">G+3</strong>
                    <span className="hs-stat-label">Max Floors</span>
                  </div>
                </div>
                <div className="hs-feat-list">
                  {[
                    { icon: "🏠", title: "Independent Floor Config", desc: "Each floor gets its own room layout" },
                    { icon: "🔁", title: "Duplex / Multi-use",       desc: "Ground floor social, upper floors private" },
                    { icon: "🏢", title: "Auto Staircase",           desc: "Staircase placed automatically for G+1 and above" },
                  ].map(f => (
                    <div key={f.title} className="hs-feat-item">
                      <span className="hs-feat-icon" style={{ fontSize: "1rem" }}>{f.icon}</span>
                      <div className="hs-feat-text">
                        <strong>{f.title}</strong><span>{f.desc}</span>
                      </div>
                      <span className="hs-feat-arrow">›</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Main Layout ─────────────────────────────────── */}
        <div className="plan-main">

          {/* ── LEFT PANEL ──────────────────────────────── */}
          <aside className="plan-panel">

            {/* ── Plot Dimensions ──── */}
            <div className="plan-card">
              <h3 className="plan-card-title">📐 Plot Dimensions</h3>
              <div className="plan-grid-2">
                <div className="plan-input-group">
                  <label className="plan-label">Length (ft) <span className="plan-required">*</span></label>
                  <input type="number" name="plotL" className="plan-input"
                    value={inputs.plotL} onChange={handleInput} placeholder="40" min="5" max="500"/>
                  <small className="plan-hint">Horizontal</small>
                </div>
                <div className="plan-input-group">
                  <label className="plan-label">Breadth (ft) <span className="plan-required">*</span></label>
                  <input type="number" name="plotB" className="plan-input"
                    value={inputs.plotB} onChange={handleInput} placeholder="30" min="5" max="500"/>
                  <small className="plan-hint">Vertical</small>
                </div>
              </div>
              <div className="plan-input-group" style={{ marginTop: "1rem" }}>
                <label className="plan-label">Wall Thickness</label>
                <select name="wallThickness" className="plan-input"
                  value={inputs.wallThickness} onChange={handleInput}>
                  <option value={0.5}>0.5 ft — 6" (half-brick)</option>
                  <option value={0.75}>0.75 ft — 9" (single brick)</option>
                  <option value={1.0}>1.0 ft — 12" (thick wall)</option>
                </select>
              </div>
            </div>

            {/* ── Number of Floors ──── */}
            <div className="plan-card">
              <h3 className="plan-card-title">🏢 Number of Floors</h3>
              <div className="plan-floors-grid">
                {FLOOR_OPTIONS.map(opt => (
                  <button key={opt.value}
                    className={`plan-floor-btn${inputs.floors === opt.value ? " active" : ""}`}
                    onClick={() => handleFloorsChange(opt.value)}>
                    <span className="plan-floor-short">{opt.short}</span>
                    <span className="plan-floor-label">{opt.label}</span>
                  </button>
                ))}
              </div>
              <p className="plan-card-hint">Staircase auto-added for G+1 and above.</p>
            </div>

            {/* ── Per-Floor Room Configurator ──── */}
            <div className="plan-card">
              <h3 className="plan-card-title">🏠 Rooms Per Floor</h3>
              <p className="plan-card-desc">
                Select the rooms for each floor independently.
              </p>

              {/* Floor selector tabs */}
              <div className="plan-floor-config-tabs">
                {Array.from({ length: inputs.floors }, (_, i) => (
                  <button key={i}
                    className={`plan-floor-config-tab${activeConfigFloor === i ? " active" : ""}`}
                    onClick={() => setActiveConfigFloor(i)}>
                    {FLOOR_TITLES[i]}
                    <span className="plan-floor-config-count">
                      {floorRooms[i]?.size || 0}
                    </span>
                  </button>
                ))}
              </div>

              {/* Room chips for the active floor */}
              {floorRooms[activeConfigFloor] && (
                <div className="plan-floor-config-body">
                  {byCategory.map(cat => (
                    <div key={cat.id} className="plan-room-cat">
                      <div className="plan-room-cat-label">{cat.label}</div>
                      <div className="plan-room-chips">
                        {cat.rooms.map(room => {
                          const selected = floorRooms[activeConfigFloor].has(room.id);
                          return (
                            <button key={room.id}
                              className={`plan-room-chip${selected ? " selected" : ""}`}
                              onClick={() => toggleRoom(activeConfigFloor, room.id)}
                              type="button">
                              {selected && <span className="plan-chip-check">✓</span>}
                              {room.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Copy to all */}
                  {inputs.floors > 1 && (
                    <button className="plan-copy-all-btn"
                      onClick={() => copyToAll(activeConfigFloor)}>
                      ⎘ Copy {FLOOR_TITLES[activeConfigFloor]}'s rooms to all floors
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ── Building Face Direction ──── */}
            <div className="plan-card">
              <h3 className="plan-card-title">🚪 Building Face Direction</h3>
              <p className="plan-card-desc">Which side is the main entrance / road?</p>
              <div className="plan-face-grid">
                {FACE_OPTIONS.map(opt => (
                  <button key={opt.value}
                    className={`plan-face-btn${inputs.face === opt.value ? " active" : ""}`}
                    onClick={() => setInputs(prev => ({ ...prev, face: opt.value }))}>
                    <span className="plan-face-symbol">{opt.symbol}</span>
                    <span className="plan-face-name">{opt.label}</span>
                    <span className="plan-face-desc">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Display Options ──── */}
            <div className="plan-card">
              <h3 className="plan-card-title">⚙️ Display Options</h3>
              <label className="plan-checkbox-label">
                <input type="checkbox" name="showDims" checked={inputs.showDims} onChange={handleInput}/>
                Show dimension annotations
              </label>
            </div>

            {/* ── Actions ──── */}
            <div className="plan-actions">
              <button className="plan-btn-generate" onClick={handleGenerate}>
                ⬛ Generate Plan
              </button>
              <button className="plan-btn-reset" onClick={handleReset}>↺ Reset</button>
            </div>

          </aside>

          {/* ── RIGHT PANEL ─────────────────────────────── */}
          <div className="plan-output">
            {error && <div className="plan-alert plan-alert-error">⚠ {error}</div>}

            {!generated && !error && (
              <div className="plan-empty-state">
                <div className="plan-empty-icon">📐</div>
                <h2 className="plan-empty-title">Your plan will appear here</h2>
                <p className="plan-empty-desc">
                  Configure rooms per floor, enter plot size,<br />
                  then click <strong>Generate Plan</strong>.
                </p>
                {/* Preview of floor configs */}
                <div className="plan-config-preview">
                  {Array.from({ length: inputs.floors }, (_, i) => (
                    <div key={i} className="plan-config-preview-row">
                      <span className="plan-config-preview-floor">{FLOOR_TITLES[i]}</span>
                      <div className="plan-config-preview-chips">
                        {[...(floorRooms[i] || [])].map(id => {
                          const rc = ROOM_CATALOGUE.find(r => r.id === id);
                          return (
                            <span key={id} className="plan-config-preview-chip">
                              {rc?.label || id}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── All floor plans stacked ── */}
            {planResult?.valid && (
              <div className="plan-floors-stack">
                {planResult.floorPlans.map((fp) => (
                  <div key={fp.floorIndex} className="plan-floor-section">
                    <div className="plan-floor-section-header">
                      <div className="plan-floor-section-badge">{fp.floorLabel}</div>
                      <span className="plan-floor-section-sub">
                        {[...(floorRooms[fp.floorIndex] || [])].length} rooms configured
                      </span>
                    </div>

                    <PlanCanvas
                      floorPlan={fp}
                      meta={planMeta}
                      scale={scale}
                      face={inputs.face}
                      showDims={inputs.showDims}
                    />

                    <div className="plan-legend">
                      <h4 className="plan-legend-title">Room Schedule — {fp.floorLabel}</h4>
                      <div className="plan-legend-grid">
                        {fp.rooms.map(room => (
                          <div key={room.id} className="plan-legend-item">
                            <span className="plan-legend-swatch"
                              style={{ background: room.fill, borderColor: room.stroke }}/>
                            <div className="plan-legend-info">
                              <span className="plan-legend-name">{room.label}</span>
                              <span className="plan-legend-area">
                                {room.w.toFixed(1)}ft × {room.h.toFixed(1)}ft
                                {" = "}{(room.w * room.h).toFixed(1)} sqft
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="plan-area-summary">
                        <div className="plan-area-item">
                          <span className="plan-area-label">Plot Area</span>
                          <span className="plan-area-value">
                            {(planResult.plotL * planResult.plotB).toFixed(0)} sqft
                          </span>
                        </div>
                        <div className="plan-area-item plan-area-item--accent">
                          <span className="plan-area-label">Built-up ({fp.floorLabel})</span>
                          <span className="plan-area-value">
                            {fp.rooms.reduce((s, r) => s + r.w * r.h, 0).toFixed(1)} sqft
                          </span>
                        </div>
                        {fp.floorIndex === planResult.floors - 1 && planResult.floors > 1 && (
                          <div className="plan-area-item plan-area-item--total">
                            <span className="plan-area-label">
                              Total Built-up ({planResult.floors} floors)
                            </span>
                            <span className="plan-area-value plan-area-value--big">
                              {planResult.floorPlans
                                .reduce((s, f) => s + f.rooms.reduce((rs, r) => rs + r.w * r.h, 0), 0)
                                .toFixed(1)} sqft
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <p className="plan-legend-note" style={{ marginTop: "0.5rem" }}>
                  ℹ Dimensions are proportionally calculated from your plot size.
                  This is an indicative layout — consult a licensed civil engineer before construction.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}