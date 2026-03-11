import React from "react";
import { useUnit } from "../../context/UnitContext";
import "./BrickMasonryResults.css";

export function BrickMasonryResults({ results: r }) {
  const { displayArea, getAreaLabel, getLengthLabel } = useUnit();

  return (
    <div className="brick-results-container">
      <div className="calc-struct-section">
        <h4 className="calc-struct-section-title">
          <span>📐</span> Area Breakdown
        </h4>
        <div className="calc-struct-grid">
          <StructCard
            icon="📏"
            title="Perimeter"
            value={`${r.perimeter} ${getLengthLabel()}`}
            sub={`${r.floors} floor${r.floors > 1 ? "s" : ""}`}
          />
          <StructCard
            icon="🏗️"
            title="Gross Wall Area"
            value={`${displayArea(r.grossAreaTotal)} ${getAreaLabel()}`}
            sub={`${displayArea(r.grossAreaPerFloor)} ${getAreaLabel()} / floor`}
          />
          <StructCard
            icon="🚪"
            title="Total Deductions"
            value={`${displayArea(r.totalDeductionAllFloors)} ${getAreaLabel()}`}
            sub={`Doors + Windows + Extra`}
          />
          <StructCard
            icon="✅"
            title="Net Wall Area"
            value={`${displayArea(r.netArea)} ${getAreaLabel()}`}
            sub={`${r.netAreaM2} sq.m`}
          />
        </div>

        {/* Deduction breakdown */}
        <div className="calc-detail-grid" style={{ marginTop: "0.75rem" }}>
          <DetailItem
            label="Door Area (all floors)"
            value={`${displayArea(r.doorArea * r.floors)} ${getAreaLabel()}`}
          />
          <DetailItem
            label="Window Area (all floors)"
            value={`${displayArea(r.windowArea * r.floors)} ${getAreaLabel()}`}
          />
          {r.extraDeduction > 0 && (
            <DetailItem
              label="Extra Deduction (all floors)"
              value={`${displayArea(r.extraDeduction * r.floors)} ${getAreaLabel()}`}
            />
          )}
          <DetailItem
            label="Brickwork Volume"
            value={`${r.brickworkVolCum} cum`}
          />
        </div>
      </div>

      <div className="calc-card brick-qty-card">
        <h4 className="calc-card-subtitle">
          <span>🧱</span> Material Requirements — Superstructure
        </h4>
        <div className="calc-highlight-grid">
          <HighlightCard
            label="Bricks Required (Net)"
            value={r.bricksNet.toLocaleString("en-IN")}
            unit="nos"
            modifier="primary"
          />
          <HighlightCard
            label="Bricks with Wastage"
            value={r.bricksWithWaste.toLocaleString("en-IN")}
            unit="nos"
            modifier="accent"
            note={`+${r.wastageCount.toLocaleString("en-IN")} for wastage`}
          />
          <HighlightCard
            label="Cement (Mortar)"
            value={r.cementBags}
            unit="bags (50 kg)"
            modifier="purple"
          />
          <HighlightCard
            label="Sand (Mortar)"
            value={r.sandCft}
            unit="cft"
            modifier="green"
          />
        </div>
        <div className="calc-detail-grid brick-detail-grid">
          <DetailItem label="Brick Type" value={r.brickLabel} />
          <DetailItem label="Bricks per cum" value={`${r.bricksPerCum} nos`} />
          <DetailItem label="Mortar Volume" value={`${r.mortarVolCum} cum`} />
          <DetailItem label="Mortar Mix" value={`CM ${r.mortarRatio}`} />
          <DetailItem label="Wall Thickness" value={r.wallThicknessLabel} />
        </div>
      </div>

      {r.includeFoundation && r.foundationVolCum > 0 && (
        <div className="calc-card brick-foundation-card">
          <h4 className="calc-card-subtitle">
            <span>🏗️</span> Material Requirements — Foundation
          </h4>
          <div className="calc-detail-grid" style={{ marginBottom: "0.75rem" }}>
            <DetailItem
              label="Foundation Depth"
              value={`${r.foundationDepthFt} ft`}
            />
            <DetailItem
              label="Foundation Width"
              value={`${r.foundationWidthIn}"`}
            />
            <DetailItem
              label="Foundation Volume"
              value={`${r.foundationVolCum} cum`}
            />
            <DetailItem
              label="Mortar Volume"
              value={`${r.foundationMortarVolCum} cum`}
            />
          </div>
          <div className="calc-highlight-grid">
            <HighlightCard
              label="Foundation Bricks (Net)"
              value={r.foundationBricksNet.toLocaleString("en-IN")}
              unit="nos"
              modifier="primary"
            />
            <HighlightCard
              label="Bricks with Wastage"
              value={r.foundationBricksWithWaste.toLocaleString("en-IN")}
              unit="nos"
              modifier="accent"
              note={`+${r.foundationWastageCount.toLocaleString("en-IN")} for wastage`}
            />
            <HighlightCard
              label="Cement (Mortar)"
              value={r.foundationCementBags}
              unit="bags (50 kg)"
              modifier="purple"
            />
            <HighlightCard
              label="Sand (Mortar)"
              value={r.foundationSandCft}
              unit="cft"
              modifier="green"
            />
          </div>
        </div>
      )}

      {r.includeFoundation && r.foundationVolCum > 0 && (
        <div
          className="calc-card brick-grand-card"
          style={{ borderLeft: "4px solid var(--color-accent, #ed8936)" }}
        >
          <h4 className="calc-card-subtitle">
            <span>📦</span> Grand Total (Superstructure + Foundation)
          </h4>
          <div className="calc-highlight-grid">
            <HighlightCard
              label="Total Bricks (incl. wastage)"
              value={r.totalBricksWithWaste.toLocaleString("en-IN")}
              unit="nos"
              modifier="accent"
            />
            <HighlightCard
              label="Total Cement"
              value={r.totalCementBags}
              unit="bags (50 kg)"
              modifier="purple"
            />
            <HighlightCard
              label="Total Sand"
              value={r.totalSandCft}
              unit="cft"
              modifier="green"
            />
          </div>
        </div>
      )}

      <div className="calc-card brick-labour-card">
        <h4 className="calc-card-subtitle">
          <span>👷</span> Labour Estimate
        </h4>
        <div className="calc-detail-grid">
          <DetailItem label="Mason (Skilled)" value={`${r.masonDays} days`} />
          <DetailItem
            label="Helper (Unskilled)"
            value={`${r.helperDays} days`}
          />
          <DetailItem
            label="Total Man-Days"
            value={`${Math.round((r.masonDays + r.helperDays) * 10) / 10} days`}
          />
          <DetailItem label="Reference" value="IS 456:2000 / PWD norms" />
        </div>
      </div>

      <div className="calc-note">
        <strong>📌 Notes:</strong>
        <ul>
          <li>
            Perimeter wall area calculated from all 4 outer sides × all floors.
          </li>
          <li>Door &amp; window counts are total for the entire building.</li>
          <li>
            Mortar joint thickness assumed <strong>10 mm</strong> as per IS
            1905.
          </li>
          <li>
            Mortar volume fraction assumed <strong>30%</strong> of gross
            brickwork volume.
          </li>
          <li>Cement quantities include 20% bulking allowance for sand.</li>
          <li>
            Foundation brickwork uses the same brick type and mortar ratio as
            the superstructure; no deductions are applied to the foundation.
          </li>
          <li>
            Labour estimate now covers total brickwork volume (superstructure +
            foundation).
          </li>
          <li>
            Order bricks in multiples of 500; always add a 5–10% safety margin.
          </li>
        </ul>
      </div>
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
