import { useUnit } from "../../context/UnitContext";
import "./PaintEstimatorResults.css";

export function PaintEstimatorResults({ results: r }) {
  const canEntries = Object.entries(r.cans).filter(([, count]) => count > 0);
  const { displayArea, getAreaLabel } = useUnit();

  return (
    <div className="paint-results-container">
      <div className="calc-struct-section">
        <h4 className="calc-struct-section-title">
          <span>📐</span> Surface Area Breakdown
        </h4>
        <div className="calc-struct-grid">
          <StructCard
            icon="🧱"
            title="Wall Area"
            value={`${displayArea(r.wallArea)} ${getAreaLabel()}`}
            sub="Gross wall surface"
          />
          <StructCard
            icon="🪟"
            title="Openings"
            value={`${displayArea(r.deductions)} ${getAreaLabel()}`}
            sub="Doors + Windows (deducted)"
          />
          <StructCard
            icon="⬜"
            title="Ceiling Area"
            value={`${displayArea(r.ceilingArea)} ${getAreaLabel()}`}
            sub="Flat ceiling"
          />
          <StructCard
            icon="✅"
            title="Total Net Area"
            value={`${displayArea(r.totalArea)} ${getAreaLabel()}`}
            sub="Paintable surface"
          />
        </div>
      </div>

      <div className="calc-card paint-qty-card">
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
        <div className="calc-detail-grid paint-detail-grid">
          <DetailItem
            label="Coverage Rate"
            value={`${displayArea(r.coverage)} ${getAreaLabel()} / litre`}
          />
          <DetailItem label="Number of Coats" value={r.coats} />
          <DetailItem label="Painter Labour" value={`${r.painterDays} days`} />
          <DetailItem label="Reference" value="IS 15489 / Manufacturer spec" />
        </div>
      </div>

      {canEntries.length > 0 && (
        <div className="calc-card paint-cans-card">
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

      <div className="calc-card paint-brand-card">
        <h4 className="calc-card-subtitle">
          <span>🏷️</span> Brand Reference
        </h4>
        <div className="calc-table-container paint-table-container">
          <table className="calc-table">
            <thead>
              <tr>
                <th>Brand</th>
                <th>Product</th>
                <th>Coverage ({getAreaLabel()}/L)</th>
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
                    <td>{displayArea(b.coverage)}</td>
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
