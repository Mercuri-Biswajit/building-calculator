import { createContext, useContext, useState } from "react";

const UnitContext = createContext();

export function UnitProvider({ children }) {
  const [unit, setUnit] = useState("feet"); // "feet" or "meters"

  // Helper for displaying area
  const displayArea = (sqftValue) => {
    if (typeof sqftValue !== "number") return sqftValue;
    return unit === "meters"
      ? Number((sqftValue * 0.09290304).toFixed(2))
      : Math.round(sqftValue);
  };

  // Helper for rates (e.g. ₹/sqft to ₹/sqm)
  const displayRate = (ratePerSqft) => {
    if (typeof ratePerSqft !== "number") return ratePerSqft;
    // 1 sqm = 10.7639 sqft. So rate per sqm is rate per sqft * 10.7639
    return unit === "meters"
      ? Math.round(ratePerSqft * 10.76391)
      : Math.round(ratePerSqft);
  };

  const getAreaLabel = () => (unit === "meters" ? "sq.m" : "sq.ft");
  const getLengthLabel = () => (unit === "meters" ? "m" : "feet");
  const getLabelShort = () => (unit === "meters" ? "m" : "ft");

  return (
    <UnitContext.Provider
      value={{
        unit,
        setUnit,
        displayArea,
        displayRate,
        getAreaLabel,
        getLengthLabel,
        getLabelShort,
      }}
    >
      {children}
    </UnitContext.Provider>
  );
}

export const useUnit = () => useContext(UnitContext);
