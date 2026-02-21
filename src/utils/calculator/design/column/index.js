/* eslint-disable no-unused-vars */
// ═══════════════════════════════════════════════════════════════════════════
// COLUMN DESIGN - MODULE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

import { COLUMN_CONSTANTS } from "./columnConstants";
import {
  calcEffectiveLength,
  checkSlenderness,
  calcMinimumEccentricity,
} from "./columnHelpers";
import { designAxialColumn } from "./columnAxial";
import { designUniaxialColumn } from "./columnUniaxial";
import { designBiaxialColumn, checkBiaxialInteraction } from "./columnBiaxial";
import { designColumnBars } from "./columnBars";
import { designColumnTies } from "./columnTies";

export { COLUMN_CONSTANTS };
export { calcEffectiveLength, checkSlenderness, calcMinimumEccentricity };
export { designAxialColumn };
export { designUniaxialColumn };
export { designBiaxialColumn, checkBiaxialInteraction };
export { designColumnBars };
export { designColumnTies };

// Main design function

export function designColumn(inputs) {
  const {
    Pu,
    Mux,
    Muy,
    b,
    D,
    L,
    fck,
    fy,
    restraintX,
    restraintY,
    cover,
    exposure,
  } = inputs;

  if (!Pu || !b || !D || !L || !fck || !fy) {
    return { error: "Missing required inputs" };
  }

  const lex = calcEffectiveLength(L, restraintX || "both-hinged");
  const ley = calcEffectiveLength(L, restraintY || "both-hinged");
  const slenderness = checkSlenderness(lex, ley, b, D);
  const minEcc = calcMinimumEccentricity(lex, ley, b, D);

  const ex_actual = Mux
    ? Math.max((Mux * 1000000) / (Pu * 1000), minEcc.ex_min)
    : minEcc.ex_min;
  const ey_actual = Muy
    ? Math.max((Muy * 1000000) / (Pu * 1000), minEcc.ey_min)
    : minEcc.ey_min;

  const Mux_design = Math.max(Mux || 0, (Pu * ex_actual) / 1000);
  const Muy_design = Math.max(Muy || 0, (Pu * ey_actual) / 1000);

  let designResult, designType;

  if (!Mux && !Muy) {
    designType = "axial";
    designResult = designAxialColumn(Pu, b, D, fck, fy, cover);
  } else if (
    Mux_design > 0 &&
    (!Muy_design || Muy_design < 0.05 * Mux_design)
  ) {
    designType = "uniaxial-major";
    designResult = designUniaxialColumn(
      Pu,
      Mux_design,
      b,
      D,
      fck,
      fy,
      cover,
      "major",
    );
  } else if (
    Muy_design > 0 &&
    (!Mux_design || Mux_design < 0.05 * Muy_design)
  ) {
    designType = "uniaxial-minor";
    designResult = designUniaxialColumn(
      Pu,
      Muy_design,
      D,
      b,
      fck,
      fy,
      cover,
      "minor",
    );
  } else {
    designType = "biaxial";
    designResult = designBiaxialColumn(
      Pu,
      Mux_design,
      Muy_design,
      b,
      D,
      fck,
      fy,
      cover,
    );
  }

  const longitudinalBarDia = designResult.barOptions
    ? designResult.barOptions[0].diameter
    : 20;
  const ties = designColumnTies(longitudinalBarDia, b, D, fy);
  const loadFactor = designResult.Pu_capacity / Pu;

  return {
    inputs: { Pu, Mux, Muy, Mux_design, Muy_design, b, D, L, fck, fy, cover },
    effectiveLengths: {
      lex,
      ley,
      restraintX: restraintX || "both-hinged",
      restraintY: restraintY || "both-hinged",
    },
    slenderness,
    eccentricity: {
      ex_min: minEcc.ex_min,
      ey_min: minEcc.ey_min,
      ex_actual,
      ey_actual,
    },
    design: { type: designType, ...designResult },
    ties,
    summary: {
      designType,
      classification: slenderness.classification,
      longitudinalSteel: designResult.barOptions
        ? designResult.barOptions[0].description
        : "N/A",
      lateralTies: ties.description,
      reinforcementRatio: designResult.p_required
        ? `${designResult.p_required.toFixed(2)}%`
        : "N/A",
      loadCapacity: designResult.Pu_capacity
        ? `${designResult.Pu_capacity.toFixed(2)} kN`
        : "N/A",
      loadFactor: loadFactor ? loadFactor.toFixed(2) : "N/A",
      status: designResult.status,
    },
  };
}

export default designColumn;
