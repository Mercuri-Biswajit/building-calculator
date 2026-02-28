// ═══════════════════════════════════════════════════════════════════════════
// BOQ PAGE — Inline styles removed, CSS classes used, scroll-to-top fixed
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { SITE } from "../../config/constants";
import "./_boq-calculator.css"; // adjust path as needed
// import "../styles/pages/_shared-hero.css";

// ─────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────
const ROOM_TYPES = [
  { id: "master-bedroom", icon: "🛏️", name: "Master Bedroom" },
  { id: "bedroom", icon: "🛏️", name: "Bedroom" },
  { id: "hall", icon: "🛋️", name: "Hall / Drawing Room" },
  { id: "dining", icon: "🍽️", name: "Dining Room" },
  { id: "kitchen", icon: "🍳", name: "Kitchen" },
  { id: "toilet", icon: "🚿", name: "Toilet / Bathroom" },
  { id: "balcony", icon: "🏞️", name: "Balcony / Verandah" },
  { id: "store", icon: "📦", name: "Store / Utility" },
  { id: "garage", icon: "🚗", name: "Garage / Parking" },
  { id: "office", icon: "💼", name: "Office Room" },
  { id: "pooja", icon: "🪔", name: "Pooja Room" },
  { id: "servant", icon: "🛏️", name: "Servant Quarter" },
];

const FLOOR_NAMES = [
  "Ground Floor (G)",
  "1st Floor",
  "2nd Floor",
  "3rd Floor",
  "4th Floor",
];

const BRICK_RATES = {
  "1st": [6200, 5800],
  flyash: [5800, 5400],
  aac: [4800, 4500],
};

const BRICK_LABELS = {
  "1st": "1st Class Brick",
  flyash: "Fly Ash Brick",
  aac: "AAC Block",
};

const STEPS = [
  { num: 1, label: "Project Info" },
  { num: 2, label: "Plot & Floors" },
  { num: 3, label: "Rooms" },
  { num: 4, label: "Soil & Grade" },
  { num: 5, label: "BOQ Results" },
];

// ─────────────────────────────────────────────────────────────────────────
// SCROLL TO TOP helper
// ─────────────────────────────────────────────────────────────────────────
function scrollTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ─────────────────────────────────────────────────────────────────────────
// STEP BAR
// ─────────────────────────────────────────────────────────────────────────
function StepBar({ currentStep }) {
  return (
    <div className="boq-step-bar">
      {STEPS.map((s, idx) => {
        const isActive = s.num === currentStep;
        const isDone = s.num < currentStep;
        const cls = ["boq-step", isActive ? "active" : isDone ? "done" : ""]
          .join(" ")
          .trim();
        return (
          <div key={s.num} className={cls}>
            <div className="boq-step-number">{isDone ? "✓" : s.num}</div>
            <span className="boq-step-label">{s.label}</span>
            {idx < STEPS.length - 1 && <div className="boq-step-connector" />}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// FORM HELPERS
// ─────────────────────────────────────────────────────────────────────────
function FormGroup({ label, hint, error, children }) {
  return (
    <div className="boq-form-group">
      <label className="boq-form-label">{label}</label>
      {children}
      {hint && <span className="boq-form-hint">{hint}</span>}
      {error && <span className="boq-form-error">⚠️ {error}</span>}
    </div>
  );
}

function PageHeader({ step, title, desc }) {
  return (
    <div className="boq-page-header">
      <div className="boq-page-step">Step {step}</div>
      <h2 className="boq-page-title">{title}</h2>
      <p className="boq-page-desc">{desc}</p>
    </div>
  );
}

function NavBar({
  onNext,
  onBack,
  hideBack,
  nextLabel = "Continue →",
  nextCta,
}) {
  return (
    <div className="boq-nav-bar">
      {!hideBack && (
        <button className="boq-btn boq-btn-back" onClick={onBack}>
          ← Back
        </button>
      )}
      <button
        className={`boq-btn boq-btn-next${nextCta ? " cta" : ""}`}
        onClick={onNext}
      >
        {nextLabel}
      </button>
    </div>
  );
}

function Banner({ type, children }) {
  return <div className={`boq-banner ${type}`}>{children}</div>;
}

function ResultSection({ icon, title, sub, badge, children }) {
  return (
    <div className="boq-result-section">
      <div className="boq-result-header">
        <div className="boq-result-icon">{icon}</div>
        <div className="boq-result-title-group">
          <h3 className="boq-result-title">{title}</h3>
          {sub && <div className="boq-result-subtitle">{sub}</div>}
        </div>
        {badge && <div className="boq-result-badge">{badge}</div>}
      </div>
      <div className="boq-result-body">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// MAIN CALCULATION (unchanged)
// ─────────────────────────────────────────────────────────────────────────
function runBOQCalculation(formData, floorRooms) {
  const {
    plotL,
    plotW,
    numFloors,
    floorH,
    sbc,
    soilType,
    concGrade,
    steelGrd,
    brickKey,
    sfFront,
    sfBack,
    sfSide,
    hasStair,
  } = formData;

  const plotArea = plotL * plotW;
  const builtL = plotL - 2 * sfSide;
  const builtW = plotW - sfFront - sfBack;
  const builtArea = builtL * builtW;
  const totalBU = builtArea * numFloors;
  const totalH = numFloors * floorH;

  const maxSpan = 4.5;
  const cL = Math.max(2, Math.ceil(builtL / maxSpan) + 1);
  const cW = Math.max(2, Math.ceil(builtW / maxSpan) + 1);
  const totalCols = cL * cW;
  const spanL = builtL / (cL - 1);
  const spanW = builtW / (cW - 1);

  const fck = concGrade === "M20" ? 20 : concGrade === "M25" ? 25 : 30;
  const colLoad = spanL * spanW * 12 * numFloors * 1.5;
  const AgReq = (colLoad * 1000) / (0.4 * fck + 0.67 * 500 * 0.02);
  let colSize = Math.max(
    Math.ceil(Math.sqrt(AgReq) / 50) * 50,
    numFloors <= 2 ? 230 : numFloors <= 3 ? 300 : 375,
  );
  colSize = Math.min(colSize, 600);
  const cornerSz = Math.max(230, colSize - 50);
  const edgeSz = Math.max(230, colSize - 25);
  const numCorner = 4;
  const numEdgeL = Math.max(0, (cL - 2) * 2);
  const numEdgeW = Math.max(0, (cW - 2) * 2);
  const numEdge = numEdgeL + numEdgeW;
  const numInner = Math.max(0, (cL - 2) * (cW - 2));

  const colLoadUnf = colLoad / 1.5;
  const fSzC = Math.max(
    0.9,
    Math.ceil(Math.sqrt((colLoadUnf * 0.6) / sbc) * 10) / 10,
  );
  const fSzE = Math.max(
    1.0,
    Math.ceil(Math.sqrt((colLoadUnf * 0.8) / sbc) * 10) / 10,
  );
  const fSzI = Math.max(1.2, Math.ceil(Math.sqrt(colLoadUnf / sbc) * 10) / 10);
  const soilDepth =
    { black: 1.5, sandy: 1.2, murrum: 1.0, rock: 0.6 }[soilType] || 1.2;
  const ftgThk = Math.max(300, Math.round((fSzI * 100) / 2 / 50) * 50);
  const fVolC = fSzC * fSzC * (ftgThk / 1000) * numCorner;
  const fVolE = fSzE * fSzE * (ftgThk / 1000) * numEdge;
  const fVolI = fSzI * fSzI * ((ftgThk + 50) / 1000) * numInner;
  const fVolTotal = fVolC + fVolE + fVolI;
  const pccVol =
    (fSzC * fSzC * numCorner + fSzE * fSzE * numEdge + fSzI * fSzI * numInner) *
    0.15;

  const mainBD = Math.ceil((Math.max(spanL, spanW) * 1000) / 12 / 50) * 50;
  const mainBB = Math.max(230, Math.ceil((mainBD * 0.4) / 50) * 50);
  const secBD = Math.ceil((Math.min(spanL, spanW) * 1000) / 15 / 50) * 50;
  const secBB = Math.max(230, Math.ceil((secBD * 0.4) / 50) * 50);
  const slabThk = Math.max(
    120,
    Math.ceil((Math.min(spanL, spanW) * 1000) / 32 / 10) * 10,
  );

  const colVol =
    totalCols * (colSize / 1000) * (colSize / 1000) * floorH * numFloors;
  const beamVol =
    (cL * builtW * (mainBB / 1000) * (mainBD / 1000) +
      cW * builtL * (secBB / 1000) * (secBD / 1000)) *
    numFloors;
  const slabVol = builtArea * (slabThk / 1000) * numFloors;

  const plinthBeamLen = cL * (cW - 1) * spanW + cW * (cL - 1) * spanL;
  const plinthBeamVol = plinthBeamLen * 0.23 * 0.45;
  const wallPerim = 2 * (builtL + builtW);
  const dpcArea = wallPerim * 0.23 + builtL * builtW * 0.5;
  const dpcVol = dpcArea * 0.075;
  const totalRCC = fVolTotal + colVol + beamVol + slabVol + plinthBeamVol;
  const earthVol = (builtL + 1) * (builtW + 1) * (soilDepth + 0.3) * 1.2;

  let totalRoomCnt = 0;
  Object.values(floorRooms).forEach((fr) =>
    Object.values(fr).forEach((c) => (totalRoomCnt += c)),
  );
  const intWall = totalRoomCnt * 3.0;
  const wallArea = (wallPerim + intWall * 0.5) * floorH * numFloors;
  const brickVolExt = Math.max(0, wallPerim * floorH * numFloors * 0.85 * 0.23);
  const brickVolInt = Math.max(
    0,
    intWall * 0.5 * floorH * numFloors * 0.85 * 0.115,
  );
  const plInt = wallArea * 1.6;
  const plExt = wallPerim * floorH * numFloors;

  const parapetLen = 2 * (builtL + builtW);
  const parapetVol = parapetLen * 1.0 * 0.115;
  const parapetPlaster = parapetLen * 1.0 * 2;
  const terraceArea = builtArea;

  let totalToilets = 0,
    totalDoors = 0,
    totalWindows = 0;
  Object.values(floorRooms).forEach((fr) =>
    Object.entries(fr).forEach(([id, cnt]) => {
      if (id === "toilet") totalToilets += cnt;
      totalDoors += cnt;
      if (id !== "toilet" && id !== "store") totalWindows += cnt;
    }),
  );
  const toiletWPArea = totalToilets * (4.5 + 4.0);
  totalWindows = Math.ceil(totalWindows * 1.5);

  const steelKg = totalRCC * 90;
  const floorArea = totalBU;
  const [rateExtWall, rateIntWall] = BRICK_RATES[brickKey];

  const boqItems = [
    { sno: "A", desc: "CIVIL WORKS — SUBSTRUCTURE", head: true },
    {
      sno: "A.1",
      desc: "Earthwork excavation in ordinary soil, depth upto 1.5m, all lifts, disposal upto 50m lead",
      unit: "m³",
      qty: earthVol,
      rate: 180,
    },
    {
      sno: "A.2",
      desc: "Anti-termite treatment to bottom & sides of excavation (pre-construction, IS:6313)",
      unit: "m²",
      qty: (builtL + 1) * (builtW + 1),
      rate: 65,
    },
    {
      sno: "A.3",
      desc: "PCC M10 (1:3:6) below footings 150mm thick, curing",
      unit: "m³",
      qty: pccVol,
      rate: 5200,
    },
    {
      sno: "A.4",
      desc: `Isolated RCC ${concGrade} footings incl. formwork & ${steelGrd} TMT reinforcement, curing`,
      unit: "m³",
      qty: fVolTotal,
      rate: 9200,
    },
    {
      sno: "A.5",
      desc: `RCC ${concGrade} plinth beam 230×450mm connecting all column bases incl. formwork & reinforcement`,
      unit: "m³",
      qty: plinthBeamVol,
      rate: 10200,
    },
    {
      sno: "A.6",
      desc: "Damp Proof Course (DPC) 75mm thick CM 1:1.5:3 at plinth level on all walls, including curing",
      unit: "m²",
      qty: dpcArea,
      rate: 185,
    },
    {
      sno: "A.7",
      desc: "Backfilling excavated earth in 150mm layers, watering & compaction to 95% Proctor density",
      unit: "m³",
      qty: earthVol * 0.7,
      rate: 120,
    },

    { sno: "B", desc: "CIVIL WORKS — SUPERSTRUCTURE", head: true },
    {
      sno: "B.1",
      desc: `RCC ${concGrade} columns ${colSize}×${colSize}mm incl. formwork, all ${numFloors} floor(s), H=${totalH.toFixed(1)}m`,
      unit: "m³",
      qty: colVol,
      rate: 10800,
    },
    {
      sno: "B.2",
      desc: `RCC ${concGrade} main beams ${mainBB}×${mainBD}mm & secondary beams ${secBB}×${secBD}mm incl. formwork`,
      unit: "m³",
      qty: beamVol,
      rate: 10200,
    },
    {
      sno: "B.3",
      desc: `RCC ${concGrade} suspended slab ${slabThk}mm thick incl. formwork, props & curing, all floors`,
      unit: "m³",
      qty: slabVol,
      rate: 9800,
    },
    {
      sno: "B.4",
      desc: `${steelGrd} TMT reinforcement in all RCC works incl. bending, binding, placing & binding wire`,
      unit: "MT",
      qty: steelKg / 1000,
      rate: 62000,
    },
    {
      sno: "B.5",
      desc: `${BRICK_LABELS[brickKey]} masonry CM 1:6 — 230mm thick external walls, all floors`,
      unit: "m³",
      qty: brickVolExt,
      rate: rateExtWall,
    },
    {
      sno: "B.6",
      desc: `${BRICK_LABELS[brickKey]} masonry CM 1:4 — 115mm thick internal partition walls, all floors`,
      unit: "m³",
      qty: brickVolInt,
      rate: rateIntWall,
    },
    {
      sno: "B.7",
      desc: `RCC ${concGrade} parapet wall 115mm thick, 1.0m ht on top floor terrace incl. formwork & coping`,
      unit: "m³",
      qty: parapetVol,
      rate: 10500,
    },

    { sno: "C", desc: "FINISHING WORKS", head: true },
    {
      sno: "C.1",
      desc: "12mm cement plaster 1:4 to internal walls & soffits incl. scaffolding, curing",
      unit: "m²",
      qty: plInt,
      rate: 185,
    },
    {
      sno: "C.2",
      desc: "15mm cement plaster 1:6 to external walls incl. scaffolding, chicken mesh at RCC-brick junction",
      unit: "m²",
      qty: plExt + parapetPlaster,
      rate: 210,
    },
    {
      sno: "C.3",
      desc: "Vitrified tiles 600×600mm flooring incl. 25mm CM 1:3 bedding, grouting, curing, all floors",
      unit: "m²",
      qty: floorArea,
      rate: 840,
    },
    ...(totalToilets > 0
      ? [
          {
            sno: "C.4",
            desc: "Vitrified tiles 300×600mm toilet/bathroom wall cladding upto 2.1m ht incl. CM 1:3 fixing",
            unit: "m²",
            qty: totalToilets * 12,
            rate: 780,
          },
        ]
      : []),
    {
      sno: "C.5",
      desc: "Acrylic waterproofing treatment 2 coats on terrace slab (exposed)",
      unit: "m²",
      qty: terraceArea,
      rate: 165,
    },
    ...(totalToilets > 0
      ? [
          {
            sno: "C.6",
            desc: "Integral cement waterproofing in toilets/bathrooms — floor & 300mm wall upstand",
            unit: "m²",
            qty: toiletWPArea,
            rate: 145,
          },
        ]
      : []),
    {
      sno: "C.7",
      desc: "Emulsion paint 2 coats over 1 coat primer — internal plastered surfaces",
      unit: "m²",
      qty: plInt,
      rate: 128,
    },
    {
      sno: "C.8",
      desc: "Exterior weather-shield paint 2 coats over primer — external surfaces & parapet",
      unit: "m²",
      qty: plExt + parapetPlaster,
      rate: 148,
    },
    {
      sno: "C.9",
      desc: "Cement plinth skirting 50mm ht × 10mm thk, neat cement finish",
      unit: "m",
      qty: (wallPerim + intWall * 0.5) * numFloors,
      rate: 32,
    },

    { sno: "D", desc: "DOORS, WINDOWS & MEP SERVICES", head: true },
    {
      sno: "D.1",
      desc: "Panelled flush door 1.0×2.1m, sal wood frame 100×75mm with SS fittings, 2 coats enamel paint",
      unit: "Nos",
      qty: totalDoors + 2,
      rate: 8500,
    },
    {
      sno: "D.2",
      desc: "Aluminium sliding window 1.2×1.2m with mosquito mesh & painted MS grills",
      unit: "Nos",
      qty: totalWindows,
      rate: 6200,
    },
    ...(hasStair && numFloors > 1
      ? [
          {
            sno: "D.3",
            desc: `RCC staircase M20 (waist slab type) incl. all materials, nosing tiles, handrail & finishing`,
            unit: "LS",
            qty: 1,
            rate: (numFloors - 1) * 50000,
          },
        ]
      : []),
    ...(totalToilets > 0
      ? [
          {
            sno: "D.4",
            desc: "Sanitary fittings — EWC, washbasin, CP taps, shower set, PTMT fittings per toilet/bathroom",
            unit: "Nos",
            qty: totalToilets,
            rate: 28000,
          },
        ]
      : []),
    {
      sno: "D.5",
      desc: "Concealed electrical conduit & wiring, MCB DB, switches, sockets, earthing (IS:732, CPWD spec)",
      unit: "Floor",
      qty: numFloors,
      rate: 75000,
    },
    {
      sno: "D.6",
      desc: "CPVC water supply piping, UPVC drainage system, PVC overhead tank connection (IS:4985)",
      unit: "Floor",
      qty: numFloors,
      rate: 55000,
    },
    {
      sno: "D.7",
      desc: "PVC Sintex overhead water tank 10,000L with MS structural staging, ball valve & plumbing",
      unit: "Nos",
      qty: 1,
      rate: 48000,
    },
    {
      sno: "D.8",
      desc: "Compound wall 1.5m ht — brick masonry on RCC strip footing, plaster both sides, colour wash",
      unit: "m",
      qty: Math.max(0, 2 * (plotL + plotW) - 4),
      rate: 3200,
    },
    {
      sno: "D.9",
      desc: "Main gate — MS fabricated gate with angle iron frame, 2 coats primer + enamel paint",
      unit: "Nos",
      qty: 1,
      rate: 18000,
    },
  ];

  let subTotal = 0;
  boqItems.forEach((i) => {
    if (!i.head && +i.qty > 0) subTotal += +i.qty * +i.rate;
  });
  const contingency = subTotal * 0.03;
  const overhead = subTotal * 0.12;
  const gst = (subTotal + overhead) * 0.12;
  const grandTotal = subTotal + contingency + overhead + gst;
  const floorStr = numFloors === 1 ? "G" : `G+${numFloors - 1}`;

  return {
    boqItems,
    subTotal,
    contingency,
    overhead,
    gst,
    grandTotal,
    plotArea,
    builtArea,
    totalBU,
    totalH,
    totalCols,
    cL,
    cW,
    spanL,
    spanW,
    colSize,
    cornerSz,
    edgeSz,
    numCorner,
    numEdge,
    numInner,
    fSzC,
    fSzE,
    fSzI,
    soilDepth,
    ftgThk,
    totalRCC,
    steelKg,
    brickVolExt,
    brickVolInt,
    plInt,
    plExt,
    slabThk,
    floorArea,
    terraceArea,
    toiletWPArea,
    floorStr,
    mainBB,
    mainBD,
    secBB,
    secBD,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// PAGES
// ─────────────────────────────────────────────────────────────────────────
function Page1({ data, setData, onNext }) {
  const [errors, setErrors] = useState({});
  const validate = () => {
    const e = {};
    if (!data.projName.trim()) e.projName = "Building name required";
    if (!data.ownerName.trim()) e.ownerName = "Owner name required";
    if (!data.location.trim()) e.location = "Location required";
    if (!data.engName.trim()) e.engName = "Engineer name required";
    setErrors(e);
    if (Object.keys(e).length === 0) {
      scrollTop();
      onNext();
    }
  };

  const field = (key, errKey) => (
    <input
      className={`boq-input${errors[errKey] ? " error" : ""}`}
      value={data[key]}
      onChange={(e) => setData((p) => ({ ...p, [key]: e.target.value }))}
    />
  );

  return (
    <div>
      <PageHeader
        step="01"
        title="Project Details"
        desc="This information will appear in your official BOQ document"
      />
      <div className="boq-form-grid-2">
        <FormGroup label="Project / Building Name *" error={errors.projName}>
          <input
            className={`boq-input${errors.projName ? " error" : ""}`}
            value={data.projName}
            onChange={(e) =>
              setData((p) => ({ ...p, projName: e.target.value }))
            }
            placeholder="e.g. Kumar Residence"
          />
        </FormGroup>
        <FormGroup label="Owner Name *" error={errors.ownerName}>
          <input
            className={`boq-input${errors.ownerName ? " error" : ""}`}
            value={data.ownerName}
            onChange={(e) =>
              setData((p) => ({ ...p, ownerName: e.target.value }))
            }
            placeholder="e.g. Rajesh Kumar"
          />
        </FormGroup>
        <FormGroup label="Project Location / Address *" error={errors.location}>
          <input
            className={`boq-input${errors.location ? " error" : ""}`}
            value={data.location}
            onChange={(e) =>
              setData((p) => ({ ...p, location: e.target.value }))
            }
            placeholder="e.g. Salt Lake, Kolkata - 700091"
          />
        </FormGroup>
        <FormGroup label="Date of Estimate">
          <input
            type="date"
            className="boq-input"
            value={data.estDate}
            onChange={(e) =>
              setData((p) => ({ ...p, estDate: e.target.value }))
            }
          />
        </FormGroup>
        <FormGroup
          label="Prepared By (Engineer / Firm) *"
          error={errors.engName}
        >
          <input
            className={`boq-input${errors.engName ? " error" : ""}`}
            value={data.engName}
            onChange={(e) =>
              setData((p) => ({ ...p, engName: e.target.value }))
            }
            placeholder="e.g. Er. Sunil Sharma, M.Tech Civil"
          />
        </FormGroup>
        <FormGroup label="Building Use">
          <select
            className="boq-select"
            value={data.bldUse}
            onChange={(e) => setData((p) => ({ ...p, bldUse: e.target.value }))}
          >
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Mixed Use">Mixed Use</option>
          </select>
        </FormGroup>
      </div>
      <FormGroup
        label="Drawing Reference No. (optional)"
        hint="This will be printed in the BOQ as 'As per Drawing No.'"
      >
        <input
          className="boq-input"
          value={data.drawingRef}
          onChange={(e) =>
            setData((p) => ({ ...p, drawingRef: e.target.value }))
          }
          placeholder="e.g. Drg. No. AR-01/2024"
        />
      </FormGroup>
      <NavBar onNext={validate} hideBack />
    </div>
  );
}

function Page2({ data, setData, onNext, onBack }) {
  const [errors, setErrors] = useState({});
  const validate = () => {
    const e = {};
    if (!data.plotL || data.plotL < 3)
      e.plotL = "Valid length required (min 3m)";
    if (!data.plotW || data.plotW < 3)
      e.plotW = "Valid width required (min 3m)";
    if (data.useSetback) {
      const bL = data.plotL - 2 * data.sfSide;
      const bW = data.plotW - data.sfFront - data.sfBack;
      if (bL < 3 || bW < 3)
        e.setback = "Built-up area is too small. Please reduce setback values.";
    }
    setErrors(e);
    if (Object.keys(e).length === 0) {
      scrollTop();
      onNext();
    }
  };

  return (
    <div>
      <PageHeader
        step="02"
        title="Plot Dimensions & Floors"
        desc="Column grid and structural layout will be calculated automatically"
      />
      <div className="boq-form-grid-3">
        <FormGroup label="Plot Length (m) *" error={errors.plotL}>
          <input
            type="number"
            className={`boq-input${errors.plotL ? " error" : ""}`}
            value={data.plotL || ""}
            onChange={(e) => setData((p) => ({ ...p, plotL: +e.target.value }))}
            placeholder="e.g. 12"
            step="0.5"
            min="3"
          />
        </FormGroup>
        <FormGroup label="Plot Width (m) *" error={errors.plotW}>
          <input
            type="number"
            className={`boq-input${errors.plotW ? " error" : ""}`}
            value={data.plotW || ""}
            onChange={(e) => setData((p) => ({ ...p, plotW: +e.target.value }))}
            placeholder="e.g. 9"
            step="0.5"
            min="3"
          />
        </FormGroup>
        <FormGroup label="Number of Floors">
          <select
            className="boq-select"
            value={data.numFloors}
            onChange={(e) =>
              setData((p) => ({ ...p, numFloors: +e.target.value }))
            }
          >
            <option value={1}>G (Ground Only)</option>
            <option value={2}>G+1</option>
            <option value={3}>G+2</option>
            <option value={4}>G+3</option>
            <option value={5}>G+4</option>
          </select>
        </FormGroup>
        <FormGroup label="Floor Height">
          <select
            className="boq-select"
            value={data.floorH}
            onChange={(e) =>
              setData((p) => ({ ...p, floorH: +e.target.value }))
            }
          >
            <option value={2.75}>2.75 m (Economy)</option>
            <option value={3.0}>3.0 m (Standard)</option>
            <option value={3.2}>3.2 m (Premium)</option>
            <option value={3.5}>3.5 m (High Ceiling)</option>
          </select>
        </FormGroup>
        <FormGroup label="Staircase">
          <select
            className="boq-select"
            value={data.hasStair ? "yes" : "no"}
            onChange={(e) =>
              setData((p) => ({ ...p, hasStair: e.target.value === "yes" }))
            }
          >
            <option value="yes">Yes — Internal RCC</option>
            <option value="no">No Staircase</option>
          </select>
        </FormGroup>
      </div>

      <label
        className={`boq-checkbox-toggle${data.useSetback ? " checked" : ""}`}
      >
        <input
          type="checkbox"
          checked={data.useSetback}
          onChange={(e) =>
            setData((p) => ({ ...p, useSetback: e.target.checked }))
          }
        />
        <span className="boq-checkbox-toggle-label">
          ➕ Add Setback / Marginal Distances (optional)
        </span>
      </label>

      {data.useSetback && (
        <div className="boq-setback-box">
          <FormGroup label="Setback Front (m)">
            <input
              type="number"
              className="boq-input"
              value={data.sfFront}
              onChange={(e) =>
                setData((p) => ({ ...p, sfFront: +e.target.value }))
              }
              step="0.5"
              min="0"
            />
          </FormGroup>
          <FormGroup label="Setback Back (m)">
            <input
              type="number"
              className="boq-input"
              value={data.sfBack}
              onChange={(e) =>
                setData((p) => ({ ...p, sfBack: +e.target.value }))
              }
              step="0.5"
              min="0"
            />
          </FormGroup>
          <FormGroup label="Setback Side each (m)">
            <input
              type="number"
              className="boq-input"
              value={data.sfSide}
              onChange={(e) =>
                setData((p) => ({ ...p, sfSide: +e.target.value }))
              }
              step="0.5"
              min="0"
            />
          </FormGroup>
        </div>
      )}
      {errors.setback && <Banner type="err">{errors.setback}</Banner>}
      <NavBar
        onNext={validate}
        onBack={() => {
          scrollTop();
          onBack();
        }}
      />
    </div>
  );
}

function Page3({ data, floorRooms, setFloorRooms, onNext, onBack }) {
  const [activeFloor, setActiveFloor] = useState(0);
  const [error, setError] = useState(false);
  const floors = Array.from({ length: data.numFloors }, (_, i) => i);

  const toggleRoom = (f, roomId) => {
    setFloorRooms((prev) => {
      const next = { ...prev, [f]: { ...(prev[f] || {}) } };
      if (next[f][roomId]) delete next[f][roomId];
      else next[f][roomId] = 1;
      return next;
    });
    setError(false);
  };

  const updateCount = (f, roomId, val) =>
    setFloorRooms((prev) => ({
      ...prev,
      [f]: { ...(prev[f] || {}), [roomId]: Math.max(1, val) },
    }));

  const validate = () => {
    const hasAny = Object.values(floorRooms).some(
      (fr) => Object.keys(fr).length > 0,
    );
    setError(!hasAny);
    if (hasAny) {
      scrollTop();
      onNext();
    }
  };

  return (
    <div>
      <PageHeader
        step="03"
        title="Rooms — For Each Floor"
        desc="Select floor tab, choose rooms, and set counts"
      />

      <div className="boq-floor-tabs">
        {floors.map((f) => (
          <button
            key={f}
            className={`boq-floor-tab${activeFloor === f ? " active" : ""}`}
            onClick={() => setActiveFloor(f)}
          >
            {FLOOR_NAMES[f] || `Floor ${f}`}
          </button>
        ))}
      </div>

      <div className="boq-room-grid">
        {ROOM_TYPES.map((rt) => {
          const selected = !!floorRooms[activeFloor]?.[rt.id];
          return (
            <div
              key={rt.id}
              className={`boq-room-card${selected ? " selected" : ""}`}
              onClick={() => toggleRoom(activeFloor, rt.id)}
            >
              <span className="boq-room-icon">{rt.icon}</span>
              <span className="boq-room-name">{rt.name}</span>
              <div className="boq-room-check">✓</div>
            </div>
          );
        })}
      </div>

      {Object.keys(floorRooms[activeFloor] || {}).length > 0 && (
        <div className="boq-selected-rooms">
          {Object.entries(floorRooms[activeFloor] || {}).map(
            ([roomId, cnt]) => {
              const rt = ROOM_TYPES.find((r) => r.id === roomId);
              return (
                <div key={roomId} className="boq-room-badge">
                  <span className="boq-room-badge-name">
                    {rt?.icon} {rt?.name}
                  </span>
                  <span className="boq-room-badge-multiply">×</span>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={cnt}
                    onChange={(e) =>
                      updateCount(activeFloor, roomId, +e.target.value)
                    }
                    className="boq-room-badge-input"
                  />
                </div>
              );
            },
          )}
        </div>
      )}

      {error && (
        <Banner type="err">
          ⚠️ At least one room must be selected on at least one floor!
        </Banner>
      )}
      <Banner type="info">
        💡 Need multiple rooms of the same type? Just increase the count field —
        for example, 3 bedrooms → count = 3
      </Banner>
      <NavBar
        onNext={validate}
        onBack={() => {
          scrollTop();
          onBack();
        }}
      />
    </div>
  );
}

function Page4({ data, setData, onNext, onBack }) {
  const soilWarn =
    ((data.soilType === "rock" || data.soilType === "murrum") &&
      data.sbc < 150) ||
    ((data.soilType === "black" || data.soilType === "sandy") &&
      data.sbc > 250);

  const soilOpts = [
    {
      key: "black",
      icon: "⬛",
      label: "Black Cotton",
      desc: "Expansive, deep footing",
    },
    { key: "sandy", icon: "🟡", label: "Sandy Soil", desc: "Standard footing" },
    { key: "murrum", icon: "🟤", label: "Murrum / Hard", desc: "Good SBC" },
    { key: "rock", icon: "⛰️", label: "Rock", desc: "Minimal footing depth" },
  ];

  const brickHint = `PWD Rate: ₹${BRICK_RATES[data.brickKey][0].toLocaleString("en-IN")}/m³ (ext) · ₹${BRICK_RATES[data.brickKey][1].toLocaleString("en-IN")}/m³ (int)`;

  return (
    <div>
      <PageHeader
        step="04"
        title="Soil & Structural Parameters"
        desc="Footing size, depth and column sizes will be determined from these (IS:456)"
      />

      <div style={{ maxWidth: 500, marginBottom: "2rem" }}>
        <FormGroup label="Safe Bearing Capacity — SBC (kN/m²)">
          <select
            className="boq-select"
            value={data.sbc}
            onChange={(e) => setData((p) => ({ ...p, sbc: +e.target.value }))}
          >
            <option value={50}>50 — Very Soft Clay</option>
            <option value={75}>75 — Soft Clay</option>
            <option value={100}>100 — Medium Clay</option>
            <option value={150}>150 — Stiff Clay / Loose Sand</option>
            <option value={200}>200 — Dense Sand</option>
            <option value={300}>300 — Hard Murrum</option>
            <option value={400}>400 — Rock</option>
          </select>
        </FormGroup>
      </div>

      <div className="boq-soil-section-label">Soil Type</div>
      <div className="boq-soil-grid">
        {soilOpts.map((o) => (
          <div
            key={o.key}
            className={`boq-soil-card${data.soilType === o.key ? " selected" : ""}`}
            onClick={() => setData((p) => ({ ...p, soilType: o.key }))}
          >
            <div className="boq-soil-icon">{o.icon}</div>
            <div className="boq-soil-label">{o.label}</div>
            <div className="boq-soil-desc">{o.desc}</div>
          </div>
        ))}
      </div>

      {soilWarn && (
        <Banner type="warn">
          ⚠️ <strong>Soil Type and SBC inconsistency:</strong> Please verify
          your soil data.
        </Banner>
      )}

      <div className="boq-struct-grid">
        <FormGroup label="Concrete Grade (Structural)">
          <select
            className="boq-select"
            value={data.concGrade}
            onChange={(e) =>
              setData((p) => ({ ...p, concGrade: e.target.value }))
            }
          >
            <option value="M20">M20 — Standard (IS min.)</option>
            <option value="M25">M25 — Preferred</option>
            <option value="M30">M30 — High Rise</option>
          </select>
        </FormGroup>
        <FormGroup label="Steel Grade">
          <select
            className="boq-select"
            value={data.steelGrd}
            onChange={(e) =>
              setData((p) => ({ ...p, steelGrd: e.target.value }))
            }
          >
            <option value="Fe415">Fe415</option>
            <option value="Fe500">Fe500 TMT</option>
            <option value="Fe550">Fe550</option>
          </select>
        </FormGroup>
        <FormGroup label="Brick / Block Type" hint={brickHint}>
          <select
            className="boq-select"
            value={data.brickKey}
            onChange={(e) =>
              setData((p) => ({ ...p, brickKey: e.target.value }))
            }
          >
            <option value="1st">1st Class Brick</option>
            <option value="flyash">Fly Ash Brick</option>
            <option value="aac">AAC Block</option>
          </select>
        </FormGroup>
      </div>

      <NavBar
        onNext={() => {
          scrollTop();
          onNext();
        }}
        onBack={() => {
          scrollTop();
          onBack();
        }}
        nextLabel="⚙️ GENERATE FULL BOQ"
        nextCta
      />
    </div>
  );
}

function Page5({ formData, result, onRestart }) {
  const fmt = (n) => Math.round(n).toLocaleString("en-IN");
  const fmtD = (n, d = 2) => (+n).toFixed(d);
  const { boqItems, subTotal, contingency, overhead, gst, grandTotal } = result;

  return (
    <div>
      <div className="boq-results-actions">
        <button className="boq-btn-download" onClick={() => window.print()}>
          ⬇️ Download BOQ (PDF)
        </button>
        <button className="boq-btn-restart" onClick={onRestart}>
          ← New Estimate
        </button>
        <span className="boq-results-note">Print dialog → "Save as PDF"</span>
      </div>

      <div className="boq-summary-card">
        <div>
          <div className="boq-summary-eyebrow">
            Official Estimate &amp; Bill of Quantities
          </div>
          <h2 className="boq-summary-title">{formData.projName}</h2>
          <div className="boq-summary-meta">
            {[
              ["Owner", formData.ownerName],
              ["Location", formData.location],
              ["Date", formData.estDate],
              ["Prepared By", formData.engName],
              ["Type", `${formData.bldUse} · ${result.floorStr}`],
              ["Grade", `${formData.concGrade} / ${formData.steelGrd}`],
            ].map(([lbl, val]) => (
              <div key={lbl} className="boq-summary-meta-item">
                <span className="boq-summary-meta-label">{lbl}</span>
                <span className="boq-summary-meta-value">{val}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="boq-summary-cost">
          <div className="boq-summary-cost-label">Total Project Cost</div>
          <div className="boq-summary-cost-value">
            ₹{(grandTotal / 100000).toFixed(2)} L
          </div>
          <div className="boq-summary-cost-sub">
            ≈ ₹
            {Math.round(grandTotal / result.totalBU / 10.764).toLocaleString(
              "en-IN",
            )}
            /sqft
          </div>
        </div>
      </div>

      <ResultSection
        icon="📐"
        title="Structural Summary"
        sub="Areas, floors, bay spans"
      >
        <div className="boq-stats-grid">
          {[
            [
              "Plot Area",
              result.plotArea.toFixed(1) + " m²",
              (result.plotArea * 10.764).toFixed(0) + " sqft",
            ],
            [
              "Built-up/Floor",
              result.builtArea.toFixed(1) + " m²",
              (result.builtArea * 10.764).toFixed(0) + " sqft",
            ],
            [
              "Total Built-up",
              result.totalBU.toFixed(1) + " m²",
              (result.totalBU * 10.764).toFixed(0) + " sqft",
            ],
            ["Building Ht.", result.totalH.toFixed(2) + " m", result.floorStr],
            [
              "Column Grid",
              result.cL + "×" + result.cW,
              result.totalCols + " columns",
            ],
            [
              "Bay Span",
              result.spanL.toFixed(2) + "×" + result.spanW.toFixed(2) + " m",
              "L × W",
            ],
          ].map(([label, value, sub]) => (
            <div key={label} className="boq-stat-box">
              <span className="boq-stat-value">{value}</span>
              <div className="boq-stat-label">{label}</div>
              {sub && <div className="boq-stat-sub">{sub}</div>}
            </div>
          ))}
        </div>
      </ResultSection>

      <ResultSection icon="📦" title="Material Quantities Summary">
        <div className="boq-stats-grid">
          {[
            ["Total RCC", result.totalRCC.toFixed(2) + " m³", "All works"],
            [
              "Total Steel",
              (result.steelKg / 1000).toFixed(3) + " MT",
              result.steelKg.toFixed(0) + " kg",
            ],
            [
              "Brickwork Ext",
              result.brickVolExt.toFixed(2) + " m³",
              "230mm walls",
            ],
            [
              "Brickwork Int",
              result.brickVolInt.toFixed(2) + " m³",
              "115mm walls",
            ],
            [
              "Plastering",
              (result.plInt + result.plExt).toFixed(0) + " m²",
              "Int+Ext",
            ],
            ["Slab Thk.", result.slabThk + " mm", "Two-way"],
            ["Flooring", result.floorArea.toFixed(0) + " m²", "All floors"],
            [
              "Waterproofing",
              (result.terraceArea + result.toiletWPArea).toFixed(0) + " m²",
              "Terrace+Toilet",
            ],
          ].map(([label, value, sub]) => (
            <div key={label} className="boq-stat-box">
              <span className="boq-stat-value">{value}</span>
              <div className="boq-stat-label">{label}</div>
              {sub && <div className="boq-stat-sub">{sub}</div>}
            </div>
          ))}
        </div>
      </ResultSection>

      <ResultSection
        icon="📋"
        title="Bill of Quantities (BOQ)"
        sub="PWD West Bengal Schedule of Rates 2024"
        badge="WB PWD SOR 2024"
      >
        <Banner type="info">
          📌 <strong>PWD West Bengal SOR 2024</strong> — Rates inclusive of
          materials, labour &amp; T&amp;P. GST @12% extra as applicable.
        </Banner>

        <div className="boq-table-wrapper" style={{ marginTop: "1rem" }}>
          <table className="boq-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Description of Work</th>
                <th>Unit</th>
                <th>Qty</th>
                <th>Rate (₹)</th>
                <th>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {boqItems.map((item, idx) => {
                if (item.head)
                  return (
                    <tr key={idx} className="section-row">
                      <td colSpan={6}>
                        {item.sno}. {item.desc}
                      </td>
                    </tr>
                  );
                if (+item.qty <= 0) return null;
                const amt = +item.qty * +item.rate;
                return (
                  <tr key={idx}>
                    <td className="td-sno">{item.sno}</td>
                    <td className="td-desc">{item.desc}</td>
                    <td className="td-num">{item.unit}</td>
                    <td className="td-num">{fmtD(item.qty)}</td>
                    <td className="td-num">
                      {item.rate.toLocaleString("en-IN")}
                    </td>
                    <td className="td-amount">₹{fmt(amt)}</td>
                  </tr>
                );
              })}
              {[
                ["Sub Total (A+B+C+D)", subTotal],
                ["Contingency @ 3%", contingency],
                ["Contractor Overhead & Profit @ 12%", overhead],
                ["GST @ 12% on work value", gst],
              ].map(([label, val]) => (
                <tr key={label} className="subtotal-row">
                  <td colSpan={5}>{label}</td>
                  <td>₹{fmt(val)}</td>
                </tr>
              ))}
              <tr className="total-row">
                <td colSpan={5}>GRAND TOTAL ESTIMATE</td>
                <td>
                  ₹
                  {(Math.round(grandTotal / 10000) * 10000).toLocaleString(
                    "en-IN",
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="boq-banner-notes">
          <strong>Important Notes:</strong>
          <br />
          1. Rates as per PWD West Bengal SOR 2024. Actual rates may vary by
          location &amp; season.
          <br />
          2. Structural design is indicative per IS:456. Final design by
          licensed Structural Engineer mandatory.
          <br />
          3. SBC assumed {formData.sbc} kN/m². Verify with Soil Investigation
          Report / Bore Log.
          <br />
          {formData.drawingRef && <>4. As per {formData.drawingRef}. </>}
          Estimate prepared by: {formData.engName}.<br />
          5. GST, approval charges, architect fees &amp; landscaping not
          included.
        </div>
      </ResultSection>
    </div>
  );
}

function LoadingOverlay({ show }) {
  if (!show) return null;
  return (
    <div className="boq-loading-overlay">
      <div className="boq-loading-card">
        <span className="boq-loading-icon">⚙️</span>
        <div className="boq-loading-title">Calculating…</div>
        <p className="boq-loading-desc">Running IS:456 structural analysis</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────
export default function BOQPage() {
  const today = new Date().toISOString().split("T")[0];
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [formData, setFormData] = useState({
    projName: "",
    ownerName: "",
    location: "",
    estDate: today,
    engName: "",
    bldUse: "Residential",
    drawingRef: "",
    plotL: null,
    plotW: null,
    numFloors: 2,
    floorH: 3.0,
    hasStair: true,
    useSetback: false,
    sfFront: 1.5,
    sfBack: 1.0,
    sfSide: 1.0,
    sbc: 150,
    soilType: "black",
    concGrade: "M20",
    steelGrd: "Fe500",
    brickKey: "1st",
  });

  const initRooms = {};
  for (let i = 0; i < formData.numFloors; i++) initRooms[i] = {};
  const [floorRooms, setFloorRooms] = useState(initRooms);

  const goTo = (n) => {
    setStep(n);
    scrollTop();
  };

  const handleGenerate = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      const res = runBOQCalculation(formData, floorRooms);
      setResult(res);
      setLoading(false);
      setStep(5);
      scrollTop();
    }, 2400);
  }, [formData, floorRooms]);

  const handleRestart = () => {
    setStep(1);
    setResult(null);
    const rooms = {};
    for (let i = 0; i < formData.numFloors; i++) rooms[i] = {};
    setFloorRooms(rooms);
    scrollTop();
  };

  const setDataAndFloors = (updater) => {
    setFormData((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (next.numFloors !== prev.numFloors) {
        const rooms = {};
        for (let i = 0; i < next.numFloors; i++) rooms[i] = {};
        setFloorRooms(rooms);
      }
      return next;
    });
  };

  return (
    <>
      <Helmet>
        <title>BOQ Generator | {SITE.name}</title>
        <meta
          name="description"
          content="Complete Bill of Quantities generator — IS:456 compliant, PWD West Bengal SOR 2024 rates. Substructure, superstructure, finishing & MEP."
        />
        <link rel="canonical" href={`${SITE.url}/boq`} />
      </Helmet>

      <div className="calc-page">
        {/* ── HERO ── */}
        <section className="sh-hero">
          <div className="sh-hero-left">
            <div className="sh-badge">
              <span className="sh-badge-icon">🏗️</span>
              <span>PWD WEST BENGAL SOR 2024 · IS:456 COMPLIANT</span>
            </div>
            <h1 className="sh-title">
              Smart BOQ
              <br />
              <span className="sh-title-accent">Generator</span>
            </h1>
            <p className="sh-subtitle">
              Complete Bill of Quantities — Substructure, Superstructure,
              Finishing &amp; MEP. 5-step wizard → auto structural sizing → full
              PWD SOR 2024 cost sheet.
            </p>
            <div className="sh-pills">
              {["IS:456", "NBC 2016", "WB PWD 2024", "GST Ready"].map((tag) => (
                <span key={tag} className="sh-pill">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="sh-hero-right">
            <div className="sh-stats-row">
              <div className="sh-stat sh-stat-accent">
                <div className="sh-stat-icon">₹</div>
                <div className="sh-stat-value">5-Step</div>
                <div className="sh-stat-label">Wizard</div>
              </div>
              <div className="sh-stat">
                <div className="sh-stat-icon">🛡</div>
                <div className="sh-stat-value">IS 456</div>
                <div className="sh-stat-label">:2000 Compliant</div>
              </div>
            </div>
            <div className="sh-features">
              {[
                {
                  icon: "⚙️",
                  title: "Auto Structural Sizing",
                  sub: "Column grid, beam & slab auto-design",
                },
                {
                  icon: "📋",
                  title: "Full BOQ with Rates",
                  sub: "PWD WB SOR 2024 item-wise rates",
                },
                {
                  icon: "🖨️",
                  title: "Print-Ready PDF",
                  sub: "Export official BOQ document",
                },
              ].map((f) => (
                <div key={f.title} className="sh-feature-item">
                  <div className="sh-feature-icon">{f.icon}</div>
                  <div className="sh-feature-text">
                    <div className="sh-feature-title">{f.title}</div>
                    <div className="sh-feature-sub">{f.sub}</div>
                  </div>
                  <div className="sh-feature-arrow">›</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MAIN ── */}
        <main className="boq-main calc-main">
          <LoadingOverlay show={loading} />
          <StepBar currentStep={step} />

          {step === 1 && (
            <Page1
              data={formData}
              setData={setFormData}
              onNext={() => goTo(2)}
            />
          )}
          {step === 2 && (
            <Page2
              data={formData}
              setData={setDataAndFloors}
              onNext={() => goTo(3)}
              onBack={() => goTo(1)}
            />
          )}
          {step === 3 && (
            <Page3
              data={formData}
              floorRooms={floorRooms}
              setFloorRooms={setFloorRooms}
              onNext={() => goTo(4)}
              onBack={() => goTo(2)}
            />
          )}
          {step === 4 && (
            <Page4
              data={formData}
              setData={setFormData}
              onNext={handleGenerate}
              onBack={() => goTo(3)}
            />
          )}
          {step === 5 && result && (
            <Page5
              formData={formData}
              result={result}
              onRestart={handleRestart}
            />
          )}
        </main>
      </div>
    </>
  );
}
