// Shared formatting helpers for design tabs

export const safeFormat = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) return "N/A";
  return Number(value).toFixed(decimals);
};

export const safeGet = (obj, path, fallback = "N/A") => {
  try {
    const value = path.split(".").reduce((acc, part) => acc?.[part], obj);
    return value !== undefined && value !== null ? value : fallback;
  } catch {
    return fallback;
  }
};

// ===========================
// FORMAT HELPERS
// Formatting utility functions for display/output
// ===========================

/**
 * 1. Format a number as Indian Rupee currency string.
 * @param {number} amount
 * @returns {string}  e.g. "₹1,23,456"
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * 2. Format a number with fixed decimal places, using Indian locale.
 * @param {number} number
 * @param {number} decimals
 * @returns {string}
 */
export function formatNumber(number, decimals = 2) {
  return number.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * 3. Convert a float to a percentage string.
 * @param {number} value  e.g. 0.75
 * @param {number} decimals
 * @returns {string}  "75.0%"
 */
export function toPercent(value, decimals = 1) {
  return `${(value * 100).toFixed(decimals)}%`;
}