import { useState } from "react";

import { calcBuilding, calcSlab } from "../utils/calculator/core";
import { CALCULATOR_DEFAULTS } from "../config/constants";
import { safeFloat } from "../utils/helpers";

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT STATE
// ═══════════════════════════════════════════════════════════════════════════

const INITIAL_INPUTS = {
  // Building Parameters
  area: "",
  rate: "",

  // Labor Cost
  laborAuto: true,
  laborPercent: CALCULATOR_DEFAULTS.laborPercent,
  laborManual: "",

  // Finishing & Contingency
  finishingQuality: CALCULATOR_DEFAULTS.finishingQuality,
  contingency: CALCULATOR_DEFAULTS.contingency,

  // Material Rates (optional custom rates)
  cementRate: "",
  steelRate: "",
  sandRate: "",
  aggregateRate: "",

  // RCC Slab Parameters
  slabArea: "",
  slabThickness: CALCULATOR_DEFAULTS.slabThickness,
};

// ═══════════════════════════════════════════════════════════════════════════
// CUSTOM HOOK: useCalculator
// ═══════════════════════════════════════════════════════════════════════════

/**
 * useCalculator - Manages all calculator state and logic
 *
 * Encapsulates building cost estimation and RCC slab calculation functionality.
 * Provides a clean interface for the CalculatorsPage component.
 *
 * @returns {Object} Calculator state and actions
 * @returns {Object} inputs - Current form input values
 * @returns {Object|null} buildingResults - Building estimate results
 * @returns {Object|null} slabResults - RCC slab calculation results
 * @returns {Function} updateField - Update a single input field
 * @returns {Function} calculateBuilding - Run building cost estimation
 * @returns {Function} calculateSlab - Run RCC slab calculation
 * @returns {Function} reset - Reset all inputs and results
 */
export function useCalculator() {
  // ─────────────────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────────────────

  const [inputs, setInputs] = useState(INITIAL_INPUTS);
  const [buildingResults, setBuildingResults] = useState(null);
  const [slabResults, setSlabResults] = useState(null);

  // ─────────────────────────────────────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Update a single input field
   * Handles both text inputs and checkboxes
   *
   * @param {string} field - Name of the field to update
   * @returns {Function} Event handler function
   *
   * @example
   * <input value={inputs.area} onChange={updateField('area')} />
   * <input type="checkbox" checked={inputs.laborAuto} onChange={updateField('laborAuto')} />
   */
  const updateField = (field) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;

    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Calculate building construction estimate
   * Validates inputs and computes material quantities, labor, finishing, and total cost
   */
  const calculateBuilding = () => {
    // Parse and validate area
    const area = safeFloat(inputs.area, 0);
    if (area <= 0) {
      alert("Please enter a valid built-up area (must be greater than 0).");
      return;
    }

    // Parse and validate rate
    const rate = safeFloat(inputs.rate, 0);
    if (rate <= 0) {
      alert("Please enter a valid rate per sq.ft (must be greater than 0).");
      return;
    }

    // Prepare calculation parameters
    const params = {
      area,
      rate,
      laborAuto: inputs.laborAuto,
      laborPercent: safeFloat(
        inputs.laborPercent,
        CALCULATOR_DEFAULTS.laborPercent,
      ),
      laborManual: safeFloat(inputs.laborManual, 0),
      finishingQuality: inputs.finishingQuality,
      contingency: safeFloat(
        inputs.contingency,
        CALCULATOR_DEFAULTS.contingency,
      ),
      materialRates: {
        cement: inputs.cementRate,
        steel: inputs.steelRate,
        sand: inputs.sandRate,
        aggregate: inputs.aggregateRate,
      },
    };

    // Calculate and store results
    const results = calcBuilding(params);
    setBuildingResults(results);
  };

  /**
   * Calculate RCC slab requirements
   * Validates inputs and computes concrete volume, cement, and steel needed
   */
  const calculateSlab = () => {
    // Parse and validate slab area
    const slabArea = safeFloat(inputs.slabArea, 0);
    if (slabArea <= 0) {
      alert("Please enter a valid slab area (must be greater than 0).");
      return;
    }

    // Parse and validate slab thickness
    const slabThickness = safeFloat(inputs.slabThickness, 0);
    if (slabThickness <= 0) {
      alert("Please enter a valid slab thickness (must be greater than 0).");
      return;
    }

    // Calculate and store results
    const results = calcSlab(slabArea, slabThickness);
    setSlabResults(results);
  };

  /**
   * Reset all inputs and clear all results
   * Returns form to initial state
   */
  const reset = () => {
    setInputs(INITIAL_INPUTS);
    setBuildingResults(null);
    setSlabResults(null);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RETURN API
  // ─────────────────────────────────────────────────────────────────────────

  return {
    // State
    inputs,
    buildingResults,
    slabResults,

    // Actions
    updateField,
    calculateBuilding,
    calculateSlab,
    reset,
  };
}
