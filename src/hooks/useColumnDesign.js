import { useState } from "react";
import { designColumn } from "../utils";

const DEFAULT_INPUTS = {
  Pu: "",
  Mux: "",
  Muy: "",
  b: "",
  D: "",
  L: "",
  fck: "25",
  fy: "500",
  cover: "40",
  restraintX: "both-hinged",
  restraintY: "both-hinged",
};

export function useColumnDesign() {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [results, setResults] = useState(null);

  const handleInputChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const calculate = () => {
    try {
      if (!inputs.Pu || !inputs.b || !inputs.D || !inputs.L) {
        setResults({
          error:
            "Please fill in all required fields: Pu, b (width), D (depth), and L (length)",
        });
        return;
      }

      const numericInputs = {
        ...inputs,
        Pu: parseFloat(inputs.Pu),
        Mux: inputs.Mux ? parseFloat(inputs.Mux) : 0,
        Muy: inputs.Muy ? parseFloat(inputs.Muy) : 0,
        b: parseFloat(inputs.b),
        D: parseFloat(inputs.D),
        L: parseFloat(inputs.L),
        fck: parseFloat(inputs.fck),
        fy: parseFloat(inputs.fy),
        cover: parseFloat(inputs.cover),
      };

      const numericFields = [
        "Pu",
        "Mux",
        "Muy",
        "b",
        "D",
        "L",
        "fck",
        "fy",
        "cover",
      ];
      if (numericFields.some((f) => isNaN(numericInputs[f]))) {
        setResults({
          error: "Please enter valid numeric values for all fields",
        });
        return;
      }

      const result = designColumn(numericInputs);
      if (!result || typeof result !== "object") {
        setResults({
          error: "Column design calculation returned invalid results",
        });
        return;
      }

      setResults(result);
    } catch (error) {
      console.error("Column calculation error:", error);
      setResults({
        error:
          error.message || "An error occurred during column design calculation",
      });
    }
  };

  const populateFromStructure = (structureDesign, floorHeight) => {
    const columnSize = structureDesign.columns.size;
    const sizeParts = columnSize.replace(/"/g, "").split("×");
    if (sizeParts.length === 2) {
      const width = parseFloat(sizeParts[0].trim()) * 25.4;
      const depth = parseFloat(sizeParts[1].trim()) * 25.4;
      const floorHeightMm = parseFloat(floorHeight) * 304.8;
      setInputs((prev) => ({
        ...prev,
        b: Math.round(width).toString(),
        D: Math.round(depth).toString(),
        L: Math.round(floorHeightMm).toString(),
        fck: "20",
        fy: "500",
      }));
    }
  };

  /**
   * Populate Pu from slab column-load calculation.
   * @param {object} columnLoad  — result of computeColumnLoad() from useSlabDesign
   * @param {string} position    — "interior" | "edge" | "corner"
   * @param {string} slabFck     — concrete grade from slab
   * @param {string} slabFy      — steel grade from slab
   */
  const populateFromSlab = (columnLoad, position, slabFck, slabFy) => {
    if (!columnLoad) return;
    const PuMap = {
      interior: columnLoad.Pu_interior,
      edge: columnLoad.Pu_edge,
      corner: columnLoad.Pu_corner,
    };
    const Pu = PuMap[position] ?? columnLoad.Pu_interior;
    setInputs((prev) => ({
      ...prev,
      Pu: Pu.toString(),
      fck: slabFck || prev.fck,
      fy: slabFy || prev.fy,
    }));
    setResults(null);
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
