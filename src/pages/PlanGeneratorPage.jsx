/* eslint-disable no-unused-vars */
// PlanGeneratorPage.jsx — v11
// User supplies all room sizes + staircase dimensions. No defaults. Generate blocked until complete.
import { useState, useCallback, useRef, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import {
  generatePlan, checkVastu,
  ROOM_CATALOGUE, ROOM_CATEGORIES,
  FACE_OPTIONS, FLOOR_OPTIONS, FLOOR_TITLES, LAYOUT_VARIANTS,
} from "../utils/planGenerator/planGeneratorLogic";
import PlanCanvas, { PDFExportButton } from "../components/PlanCanvas";
import "../styles/pages/_plan-generator.css";

// Initial empty room sets — no defaults
function buildEmptyRoomSets(floors) {
  return Array.from({ length: floors }, () => new Set());
}
// Empty size map for a list of roomIds
function buildEmptySizes(roomIds) {
  return roomIds.reduce((m, id) => { m[id] = { w: "", h: "" }; return m; }, {});
}

export default function PlanGeneratorPage() {
  const [inputs, setInputs] = useState({
    plotL: "", plotB: "",
    wallThickness: 0.75,
    face: "bottom",
    floors: 1,
    showDims: true,
    variant: "standard",
    floorHeight: "",
  });

  // Per-floor: which rooms are selected
  const [floorRooms, setFloorRooms] = useState(() => buildEmptyRoomSets(1));
  const [activeConfigFloor, setActiveConfigFloor] = useState(0);

  // Per-floor room sizes: [{ roomId: { w, h } }]
  const [floorRoomSizes, setFloorRoomSizes] = useState([{}]);

  // Staircase
  const [staircase, setStaircase] = useState({ tread: "", rise: "", length: "" });

  const [vastuResults, setVastuResults] = useState(null);
  const [showVastu, setShowVastu] = useState(false);
  const [planResult, setPlanResult] = useState(null);
  const [generated, setGenerated] = useState(false);
  const svgRefs = useRef([]);

  const scale = useMemo(() => {
    const l = parseFloat(inputs.plotL) || 40;
    const b = parseFloat(inputs.plotB) || 30;
    return Math.max(Math.min(Math.floor(560 / l), Math.floor(440 / b), 18), 5);
  }, [inputs.plotL, inputs.plotB]);

  // ── Completeness check — enable Generate only when everything is filled ──
  const completeness = useMemo(() => {
    const missing = [];
    if (!inputs.plotL || !inputs.plotB)   missing.push("Plot dimensions");
    if (!inputs.floorHeight)              missing.push("Floor height");
    if (!staircase.tread || !staircase.rise || !staircase.length)
      missing.push("Staircase dimensions (tread, rise, length)");

    for (let i = 0; i < inputs.floors; i++) {
      const selectedIds = [...(floorRooms[i] || [])];
      if (selectedIds.length === 0) {
        missing.push(`${FLOOR_TITLES[i]}: select at least one room`);
        continue;
      }
      const sizes = floorRoomSizes[i] || {};
      for (const id of selectedIds) {
        const s = sizes[id] || {};
        const cat = ROOM_CATALOGUE.find(r => r.id === id);
        if (!s.w || !s.h) missing.push(`${FLOOR_TITLES[i]}: size for "${cat?.label || id}"`);
      }
    }
    return missing;
  }, [inputs, staircase, floorRooms, floorRoomSizes]);

  const canGenerate = completeness.length === 0;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? (parseFloat(value) || "") : value,
    }));
  };

  const handleFloorsChange = (newFloors) => {
    setInputs(prev => ({ ...prev, floors: newFloors }));
    setFloorRooms(prev => {
      const next = [...prev];
      while (next.length < newFloors) next.push(new Set());
      return next.slice(0, newFloors);
    });
    setFloorRoomSizes(prev => {
      const next = [...prev];
      while (next.length < newFloors) next.push({});
      return next.slice(0, newFloors);
    });
    setActiveConfigFloor(f => Math.min(f, newFloors - 1));
  };

  const toggleRoom = (floorIdx, roomId) => {
    setFloorRooms(prev => {
      const next = prev.map(s => new Set(s));
      const s = next[floorIdx];
      if (s.has(roomId)) { s.delete(roomId); }
      else               { s.add(roomId); }
      return next;
    });
    // Ensure size entry exists when room is added
    setFloorRoomSizes(prev => {
      const next = [...prev];
      const sizes = { ...next[floorIdx] };
      if (!sizes[roomId]) sizes[roomId] = { w: "", h: "" };
      next[floorIdx] = sizes;
      return next;
    });
  };

  const handleRoomSize = (floorIdx, roomId, field, value) => {
    setFloorRoomSizes(prev => {
      const next = [...prev];
      next[floorIdx] = {
        ...next[floorIdx],
        [roomId]: { ...(next[floorIdx][roomId] || {}), [field]: parseFloat(value) || "" },
      };
      return next;
    });
  };

  const handleStaircase = (field, value) => {
    setStaircase(prev => ({ ...prev, [field]: parseFloat(value) || "" }));
  };

  const copyToAll = (srcIdx) => {
    const src = floorRooms[srcIdx];
    const srcSizes = floorRoomSizes[srcIdx];
    setFloorRooms(prev => prev.map(() => new Set(src)));
    setFloorRoomSizes(prev => prev.map(() => ({ ...srcSizes })));
  };

  // ── Generate ──────────────────────────────────────────────────────────────
  const handleGenerate = useCallback(() => {
    if (!canGenerate) return;
    const { plotL, plotB, wallThickness, floors, variant, face, floorHeight } = inputs;
    const floorRoomIds = floorRooms.map(s => [...s]);
    // Convert size strings to numbers
    const parsedSizes = floorRoomSizes.map(sizeMap =>
      Object.fromEntries(
        Object.entries(sizeMap).map(([id, { w, h }]) => [id, { w: parseFloat(w) || 0, h: parseFloat(h) || 0 }])
      )
    );
    const result = generatePlan({
      plotL: parseFloat(plotL), plotB: parseFloat(plotB),
      wallThickness: parseFloat(wallThickness),
      floorRoomIds, floorRoomSizes: parsedSizes,
      floors, variant,
      roadFacing: [face],
      staircase: {
        tread:  parseFloat(staircase.tread),
        rise:   parseFloat(staircase.rise),
        length: parseFloat(staircase.length),
      },
      floorHeight: parseFloat(floorHeight),
    });
    if (result.valid) {
      setPlanResult(result);
      setGenerated(true);
      setVastuResults(checkVastu(result.floorPlans, parseFloat(plotL), parseFloat(plotB), face));
      svgRefs.current = [];
    }
  }, [canGenerate, inputs, floorRooms, floorRoomSizes, staircase]);

  const handleReset = () => {
    setInputs({ plotL:"", plotB:"", wallThickness:0.75, face:"bottom", floors:1, showDims:true, variant:"standard", floorHeight:"" });
    setFloorRooms(buildEmptyRoomSets(1));
    setFloorRoomSizes([{}]);
    setStaircase({ tread:"", rise:"", length:"" });
    setPlanResult(null); setGenerated(false);
    setVastuResults(null); setShowVastu(false);
    svgRefs.current = [];
  };

  const planMeta = planResult ? { plotL: planResult.plotL, plotB: planResult.plotB, wallThickness: planResult.wallThickness } : null;
  const byCategory = ROOM_CATEGORIES.map(cat => ({ ...cat, rooms: ROOM_CATALOGUE.filter(r => r.cat === cat.id) }));
  const vastuSummary = vastuResults ? {
    good: vastuResults.filter(r => r.status==="good").length,
    ok:   vastuResults.filter(r => r.status==="ok").length,
    bad:  vastuResults.filter(r => r.status==="bad").length,
  } : null;

  const activeRooms = [...(floorRooms[activeConfigFloor] || [])];

  return (
    <>
      <Helmet>
        <title>2D Floor Plan Generator | Er. Biswajit Deb Barman – Raiganj</title>
        <meta name="description" content="Free 2D floor plan generator with Vastu checker and PDF export. G to G+3 buildings." />
      </Helmet>

      <div className="plan-page">
        {/* Hero */}
        <section className="hs-root">
          <div className="hs-topbar">
            <div className="hs-topbar-inner container">
              <span className="hs-topbar-badge"><span className="hs-topbar-dot" />2D Plan Generator</span>
              <span className="hs-topbar-sep" />
              {["Custom Room Sizes","Staircase Design","Vastu Check","PDF Export"].map(t => (
                <span key={t} className="hs-topbar-feat"><span className="hs-topbar-check">✓</span>{t}</span>
              ))}
            </div>
          </div>
          <div className="hs-body">
            <div className="hs-bg-grid" aria-hidden="true" />
            <div className="hs-bg-glow" aria-hidden="true" />
            <div className="container hs-body-inner">
              <div className="hs-headline">
                <div className="hs-eyebrow"><span className="hs-eyebrow-icon">📐</span>Residential Floor Plan Generator</div>
                <h1 className="hs-title">Design Each Floor<br /><span className="hs-title-accent">Your Way</span></h1>
                <p className="hs-desc">Enter exact room sizes, staircase dimensions, and floor height. Get a precise plan.</p>
                <div className="hs-pills">
                  <span className="hs-pill hs-pill--navy">Exact Room Sizes</span>
                  <span className="hs-pill hs-pill--orange">Vastu Checker</span>
                  <span className="hs-pill hs-pill--green">PDF Export</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Config */}
        <section className="plan-config-section">
          <div className="plan-config-inner container">

            {/* Row 1: Plot + Floor Height + Floors */}
            <div className="plan-config-row plan-config-row--2">
              <div className="plan-card">
                <h3 className="plan-card-title">📐 Plot Dimensions</h3>
                <div className="plan-grid-2">
                  <div className="plan-input-group">
                    <label className="plan-label">Length (ft) <span className="plan-required">*</span></label>
                    <input type="number" name="plotL" className="plan-input" value={inputs.plotL} onChange={handleInput} placeholder="e.g. 40" min="5" max="500" />
                    <small className="plan-hint">Horizontal</small>
                  </div>
                  <div className="plan-input-group">
                    <label className="plan-label">Breadth (ft) <span className="plan-required">*</span></label>
                    <input type="number" name="plotB" className="plan-input" value={inputs.plotB} onChange={handleInput} placeholder="e.g. 30" min="5" max="500" />
                    <small className="plan-hint">Vertical</small>
                  </div>
                </div>
                <div className="plan-grid-2" style={{ marginTop:"1rem" }}>
                  <div className="plan-input-group">
                    <label className="plan-label">Floor Height (ft) <span className="plan-required">*</span></label>
                    <input type="number" name="floorHeight" className="plan-input" value={inputs.floorHeight} onChange={handleInput} placeholder="e.g. 10" min="6" max="20" step="0.5" />
                    <small className="plan-hint">Floor-to-floor</small>
                  </div>
                  <div className="plan-input-group">
                    <label className="plan-label">Wall Thickness</label>
                    <select name="wallThickness" className="plan-input" value={inputs.wallThickness} onChange={handleInput}>
                      <option value={0.5}>0.5 ft — 6" (half-brick)</option>
                      <option value={0.75}>0.75 ft — 9" (single brick)</option>
                      <option value={1.0}>1.0 ft — 12" (thick wall)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="plan-card">
                <h3 className="plan-card-title">🏢 Number of Floors</h3>
                <div className="plan-floors-grid">
                  {FLOOR_OPTIONS.map(opt => (
                    <button key={opt.value} className={`plan-floor-btn${inputs.floors===opt.value?" active":""}`} onClick={() => handleFloorsChange(opt.value)}>
                      <span className="plan-floor-short">{opt.short}</span>
                      <span className="plan-floor-label">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 2: Staircase Dimensions */}
            <div className="plan-config-row plan-config-row--1">
              <div className="plan-card">
                <h3 className="plan-card-title">🪜 Staircase Dimensions <span className="plan-required">*</span></h3>
                <p className="plan-card-desc">All three fields are required. Used to calculate footprint and number of steps.</p>
                <div className="plan-stair-inputs">
                  <div className="plan-input-group">
                    <label className="plan-label">Tread (ft) <span className="plan-required">*</span></label>
                    <input type="number" className="plan-input" value={staircase.tread} onChange={e => handleStaircase("tread", e.target.value)} placeholder="e.g. 0.83" min="0.5" max="2" step="0.01" />
                    <small className="plan-hint">Horizontal depth of one step</small>
                  </div>
                  <div className="plan-input-group">
                    <label className="plan-label">Rise (ft) <span className="plan-required">*</span></label>
                    <input type="number" className="plan-input" value={staircase.rise} onChange={e => handleStaircase("rise", e.target.value)} placeholder="e.g. 0.58" min="0.3" max="1" step="0.01" />
                    <small className="plan-hint">Vertical height of one step</small>
                  </div>
                  <div className="plan-input-group">
                    <label className="plan-label">Width / Length (ft) <span className="plan-required">*</span></label>
                    <input type="number" className="plan-input" value={staircase.length} onChange={e => handleStaircase("length", e.target.value)} placeholder="e.g. 4" min="2" max="12" step="0.5" />
                    <small className="plan-hint">Clear width of staircase</small>
                  </div>
                  {staircase.tread && staircase.rise && inputs.floorHeight && (
                    <div className="plan-stair-calc">
                      <span className="plan-stair-calc-label">Calculated steps</span>
                      <span className="plan-stair-calc-value">
                        {Math.ceil(parseFloat(inputs.floorHeight) / parseFloat(staircase.rise))} steps
                      </span>
                      <span className="plan-stair-calc-label">Total run depth</span>
                      <span className="plan-stair-calc-value">
                        {(Math.ceil(parseFloat(inputs.floorHeight) / parseFloat(staircase.rise)) * parseFloat(staircase.tread)).toFixed(2)} ft
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Row 3: Entrance Direction + Layout Style */}
            <div className="plan-config-row plan-config-row--2">
              <div className="plan-card">
                <h3 className="plan-card-title">🧭 Entrance Direction (Vastu)</h3>
                <div className="plan-face-grid">
                  {FACE_OPTIONS.map(opt => (
                    <button key={opt.value} className={`plan-face-btn${inputs.face===opt.value?" active":""}`} onClick={() => setInputs(p => ({ ...p, face: opt.value }))}>
                      <span className="plan-face-symbol">{opt.symbol}</span>
                      <span className="plan-face-name">{opt.label}</span>
                      <span className="plan-face-desc">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="plan-card">
                <h3 className="plan-card-title">🎨 Layout Style</h3>
                <p className="plan-card-desc">Rooms arranged per Vastu zones — hall N, kitchen SE, bedrooms SW.</p>
                <div className="plan-variant-grid">
                  {LAYOUT_VARIANTS.map(v => (
                    <button key={v.id} className={`plan-variant-btn${inputs.variant===v.id?" active":""}`} onClick={() => setInputs(p => ({ ...p, variant: v.id }))}>
                      <span className="plan-variant-name">{v.label}</span>
                      <span className="plan-variant-desc">{v.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 4: Room selection per floor */}
            <div className="plan-config-row plan-config-row--1">
              <div className="plan-card">
                <h3 className="plan-card-title">🛏 Rooms per Floor</h3>
                {/* Floor tabs */}
                <div className="plan-floor-config-tabs">
                  {floorRooms.map((_, i) => (
                    <button key={i} className={`plan-floor-config-tab${activeConfigFloor===i?" active":""}`} onClick={() => setActiveConfigFloor(i)}>
                      {FLOOR_TITLES[i]}
                      <span className="plan-floor-config-count">{floorRooms[i]?.size || 0}</span>
                    </button>
                  ))}
                </div>
                {/* Room chips */}
                <div className="plan-floor-config-body">
                  <div className="plan-room-cats-grid">
                    {byCategory.map(cat => (
                      <div key={cat.id} className="plan-room-cat">
                        <div className="plan-room-cat-label">{cat.label}</div>
                        <div className="plan-room-chips">
                          {cat.rooms.map(room => {
                            const sel = floorRooms[activeConfigFloor]?.has(room.id);
                            return (
                              <button key={room.id} className={`plan-room-chip${sel?" selected":""}`} onClick={() => toggleRoom(activeConfigFloor, room.id)} type="button">
                                {sel && <span className="plan-chip-check">✓</span>}{room.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  {inputs.floors > 1 && (
                    <button className="plan-copy-all-btn" onClick={() => copyToAll(activeConfigFloor)}>
                      ⎘ Copy {FLOOR_TITLES[activeConfigFloor]}'s rooms & sizes to all floors
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Row 5: Room Sizes — shown only when rooms are selected */}
            {activeRooms.length > 0 && (
              <div className="plan-config-row plan-config-row--1">
                <div className="plan-card">
                  <h3 className="plan-card-title">📏 Room Sizes — {FLOOR_TITLES[activeConfigFloor]} <span className="plan-required">* all required</span></h3>
                  <p className="plan-card-desc">Enter the exact width and depth of each room in feet. These are used directly in the plan.</p>
                  <div className="plan-roomsizes-grid">
                    {activeRooms.map(id => {
                      const cat = ROOM_CATALOGUE.find(r => r.id === id);
                      const sizes = floorRoomSizes[activeConfigFloor]?.[id] || {};
                      const filled = sizes.w && sizes.h;
                      return (
                        <div key={id} className={`plan-roomsize-row${filled ? " filled" : ""}`}>
                          <div className="plan-roomsize-label">
                            <span className="plan-roomsize-dot" style={{ background: filled ? "#16a34a" : "#ef4444" }} />
                            {cat?.label || id}
                          </div>
                          <div className="plan-roomsize-inputs">
                            <div className="plan-input-group">
                              <label className="plan-label">Width (ft) <span className="plan-required">*</span></label>
                              <input type="number" className="plan-input" value={sizes.w || ""} onChange={e => handleRoomSize(activeConfigFloor, id, "w", e.target.value)} placeholder="ft" min="1" max="100" step="0.5" />
                            </div>
                            <span className="plan-roomsize-x">×</span>
                            <div className="plan-input-group">
                              <label className="plan-label">Depth (ft) <span className="plan-required">*</span></label>
                              <input type="number" className="plan-input" value={sizes.h || ""} onChange={e => handleRoomSize(activeConfigFloor, id, "h", e.target.value)} placeholder="ft" min="1" max="100" step="0.5" />
                            </div>
                            {filled && (
                              <span className="plan-roomsize-area">
                                = {(parseFloat(sizes.w) * parseFloat(sizes.h)).toFixed(1)} sqft
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Row 6: Display Options + Generate */}
            <div className="plan-config-row plan-config-row--2">
              <div className="plan-card">
                <h3 className="plan-card-title">⚙️ Display Options</h3>
                <label className="plan-checkbox-label">
                  <input type="checkbox" name="showDims" checked={inputs.showDims} onChange={handleInput} />
                  Show dimension annotations
                </label>
              </div>
              <div className="plan-card plan-card--actions">
                <h3 className="plan-card-title">⚡ Generate Plan</h3>
                {!canGenerate && (
                  <div className="plan-missing-list">
                    <p className="plan-missing-title">Complete these to generate:</p>
                    <ul>
                      {completeness.slice(0, 5).map((m, i) => <li key={i}>{m}</li>)}
                      {completeness.length > 5 && <li>…and {completeness.length - 5} more</li>}
                    </ul>
                  </div>
                )}
                <div className="plan-actions">
                  <button className="plan-btn-generate" onClick={handleGenerate} disabled={!canGenerate} style={{ opacity: canGenerate ? 1 : 0.45, cursor: canGenerate ? "pointer" : "not-allowed" }}>
                    ⬛ Generate Plan
                  </button>
                  <button className="plan-btn-reset" onClick={handleReset}>↺ Reset</button>
                </div>
                {canGenerate && (
                  <div className="plan-config-summary">
                    <span className="plan-summary-badge">{inputs.plotL}×{inputs.plotB} ft</span>
                    <span className="plan-summary-badge">{FLOOR_OPTIONS.find(f => f.value===inputs.floors)?.label}</span>
                    <span className="plan-summary-badge">{LAYOUT_VARIANTS.find(v => v.id===inputs.variant)?.label}</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* Output */}
        <div className="plan-output-section">
          <div className="plan-output-inner container">
            {!generated && (
              <div className="plan-empty-state">
                <div className="plan-empty-icon">📐</div>
                <h2 className="plan-empty-title">Your plan will appear here</h2>
                <p className="plan-empty-desc">Fill in all dimensions above, then click <strong>Generate Plan</strong>.</p>
              </div>
            )}

            {planResult?.valid && (
              <div className="plan-floors-stack">
                <div className="plan-export-bar">
                  <PDFExportButton svgRefs={svgRefs.current} floorLabels={planResult.floorPlans.map(fp => fp.floorLabel)} plotL={planResult.plotL} plotB={planResult.plotB} />
                  <span className="plan-variant-badge">Layout: {LAYOUT_VARIANTS.find(v => v.id===planResult.variant)?.label}</span>
                  <span className="plan-variant-badge">Floor height: {planResult.floorHeight} ft</span>
                  <span className="plan-variant-badge">Stair: {planResult.staircase?.tread}T × {planResult.staircase?.rise}R × {planResult.staircase?.length}W ft</span>
                </div>

                {vastuResults && (
                  <div className="plan-vastu-panel">
                    <div className="plan-vastu-header" onClick={() => setShowVastu(v => !v)}>
                      <span className="plan-vastu-title">🧿 Vastu Compliance Check</span>
                      <div className="plan-vastu-summary">
                        <span className="plan-vastu-badge plan-vastu-badge--good">{vastuSummary.good} Favorable</span>
                        <span className="plan-vastu-badge plan-vastu-badge--ok">{vastuSummary.ok} Acceptable</span>
                        <span className="plan-vastu-badge plan-vastu-badge--bad">{vastuSummary.bad} Issues</span>
                      </div>
                      <span className="plan-vastu-toggle">{showVastu ? "▲" : "▼"}</span>
                    </div>
                    {showVastu && (
                      <div className="plan-vastu-body">
                        {planResult.floorPlans.map(fp => {
                          const items = vastuResults.filter(r => r.floor===fp.floorLabel);
                          if (!items.length) return null;
                          return (
                            <div key={fp.floorLabel} className="plan-vastu-floor">
                              <div className="plan-vastu-floor-label">{fp.floorLabel}</div>
                              {items.map(item => (
                                <div key={item.roomId} className={`plan-vastu-item plan-vastu-item--${item.status}`}>
                                  <span className="plan-vastu-icon">{item.status==="good"?"✅":item.status==="bad"?"❌":"⚠️"}</span>
                                  <span className="plan-vastu-msg">{item.message}</span>
                                  <span className="plan-vastu-zone">{item.zone}</span>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                        <p className="plan-vastu-note">Vastu analysis is indicative. Consult a Vastu expert for authoritative advice.</p>
                      </div>
                    )}
                  </div>
                )}

                {planResult.floorPlans.map((fp, fi) => (
                  <div key={fp.floorIndex} className="plan-floor-section">
                    <div className="plan-floor-section-header">
                      <div className="plan-floor-section-badge">{fp.floorLabel}</div>
                      <span className="plan-floor-section-sub">{fp.rooms.filter(r => r.baseId !== "staircase" && r.baseId !== "landing").length} rooms</span>
                    </div>
                    <PlanCanvas floorPlan={fp} meta={planMeta} scale={scale} face={inputs.face} showDims={inputs.showDims} setbacks={null} svgRef={el => { svgRefs.current[fi] = el; }} />
                    <div className="plan-legend">
                      <h4 className="plan-legend-title">Room Schedule — {fp.floorLabel}</h4>
                      <div className="plan-legend-grid">
                        {fp.rooms.map(room => (
                          <div key={room.id} className="plan-legend-item">
                            <span className="plan-legend-swatch" style={{ background:room.fill, borderColor:room.stroke }} />
                            <div className="plan-legend-info">
                              <span className="plan-legend-name">{room.label}</span>
                              <span className="plan-legend-area">{room.w.toFixed(2)} ft × {room.h.toFixed(2)} ft = {(room.w*room.h).toFixed(1)} sqft</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="plan-area-summary">
                        <div className="plan-area-item">
                          <span className="plan-area-label">Plot Area</span>
                          <span className="plan-area-value">{(planResult.plotL*planResult.plotB).toFixed(0)} sqft</span>
                        </div>
                        <div className="plan-area-item plan-area-item--accent">
                          <span className="plan-area-label">Built-up ({fp.floorLabel})</span>
                          <span className="plan-area-value">{fp.rooms.reduce((s,r) => s+r.w*r.h, 0).toFixed(1)} sqft</span>
                        </div>
                        {fp.floorIndex===planResult.floors-1 && planResult.floors>1 && (
                          <div className="plan-area-item plan-area-item--total">
                            <span className="plan-area-label">Total Built-up ({planResult.floors} floors)</span>
                            <span className="plan-area-value plan-area-value--big">
                              {planResult.floorPlans.reduce((s,f) => s+f.rooms.reduce((rs,r) => rs+r.w*r.h,0),0).toFixed(1)} sqft
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <p className="plan-legend-note" style={{ marginTop:"0.5rem" }}>
                  ℹ Room dimensions are exactly as entered. This is an indicative layout — consult a licensed civil engineer before construction.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}