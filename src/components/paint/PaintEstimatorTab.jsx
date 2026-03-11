import { PaintEstimatorForm } from "./PaintEstimatorForm";
import { PaintEstimatorResults } from "./PaintEstimatorResults";

export function PaintEstimatorTab({
  inputs,
  onInputChange,
  onReset,
  onCalculate,
  results,
}) {
  return (
    <div className="calc-result-card">
      <h3 className="calc-breakdown-header">
        <span>🎨</span> Paint Quantity Estimator
      </h3>

      <PaintEstimatorForm
        inputs={inputs}
        onInputChange={onInputChange}
        onCalculate={onCalculate}
        onReset={onReset}
      />

      {results && !results.error && <PaintEstimatorResults results={results} />}
      
      {results?.error && (
        <div className="calc-alert calc-alert-error" style={{ marginTop: "1.5rem" }}>
          <strong>Error:</strong> {results.error}
        </div>
      )}
    </div>
  );
}

export default PaintEstimatorTab;
