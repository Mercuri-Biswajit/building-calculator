import { useState } from "react";
import { ITEM_RATES, MATERIAL_RATES, LABOUR_RATES } from "../utils/calculator/rates/standard";
import { PROJECT_TYPES } from "../data/projectTypes";

// ── Defaults ────────────────────────────────────────────────────────────────
const DEFAULTS = {
  projectName:"", projectTypeId:"rcc_footing",
  length:"", breadth:"", height:"", footingDepth:"", foundDepth:"",
  qty:"1", floors:1, floorHeight:"10",
  buildingType:"residential", soilCondition:"normal", wallType:"full",
  grade:"M20", steelGrade:"Fe415",
};

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useProjectEstimator() {
  const [inputs,  setInputs]  = useState(DEFAULTS);
  const [result,  setResult]  = useState(null);
  const [history, setHistory] = useState([]);
  const [errors,  setErrors]  = useState({});

  const currentType = PROJECT_TYPES.find(p => p.id === inputs.projectTypeId) ?? PROJECT_TYPES[0];

  const updateField = (field) => (e) => {
    const value = e.target.value;
    setInputs(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const changeProjectType = (id) => {
    setInputs(prev => ({
      ...DEFAULTS,
      projectName:   prev.projectName,
      grade:         prev.grade,
      steelGrade:    prev.steelGrade,
      soilCondition: prev.soilCondition,
      buildingType:  prev.buildingType,
      projectTypeId: id,
    }));
    setResult(null);
    setErrors({});
  };

  const validate = () => {
    const e = {};
    if (!inputs.projectName.trim()) e.projectName = "Project name required";
    currentType.fields.forEach(f => {
      if (f.type === "number" && (!inputs[f.id] || +inputs[f.id] <= 0))
        e[f.id] = `Enter valid ${f.label.toLowerCase()}`;
    });
    return e;
  };

  const calculate = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    const rates = { ITEM: ITEM_RATES, MAT: MATERIAL_RATES, LAB: LABOUR_RATES };
    setResult(currentType.compute(inputs, rates));
  };

  const save = () => {
    if (!result) return;
    setHistory(prev => [{
      id: Date.now(),
      projectName: inputs.projectName,
      projectType: currentType.label,
      grade:       inputs.grade,
      date:        new Date().toLocaleDateString("en-IN"),
      grandTotal:  result.grandTotal,
    }, ...prev]);
    alert("✅ Estimate saved!");
  };

  const clear = () => { setInputs(DEFAULTS); setResult(null); setErrors({}); };

  return { inputs, updateField, changeProjectType, errors, currentType, PROJECT_TYPES, result, calculate, save, clear, history };
}