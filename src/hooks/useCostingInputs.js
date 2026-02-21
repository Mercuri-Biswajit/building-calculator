import { useState } from "react";

const DEFAULT_INPUTS = {
  length: "",
  breadth: "",
  floors: 1,
  floorHeight: "10",
  buildingType: "residential",
  finishGrade: "standard",
  soilCondition: "normal",
  region: "tier3",
  includeBasement: false,
  basementDepth: "8",
  includeStaircase: true,
  columnSize: "9x12",
  avgColumnSpan: "12",
  customCementRate: "",
  customSteelRate: "",
  customSandRate: "",
  customAggregateRate: "",
};

export function useCostingInputs() {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);

  const updateField = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const resetInputs = () => setInputs(DEFAULT_INPUTS);

  return { inputs, updateField, resetInputs };
}