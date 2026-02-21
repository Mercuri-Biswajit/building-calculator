// Column Design Helper Functions
import { COLUMN_CONSTANTS } from './columnConstants';

export function calcEffectiveLength(unsupportedLength, restraintConditions) {
  const factor = COLUMN_CONSTANTS.effectiveLengthFactors[restraintConditions] || 1.00;
  return unsupportedLength * factor;
}

export function checkSlenderness(lex, ley, b, D) {
  const slenderness_x = lex / D;
  const slenderness_y = ley / b;
  const isShort_x = slenderness_x < 12;
  const isShort_y = slenderness_y < 12;
  
  return {
    slenderness_x,
    slenderness_y,
    isShort_x,
    isShort_y,
    isShort: isShort_x && isShort_y,
    classification: (isShort_x && isShort_y) ? 'Short Column' : 'Slender Column'
  };
}

export function calcMinimumEccentricity(lex, ley, b, D) {
  const ex_min = Math.max(lex / 500 + D / 30, 20);
  const ey_min = Math.max(ley / 500 + b / 30, 20);
  return { ex_min, ey_min };
}
