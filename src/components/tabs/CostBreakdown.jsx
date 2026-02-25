import { formatCurrency } from "../../utils/calculator/shared/formatHelpers";

export function CostBreakdown({ results }) {
  const maxCost = Math.max(...Object.values(results.breakdown));

  return (
    <div className="calc-result-card">
      <h3 className="calc-breakdown-header">
        <span>💰</span> Detailed Cost Breakdown
      </h3>

      <div className="calc-breakdown-list">
        {Object.entries(results.breakdown).map(([key, cost]) => {
          const percentage = Math.round((cost / results.totalCost) * 100);
          const barWidth = Math.round((cost / maxCost) * 100);
          return (
            <div key={key} className="calc-breakdown-row">
              <span className="calc-breakdown-name">
                {key.replace(/([A-Z])/g, " $1").trim()} ({percentage}%)
              </span>
              <div className="calc-breakdown-bar-wrap">
                <div
                  className="calc-breakdown-bar calc-bar-primary"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              <div className="calc-breakdown-right">
                <span className="calc-breakdown-cost">
                  {formatCurrency(cost)}
                </span>
                {results.quantities?.[key] && (
                  <span className="calc-breakdown-qty">
                    {results.quantities[key]}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="calc-note">
        <strong>📌 Note:</strong> Costs are estimated based on current market
        rates and standard specifications. Actual costs may vary based on site
        conditions, material quality, and local factors.
      </div>
    </div>
  );
}
