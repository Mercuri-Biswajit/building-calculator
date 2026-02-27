// ── Staircase Design ────────────────────────────────────────────────────────
export function StaircaseDesign({ design }) {
  return (
    <div className="calc-result-card">
      <h3 className="calc-breakdown-header">
        <span>🪜</span> Staircase Design Specifications
      </h3>

      <div className="calc-struct-grid">
        <Card
          icon="📏"
          title="Riser Height"
          value={`${design.riser}mm`}
          sub="NBC 2016 Compliant"
        />
        <Card
          icon="📐"
          title="Tread Width"
          value={`${design.tread}mm`}
          sub={design.checkPass}
        />
        <Card
          icon="🔢"
          title="Steps Per Flight"
          value={design.risersPerFlight}
          sub={`${design.totalFlights} total flights`}
        />
        <Card
          icon="⚡"
          title="Waist Slab"
          value={`${design.waistSlab}mm`}
          sub="Structural thickness"
        />
        <Card
          icon="📊"
          title="Stair Width"
          value={`${design.stairWidth}mm`}
          sub="Clear width"
        />
        <Card
          icon="📏"
          title="Headroom"
          value={design.headroom}
          sub="Vertical clearance"
        />
      </div>

      <div className="calc-note">
        <strong>🔧 Reinforcement:</strong> Main bars {design.mainBarDia}mm @{" "}
        {design.mainBarSpacing}mm c/c, Distribution bars {design.distBarDia}mm @{" "}
        {design.distBarSpacing}mm c/c
      </div>
    </div>
  );
}

// ── Foundation Design ────────────────────────────────────────────────────────
export function FoundationDesign({ footing }) {
  return (
    <div className="calc-result-card">
      <h3 className="calc-breakdown-header">
        <span>🏗️</span> Foundation Design Details
      </h3>

      <div className="calc-struct-grid">
        <Card
          icon="📐"
          title="Footing Size"
          value={footing.size}
          sub="Isolated footing"
        />
        <Card
          icon="📏"
          title="Footing Depth"
          value={`${footing.depth}mm`}
          sub="Structural depth"
        />
        <Card
          icon="⚖️"
          title="Column Load"
          value={`${footing.columnLoad.toFixed(1)}kN`}
          sub="Factored load"
        />
        <Card
          icon="🌍"
          title="SBC"
          value={`${footing.sbc}kN/m²`}
          sub="Safe bearing capacity"
        />
      </div>

      <div className="calc-note">
        <strong>💡 Design Note:</strong> Foundation designed as per IS 1904 and
        IS 456:2000. Use M20 grade concrete with{" "}
        {footing.reinforcement || "12mm bars @ 150mm c/c both ways"}.
      </div>
    </div>
  );
}

// ── Complete BBS ─────────────────────────────────────────────────────────────
export function CompleteBBS({ barBending, completeBBS }) {
  return (
    <div className="calc-result-card">
      <h3 className="calc-breakdown-header">
        <span>📋</span> Complete Bar Bending Schedule
      </h3>

      <div className="calc-bbs-summary">
        <div className="calc-bbs-total">
          <div className="calc-bbs-total-label">Total Steel Requirement</div>
          <div className="calc-bbs-total-value">
            {completeBBS.totalWeight.toFixed(0)} kg
          </div>
        </div>

        <div className="calc-struct-grid" style={{ marginBottom: "2rem" }}>
          <Card
            icon="📊"
            title="Base Quantity"
            value={`${completeBBS.totalWeight.toFixed(0)} kg`}
            sub="Calculated requirement"
          />
          <Card
            icon="⚖️"
            title="Wastage Allowance"
            value={`${completeBBS.wastageAllowance} kg`}
            sub="7% wastage factor"
          />
          <div
            className="calc-struct-card"
            style={{ borderColor: "var(--color-accent)" }}
          >
            <div className="calc-struct-icon">📦</div>
            <div className="calc-struct-title">Final Order Quantity</div>
            <div
              className="calc-struct-value"
              style={{ color: "var(--color-accent)" }}
            >
              {completeBBS.finalOrderQuantity} kg
            </div>
            <div className="calc-struct-sub">Including wastage</div>
          </div>
        </div>

        <h4 className="calc-struct-section-title">
          Steel Distribution by Diameter
        </h4>
        <div className="calc-bbs-grid">
          {Object.entries(barBending.breakdown).map(([dia, weight]) => (
            <div key={dia} className="calc-bbs-card">
              <div className="calc-bbs-weight">{weight.toFixed(0)} kg</div>
              <div className="calc-bbs-label">{dia}</div>
              <div className="calc-bbs-pct">
                {((weight / barBending.totalWeight) * 100).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      <h4 className="calc-struct-section-title" style={{ marginTop: "2rem" }}>
        Detailed Cutting & Bending Schedule
      </h4>
      <div className="calc-timeline-table">
        <table className="calc-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Bar Dia</th>
              <th>Quantity</th>
              <th>Length (mm)</th>
              <th>Shape</th>
              <th>Total Weight (kg)</th>
              <th>Bending Details</th>
            </tr>
          </thead>
          <tbody>
            {completeBBS.items.map((item, idx) => (
              <tr key={idx}>
                <td>
                  <strong>{item.member}</strong>
                </td>
                <td>{item.barDia}</td>
                <td>{item.quantity}</td>
                <td>{item.length}</td>
                <td>{item.shape}</td>
                <td>
                  <strong>{item.totalWeight}</strong>
                </td>
                <td
                  style={{ fontSize: "0.8rem", color: "var(--color-text-dim)" }}
                >
                  {item.bendingDetails}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="calc-note">
        <strong>📌 Fabricator Instructions:</strong>
        <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
          <li>All bars to be Fe500 grade TMT steel</li>
          <li>Hooks: 135° bends with extension of 10d minimum</li>
          <li>Lap length: As specified, typically 40–50 times bar diameter</li>
          <li>Cutting tolerance: ±10mm for lengths above 3m</li>
          <li>Store bars off ground on wooden battens to prevent rusting</li>
        </ul>
      </div>
    </div>
  );
}

// ── Shared Card ──────────────────────────────────────────────────────────────
function Card({ icon, title, value, sub }) {
  return (
    <div className="calc-struct-card">
      <div className="calc-struct-icon">{icon}</div>
      <div className="calc-struct-title">{title}</div>
      <div className="calc-struct-value">{value}</div>
      <div className="calc-struct-sub">{sub}</div>
    </div>
  );
}
