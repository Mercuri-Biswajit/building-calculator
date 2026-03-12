import React from "react";
import { Button } from "./Button";
import "./SaveEstimateButton.css";

export function SaveEstimateButton({ onSave, className = "" }) {
  return (
    <div className={`sys-save-estimate-container ${className}`}>
      <div className="sys-save-estimate-content">
        <div className="sys-save-text">
          <h4>Ready to Save?</h4>
          <p>Save this estimate with all current inputs for future reference.</p>
        </div>
        <Button variant="primary" onClick={onSave} icon="💾" className="sys-save-btn">
          Save Estimate
        </Button>
      </div>
    </div>
  );
}
