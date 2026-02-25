import { useState } from "react";
import { designBeam } from "../utils/beamDesign";

const DEFAULT_INPUTS = {
  Mu: "",
  Vu: "",
  b: "",
  D: "",
  span: "",
  fck: "25",
  fy: "500",
  cover: "30",
};

export function useBeamDesign() {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [results, setResults] = useState(null);

  const handleInputChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const calculate = () => {
    try {
      if (!inputs.Mu || !inputs.Vu || !inputs.b || !inputs.D) {
        setResults({
          error:
            "Please fill in all required fields: Mu, Vu, b (width), and D (depth)",
        });
        return;
      }

      const numericInputs = {
        ...inputs,
        Mu: parseFloat(inputs.Mu),
        Vu: parseFloat(inputs.Vu),
        b: parseFloat(inputs.b),
        D: parseFloat(inputs.D),
        span: inputs.span ? parseFloat(inputs.span) : null,
        fck: parseFloat(inputs.fck),
        fy: parseFloat(inputs.fy),
        cover: parseFloat(inputs.cover),
      };

      if (
        Object.values(numericInputs).some((val) => val !== null && isNaN(val))
      ) {
        setResults({
          error: "Please enter valid numeric values for all fields",
        });
        return;
      }

      const result = designBeam(numericInputs);
      if (!result || typeof result !== "object") {
        setResults({
          error: "Beam design calculation returned invalid results",
        });
        return;
      }

      setResults(result);
    } catch (error) {
      console.error("Beam calculation error:", error);
      setResults({
        error:
          error.message || "An error occurred during beam design calculation",
      });
    }
  };

  const populateFromStructure = (structureDesign) => {
    const beamSize = structureDesign.beams.size;
    // Use a regex that matches both the correct × character and any
    // mojibake variants (Ã—, ×, ✕, x, X) that may appear depending
    // on how the string was encoded or copy-pasted.
    const sizeParts = beamSize.replace(/"/g, "").split(/\s*[×Ã—✕xX]\s*/);

    if (sizeParts.length === 2) {
      const width = parseFloat(sizeParts[0].trim()) * 25.4;
      const depth = parseFloat(sizeParts[1].trim()) * 25.4;
      setInputs((prev) => ({
        ...prev,
        b: Math.round(width).toString(),
        D: Math.round(depth).toString(),
        fck: "20",
        fy: "500",
      }));
    }
  };

  /**
   * Populate Mu, Vu (and span) from slab beam-load calculation.
   * @param {object} beamLoadEntry  — one of beamLoads.beamOnShortSide or beamOnLongSide
   * @param {string} slabFck        — concrete grade from slab (to keep grades consistent)
   * @param {string} slabFy         — steel grade from slab
   */
  const populateFromSlab = (beamLoadEntry, slabFck, slabFy) => {
    if (!beamLoadEntry) return;
    setInputs((prev) => ({
      ...prev,
      Mu: beamLoadEntry.Mu.toString(),
      Vu: beamLoadEntry.Vu.toString(),
      span: (beamLoadEntry.span * 1000).toString(), // convert m → mm
      fck: slabFck || prev.fck,
      fy: slabFy || prev.fy,
    }));
    setResults(null); // clear old results so user re-clicks Design Beam
  };

  return {
    inputs,
    results,
    handleInputChange,
    calculate,
    populateFromStructure,
    populateFromSlab,
  };
}
