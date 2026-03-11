import { BrickMasonryForm } from "./BrickMasonryForm";
import { BrickMasonryResults } from "./BrickMasonryResults";

export function BrickMasonryTab({
  inputs,
  onInputChange,
  onCalculate,
  onReset,
  results,
}) {
  return (
    <div className="calc-result-card">
      <h3 className="calc-breakdown-header">
        <span>🧱</span> Brick Masonry Quantity Calculator
      </h3>

      <BrickMasonryForm
        inputs={inputs}
        onInputChange={onInputChange}
        onCalculate={onCalculate}
        onReset={onReset}
      />

      {/* ── Results ──────────────────────────────────────────────────── */}
      {results && !results.error && <BrickMasonryResults results={results} />}
      
      {results?.error && (
        <div className="calc-alert calc-alert-error" style={{ marginTop: "1.5rem" }}>
          <strong>Error:</strong> {results.error}
        </div>
      )}
    </div>
  );
}

export default BrickMasonryTab;
